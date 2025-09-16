import { BigQuery } from '@google-cloud/bigquery';

interface TableDataOptions {
  limit?: number;
  offset?: number;
  filters?: any[];
  sorts?: any[];
  search?: string;
  columns?: string[];
  orderBy?: string;
  where?: string;
}

interface TableInfo {
  name: string;
  id: string;
  type: string;
  numRows?: string;
  numBytes?: string;
  createdTime?: string;
  modifiedTime?: string;
  description?: string;
}

interface DatasetInfo {
  id: string;
  name: string;
  description?: string;
  location?: string;
}

class BigQueryService {
  private bigquery: BigQuery;
  private projectId: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'hockey-data-analysis';
    
    // Initialize BigQuery client
    this.bigquery = new BigQuery({
      projectId: this.projectId,
      // Credentials will be loaded from environment or service account file
    });
    
    console.log(`BigQuery service initialized for project: ${this.projectId}`);
  }

  async getDatasets(): Promise<DatasetInfo[]> {
    try {
      console.log('Fetching datasets from BigQuery...');
      const [datasets] = await this.bigquery.getDatasets();
      
      const result = datasets.map(dataset => ({
        id: dataset.id!,
        name: dataset.id!,
        description: dataset.metadata?.description || '',
        location: dataset.metadata?.location || 'US'
      }));
      
      console.log(`Found ${result.length} datasets`);
      return result;
    } catch (error: any) {
      console.error('Error fetching datasets:', error.message);
      throw new Error(`Failed to fetch datasets: ${error.message}`);
    }
  }

  async getTables(datasetId: string): Promise<TableInfo[]> {
    try {
      console.log(`Fetching tables from dataset: ${datasetId}`);
      const dataset = this.bigquery.dataset(datasetId);
      const [tables] = await dataset.getTables();
      
      const result = await Promise.all(
        tables.map(async (table) => {
          try {
            const [metadata] = await table.getMetadata();
            return {
              name: table.id!,
              id: table.id!,
              type: metadata.type || 'TABLE',
              numRows: metadata.numRows || '0',
              numBytes: metadata.numBytes || '0',
              createdTime: metadata.creationTime ? new Date(parseInt(metadata.creationTime)).toISOString() : '',
              modifiedTime: metadata.lastModifiedTime ? new Date(parseInt(metadata.lastModifiedTime)).toISOString() : '',
              description: metadata.description || ''
            };
          } catch (metadataError) {
            console.warn(`Could not fetch metadata for table ${table.id}:`, metadataError);
            return {
              name: table.id!,
              id: table.id!,
              type: 'TABLE',
              numRows: '0',
              numBytes: '0',
              createdTime: '',
              modifiedTime: '',
              description: ''
            };
          }
        })
      );
      
      console.log(`Found ${result.length} tables in dataset ${datasetId}`);
      return result;
    } catch (error: any) {
      console.error(`Error fetching tables from dataset ${datasetId}:`, error.message);
      throw new Error(`Failed to fetch tables from dataset ${datasetId}: ${error.message}`);
    }
  }

  async getTableSchema(datasetId: string, tableId: string): Promise<any> {
    try {
      console.log(`Fetching schema for table: ${datasetId}.${tableId}`);
      const table = this.bigquery.dataset(datasetId).table(tableId);
      const [metadata] = await table.getMetadata();
      
      const schema = {
        fields: metadata.schema?.fields || [],
        tableId,
        datasetId,
        projectId: this.projectId
      };
      
      console.log(`Retrieved schema for ${datasetId}.${tableId} with ${schema.fields.length} fields`);
      return schema;
    } catch (error: any) {
      console.error(`Error fetching schema for ${datasetId}.${tableId}:`, error.message);
      throw new Error(`Failed to fetch table schema: ${error.message}`);
    }
  }

  async getTableData(datasetId: string, tableId: string, options: TableDataOptions = {}): Promise<any> {
    try {
      const {
        limit = 100,
        offset = 0,
        filters = [],
        sorts = [],
        search,
        columns,
        orderBy,
        where
      } = options;

      console.log(`Fetching data from table: ${datasetId}.${tableId} (limit: ${limit}, offset: ${offset})`);

      // Build the SQL query
      let query = this.buildQuery(datasetId, tableId, {
        limit,
        offset,
        filters,
        sorts,
        search,
        columns,
        orderBy,
        where
      });

      console.log('Executing BigQuery:', query);
      
      const startTime = Date.now();
      const [rows] = await this.bigquery.query({
        query,
        location: 'US',
        maxResults: limit,
        timeoutMs: 30000
      });
      
      const executionTime = Date.now() - startTime;
      console.log(`Query executed in ${executionTime}ms, returned ${rows.length} rows`);

      // Get total count for pagination (separate query)
      let totalRows = rows.length;
      try {
        const countQuery = `SELECT COUNT(*) as total FROM \`${this.projectId}.${datasetId}.${tableId}\``;
        const [countResult] = await this.bigquery.query({
          query: countQuery,
          location: 'US',
          timeoutMs: 10000
        });
        totalRows = parseInt(countResult[0]?.total || '0');
      } catch (countError) {
        console.warn('Could not get total count:', countError);
      }

      const result = {
        data: rows,
        totalRows,
        totalCount: totalRows,
        hasMore: rows.length === limit,
        query,
        executionTime: `${executionTime}ms`,
        pagination: {
          limit,
          offset,
          total: totalRows
        }
      };

      console.log(`Successfully retrieved ${rows.length} rows from ${datasetId}.${tableId}`);
      return result;
    } catch (error: any) {
      console.error(`Error fetching data from ${datasetId}.${tableId}:`, error.message);
      console.error('Error details:', {
        code: error.code,
        errors: error.errors,
        message: error.message
      });
      
      // Provide more specific error messages
      if (error.code === 404) {
        throw new Error(`Table ${datasetId}.${tableId} not found`);
      } else if (error.code === 403) {
        throw new Error(`Access denied to table ${datasetId}.${tableId}. Check permissions.`);
      } else if (error.message.includes('timeout')) {
        throw new Error(`Query timeout. Try reducing the limit or adding filters.`);
      } else {
        throw new Error(`Failed to fetch table data: ${error.message}`);
      }
    }
  }

  private buildQuery(datasetId: string, tableId: string, options: TableDataOptions): string {
    const {
      limit = 100,
      offset = 0,
      filters = [],
      sorts = [],
      search,
      columns,
      orderBy,
      where
    } = options;

    const fullTableName = `\`${this.projectId}.${datasetId}.${tableId}\``;
    
    // SELECT clause
    let selectClause = '*';
    if (columns && columns.length > 0) {
      selectClause = columns.map(col => `\`${col}\``).join(', ');
    }
    
    let query = `SELECT ${selectClause} FROM ${fullTableName}`;
    
    // WHERE clause
    const whereConditions: string[] = [];
    
    // Add custom WHERE condition
    if (where) {
      whereConditions.push(`(${where})`);
    }
    
    // Add filters
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.column && filter.operator && filter.value !== undefined) {
          const value = typeof filter.value === 'string' ? `'${filter.value}'` : filter.value;
          whereConditions.push(`\`${filter.column}\` ${filter.operator} ${value}`);
        }
      });
    }
    
    // Add search functionality (search across all string columns)
    if (search) {
      // This is a simplified search - in production, you'd want to know the schema
      // For now, we'll search common text fields
      const searchFields = ['name', 'player_name', 'team_name', 'description', 'title'];
      const searchConditions = searchFields.map(field => 
        `LOWER(CAST(\`${field}\` AS STRING)) LIKE LOWER('%${search}%')`
      ).join(' OR ');
      whereConditions.push(`(${searchConditions})`);
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // ORDER BY clause
    if (orderBy) {
      query += ` ORDER BY \`${orderBy}\``;
    } else if (sorts && sorts.length > 0) {
      const sortClauses = sorts.map(sort => {
        const direction = sort.direction === 'desc' ? 'DESC' : 'ASC';
        return `\`${sort.column}\` ${direction}`;
      });
      query += ` ORDER BY ${sortClauses.join(', ')}`;
    }
    
    // LIMIT and OFFSET
    query += ` LIMIT ${limit}`;
    if (offset > 0) {
      query += ` OFFSET ${offset}`;
    }
    
    return query;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      console.log('Performing BigQuery health check...');
      const [datasets] = await this.bigquery.getDatasets({ maxResults: 1 });
      console.log('BigQuery health check passed');
      return true;
    } catch (error: any) {
      console.error('BigQuery health check failed:', error.message);
      return false;
    }
  }

  // Get project info
  getProjectInfo(): { projectId: string } {
    return {
      projectId: this.projectId
    };
  }
}

export default BigQueryService;