import { BigQuery } from '@google-cloud/bigquery';

// Types and interfaces
export interface Dataset {
  id: string;
  name: string;
  description: string;
  location: string;
  created?: string;
  lastModified?: string;
}

export interface Table {
  id: string;
  name: string;
  type: string;
  schema: any[];
  numRows: number;
  numBytes: number;
  createdTime: string;
  modifiedTime: string;
  description: string;
  labels: any;
  location: string;
}

export interface FilterCondition {
  id: string;
  column: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'notNull' | 'isNull';
  value: any;
  dataType: 'string' | 'number' | 'date' | 'boolean';
}

export interface SortCondition {
  column: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export interface TableDataOptions {
  offset?: number;
  limit?: number;
  filters?: FilterCondition[];
  sorts?: SortCondition[];
}

class BigQueryService {
  private bigquery: BigQuery | null = null;
  private projectId: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'hockey-data-analysis';
    
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        const credentials = JSON.parse(
          Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, 'base64').toString('utf-8')
        );
        
        this.bigquery = new BigQuery({
          projectId: this.projectId,
          credentials: credentials,
        });
        
        console.log('BigQuery initialized with service account credentials');
      } else {
        console.log('No BigQuery credentials found, using sample data');
      }
    } catch (error) {
      console.error('Error initializing BigQuery:', error);
      this.bigquery = null;
    }
  }

  async getDatasets(): Promise<Dataset[]> {
    try {
      if (!this.bigquery) {
        return [
          {
            id: 'hockey',
            name: 'hockey',
            description: 'Hockey analytics and player data',
            location: 'US',
          },
          {
            id: 'crm',
            name: 'crm',
            description: 'Customer relationship management data',
            location: 'US',
          },
          {
            id: 'tournament_consolidation',
            name: 'tournament_consolidation',
            description: 'Tournament and competition data',
            location: 'US',
          }
        ];
      }

      const [datasets] = await this.bigquery.getDatasets();
      return datasets.map(dataset => ({
        id: dataset.id!,
        name: dataset.id!,
        description: '',
        location: 'US',
      }));
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw error;
    }
  }

  async getTables(datasetId: string): Promise<Table[]> {
    try {
      if (!this.bigquery) {
        // Fallback hardcoded data
        if (datasetId === 'hockey') {
          return [
            {
              id: 'players',
              name: 'players',
              type: 'TABLE',
              schema: [],
              numRows: 15420,
              numBytes: 2847392,
              createdTime: '2023-01-01T00:00:00Z',
              modifiedTime: '2024-01-01T00:00:00Z',
              description: 'Hockey players data',
              labels: {},
              location: 'US'
            }
          ];
        }
        return [];
      }

      // Real BigQuery API calls
      console.log(`Fetching tables from BigQuery dataset: ${datasetId}`);
      const dataset = this.bigquery.dataset(datasetId);
      const [tables] = await dataset.getTables();

      console.log(`Found ${tables.length} tables, fetching metadata...`);

      // Fetch metadata for each table
      const tablesWithMetadata = await Promise.all(
        tables.map(async (table) => {
          try {
            const [metadata] = await table.getMetadata();
            
            return {
              id: table.id!,
              name: table.id!,
              type: metadata.type || 'TABLE',
              schema: metadata.schema?.fields || [],
              numRows: parseInt(metadata.numRows || '0'),
              numBytes: parseInt(metadata.numBytes || '0'),
              createdTime: metadata.creationTime || '',
              modifiedTime: metadata.lastModifiedTime || '',
              description: metadata.description || '',
              labels: metadata.labels || {},
              location: metadata.location || 'US'
            };
          } catch (error) {
            console.error(`Error fetching metadata for table ${table.id}:`, error);
            // Return basic info if metadata fails
            return {
              id: table.id!,
              name: table.id!,
              type: 'TABLE',
              schema: [],
              numRows: 0,
              numBytes: 0,
              createdTime: '',
              modifiedTime: '',
              description: '',
              labels: {},
              location: 'US'
            };
          }
        })
      );

      console.log(`Successfully fetched metadata for ${tablesWithMetadata.length} tables`);
      return tablesWithMetadata;

    } catch (error) {
      console.error('Error in getTables:', error);
      throw error;
    }
  }

  async getTableData(datasetId: string, tableId: string, options: TableDataOptions | number = {}): Promise<any> {
    try {
      // Handle backwards compatibility
      if (typeof options === 'number') {
        const limit = options;
        if (!this.bigquery) {
          return this.getSampleTableData(datasetId, tableId, limit);
        }
        const query = `SELECT * FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${datasetId}.${tableId}\` LIMIT ${limit}`;
        const [rows] = await this.bigquery.query({ query });
        return {
          tableId,
          data: rows,
          totalRows: rows.length,
          totalCount: rows.length,
          query
        };
      }

      const { limit = 100, offset = 0, filters = [], sorts = [] } = options;

      if (!this.bigquery) {
        return this.getSampleTableData(datasetId, tableId, limit, offset, filters, sorts);
      }

      // Build WHERE clause from filters
      let whereClause = '';
      if (filters.length > 0) {
        const conditions = filters.map(filter => {
          const { column, operator, value, dataType } = filter;
          
          switch (operator) {
            case 'equals':
              return dataType === 'string' ? `\`${column}\` = '${value}'` : `\`${column}\` = ${value}`;
            case 'contains':
              return `\`${column}\` LIKE '%${value}%'`;
            case 'startsWith':
              return `\`${column}\` LIKE '${value}%'`;
            case 'endsWith':
              return `\`${column}\` LIKE '%${value}'`;
            case 'gt':
              return `\`${column}\` > ${value}`;
            case 'gte':
              return `\`${column}\` >= ${value}`;
            case 'lt':
              return `\`${column}\` < ${value}`;
            case 'lte':
              return `\`${column}\` <= ${value}`;
            case 'notNull':
              return `\`${column}\` IS NOT NULL`;
            case 'isNull':
              return `\`${column}\` IS NULL`;
            default:
              return dataType === 'string' ? `\`${column}\` = '${value}'` : `\`${column}\` = ${value}`;
          }
        });
        whereClause = ' WHERE ' + conditions.join(' AND ');
      }

      // Build ORDER BY clause from sorts
      let orderByClause = '';
      if (sorts.length > 0) {
        const sortClauses = sorts
          .sort((a, b) => a.priority - b.priority)
          .map(sort => `\`${sort.column}\` ${sort.direction.toUpperCase()}`);
        orderByClause = ' ORDER BY ' + sortClauses.join(', ');
      }

      const query = `SELECT * FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${datasetId}.${tableId}\`${whereClause}${orderByClause} LIMIT ${limit}`;
      console.log('Executing query:', query);

      const [rows] = await this.bigquery.query({ query });
      
      return {
        tableId,
        data: rows,
        totalRows: rows.length,
        totalCount: rows.length,
        query
      };

    } catch (error) {
      console.error('Error fetching table data:', error);
      throw error;
    }
  }

  private getSampleTableData(datasetId: string, tableId: string, limit: number, offset = 0, filters: FilterCondition[] = [], sorts: SortCondition[] = []) {
    // Sample data fallback
    const sampleRows = [
      { id: 1, name: 'Sample Player 1', position: 'Forward', nationality: 'USA' },
      { id: 2, name: 'Sample Player 2', position: 'Defense', nationality: 'CAN' },
      { id: 3, name: 'Sample Player 3', position: 'Goalie', nationality: 'SWE' },
    ].slice(offset, offset + limit);

    return {
      tableId,
      data: sampleRows,
      totalRows: sampleRows.length,
      totalCount: 3,
      query: `Sample data for ${datasetId}.${tableId}`
    };
  }

  async getTableSchema(datasetId: string, tableId: string) {
    try {
      if (!this.bigquery) {
        return {
          fields: [
            { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
            { name: 'name', type: 'STRING', mode: 'NULLABLE' },
            { name: 'position', type: 'STRING', mode: 'NULLABLE' },
          ]
        };
      }

      const dataset = this.bigquery.dataset(datasetId);
      const table = dataset.table(tableId);
      const [metadata] = await table.getMetadata();
      
      return metadata.schema;
    } catch (error) {
      console.error('Error fetching table schema:', error);
      throw error;
    }
  }
}

export default BigQueryService;