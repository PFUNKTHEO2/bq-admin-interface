import { BigQuery } from '@google-cloud/bigquery';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  location: string;
  tables?: number;
}

export interface Table {
  id: string;
  name: string;
  type: string;
  numRows: number;
  numBytes: number;
  createdTime: string;
  modifiedTime: string;
}

export class BigQueryService {
  private bigquery: BigQuery;
  private projectId: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'hockey-data-analysis';
    
    // Initialize BigQuery client
    this.bigquery = new BigQuery({
      projectId: this.projectId,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    console.log(`BigQuery service initialized for project: ${this.projectId}`);
  }

  private parseNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseInt(value.toString(), 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  async getDatasets(): Promise<Dataset[]> {
    try {
      console.log('Fetching datasets...');
      const [datasets] = await this.bigquery.getDatasets();
      
      const datasetsWithTableCounts = await Promise.all(
        datasets.map(async (dataset) => {
          try {
            const [tables] = await dataset.getTables();
            return {
              id: dataset.id || 'unknown',
              name: dataset.id || 'unknown',
              description: dataset.metadata?.description || 'No description available',
              location: dataset.metadata?.location || 'US',
              tables: tables.length
            };
          } catch (err) {
            console.error(`Error getting tables for dataset ${dataset.id}:`, err);
            return {
              id: dataset.id || 'unknown',
              name: dataset.id || 'unknown',
              description: dataset.metadata?.description || 'No description available',
              location: dataset.metadata?.location || 'US',
              tables: 0
            };
          }
        })
      );

      console.log(`Found ${datasetsWithTableCounts.length} datasets`);
      return datasetsWithTableCounts;
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw new Error(`Failed to fetch datasets: ${error}`);
    }
  }

  async getTables(datasetId: string): Promise<Table[]> {
    try {
      console.log(`Fetching tables for dataset: ${datasetId}`);
      const dataset = this.bigquery.dataset(datasetId);
      const [tables] = await dataset.getTables();
      
      const tablesWithMetadata = await Promise.all(
        tables.map(async (table) => {
          try {
            const [metadata] = await table.getMetadata();
            return {
              id: table.id || 'unknown',
              name: table.id || 'unknown',
              type: metadata.type || 'TABLE',
              numRows: this.parseNumber(metadata.numRows),
              numBytes: this.parseNumber(metadata.numBytes),
              createdTime: metadata.creationTime || '',
              modifiedTime: metadata.lastModifiedTime || ''
            };
          } catch (err) {
            console.error(`Error getting metadata for table ${table.id}:`, err);
            return {
              id: table.id || 'unknown',
              name: table.id || 'unknown',
              type: 'TABLE',
              numRows: 0,
              numBytes: 0,
              createdTime: '',
              modifiedTime: ''
            };
          }
        })
      );

      console.log(`Found ${tablesWithMetadata.length} tables in ${datasetId}`);
      return tablesWithMetadata;
    } catch (error) {
      console.error(`Error fetching tables for ${datasetId}:`, error);
      throw new Error(`Failed to fetch tables: ${error}`);
    }
  }

  async getTableSchema(datasetId: string, tableId: string) {
    try {
      console.log(`Fetching schema for ${datasetId}.${tableId}`);
      const dataset = this.bigquery.dataset(datasetId);
      const table = dataset.table(tableId);
      const [metadata] = await table.getMetadata();
      
      return {
        schema: metadata.schema,
        description: metadata.description || 'No description available',
        numRows: this.parseNumber(metadata.numRows),
        numBytes: this.parseNumber(metadata.numBytes),
        type: metadata.type || 'TABLE'
      };
    } catch (error) {
      console.error(`Error fetching schema for ${datasetId}.${tableId}:`, error);
      throw new Error(`Failed to fetch table schema: ${error}`);
    }
  }

  async getTableData(datasetId: string, tableId: string, limit: number = 100) {
    try {
      console.log(`Fetching data from ${datasetId}.${tableId} (limit: ${limit})`);
      
      const query = `
        SELECT * FROM \`${this.projectId}.${datasetId}.${tableId}\`
        LIMIT ${limit}
      `;
      
      const [job] = await this.bigquery.createQueryJob({
        query,
        location: 'US'
      });
      
      const [rows] = await job.getQueryResults();
      console.log(`Retrieved ${rows.length} rows from ${datasetId}.${tableId}`);
      
      return rows;
    } catch (error) {
      console.error(`Error fetching data from ${datasetId}.${tableId}:`, error);
      throw new Error(`Failed to fetch table data: ${error}`);
    }
  }

  // INSERT new record
  async insertRecord(datasetId: string, tableId: string, record: any) {
    try {
      const dataset = this.bigquery.dataset(datasetId);
      const table = dataset.table(tableId);
      
      // Insert the record
      const [response] = await table.insert([record]);
      console.log(`Inserted record into ${datasetId}.${tableId}`);
      return response;
    } catch (error) {
      console.error('Error inserting record:', error);
      throw new Error(`Failed to insert record: ${error}`);
    }
  }

  // UPDATE existing record (using MERGE or DELETE+INSERT pattern)
  async updateRecord(datasetId: string, tableId: string, record: any, whereClause: string) {
    try {
      // For BigQuery, we typically use MERGE statements for updates
      // This assumes you have a unique identifier field
      const query = `
        MERGE \`${this.projectId}.${datasetId}.${tableId}\` T
        USING (SELECT * FROM UNNEST([STRUCT(${Object.entries(record).map(([key, value]) => 
          `'${value}' as ${key}`
        ).join(', ')})])) S
        ON ${whereClause}
        WHEN MATCHED THEN UPDATE SET ${Object.keys(record).map(key => 
          `T.${key} = S.${key}`
        ).join(', ')}
        WHEN NOT MATCHED THEN INSERT (${Object.keys(record).join(', ')}) 
        VALUES (${Object.keys(record).map(key => `S.${key}`).join(', ')})
      `;
      
      const [job] = await this.bigquery.createQueryJob({
        query,
        location: 'US'
      });
      
      await job.getQueryResults();
      console.log(`Updated record in ${datasetId}.${tableId}`);
      return true;
    } catch (error) {
      console.error('Error updating record:', error);
      throw new Error(`Failed to update record: ${error}`);
    }
  }

  // DELETE record
  async deleteRecord(datasetId: string, tableId: string, whereClause: string) {
    try {
      const query = `
        DELETE FROM \`${this.projectId}.${datasetId}.${tableId}\`
        WHERE ${whereClause}
      `;
      
      const [job] = await this.bigquery.createQueryJob({
        query,
        location: 'US'
      });
      
      const [rows] = await job.getQueryResults();
      console.log(`Deleted record(s) from ${datasetId}.${tableId}`);
      return rows;
    } catch (error) {
      console.error('Error deleting record:', error);
      throw new Error(`Failed to delete record: ${error}`);
    }
  }

  // ADVANCED SEARCH with filters, sorting, and complex queries
  async searchTableData(
    datasetId: string, 
    tableId: string, 
    options: {
      searchTerm?: string;
      columns?: string[];
      filters?: Array<{field: string, operator: string, value: any}>;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      limit?: number;
      offset?: number;
    } = {}
  ) {
    try {
      const {
        searchTerm = '',
        columns = ['*'],
        filters = [],
        sortBy = '',
        sortOrder = 'ASC',
        limit = 100,
        offset = 0
      } = options;

      let query = `SELECT ${columns.join(', ')} FROM \`${this.projectId}.${datasetId}.${tableId}\``;
      
      // Build WHERE clause
      const whereClauses: string[] = [];
      
      // Add search term across all text columns
      if (searchTerm) {
        // This is a simplified version - in practice, you'd want to identify text columns
        whereClauses.push(`(
          LOWER(CAST(player_name AS STRING)) LIKE LOWER('%${searchTerm}%') OR
          LOWER(CAST(position AS STRING)) LIKE LOWER('%${searchTerm}%') OR
          LOWER(CAST(team AS STRING)) LIKE LOWER('%${searchTerm}%')
        )`);
      }
      
      // Add specific filters
      filters.forEach(filter => {
        switch(filter.operator) {
          case 'equals':
            whereClauses.push(`${filter.field} = '${filter.value}'`);
            break;
          case 'contains':
            whereClauses.push(`LOWER(${filter.field}) LIKE LOWER('%${filter.value}%')`);
            break;
          case 'greater_than':
            whereClauses.push(`${filter.field} > ${filter.value}`);
            break;
          case 'less_than':
            whereClauses.push(`${filter.field} < ${filter.value}`);
            break;
        }
      });
      
      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }
      
      // Add sorting
      if (sortBy) {
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
      }
      
      // Add pagination
      query += ` LIMIT ${limit} OFFSET ${offset}`;
      
      console.log('Search query:', query);
      
      const [job] = await this.bigquery.createQueryJob({
        query,
        location: 'US'
      });
      
      const [rows] = await job.getQueryResults();
      return rows;
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw new Error(`Search failed: ${error}`);
    }
  }

  // BULK OPERATIONS
  async bulkInsert(datasetId: string, tableId: string, records: any[]) {
    try {
      const dataset = this.bigquery.dataset(datasetId);
      const table = dataset.table(tableId);
      
      // Insert records in batches of 1000 (BigQuery limit)
      const batchSize = 1000;
      const results = [];
      
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const [response] = await table.insert(batch);
        results.push(response);
      }
      
      console.log(`Bulk inserted ${records.length} records into ${datasetId}.${tableId}`);
      return results;
    } catch (error) {
      console.error('Error in bulk insert:', error);
      throw new Error(`Bulk insert failed: ${error}`);
    }
  }
}