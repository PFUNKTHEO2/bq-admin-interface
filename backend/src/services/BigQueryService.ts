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
        // Enhanced sample data for all datasets
        switch (datasetId) {
          case 'hockey':
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
                description: 'Hockey players statistics and demographics',
                labels: {},
                location: 'US'
              },
              {
                id: 'teams',
                name: 'teams',
                type: 'TABLE',
                schema: [],
                numRows: 32,
                numBytes: 12800,
                createdTime: '2023-01-01T00:00:00Z',
                modifiedTime: '2024-01-01T00:00:00Z',
                description: 'NHL team information and statistics',
                labels: {},
                location: 'US'
              },
              {
                id: 'games',
                name: 'games',
                type: 'TABLE',
                schema: [],
                numRows: 82156,
                numBytes: 15678234,
                createdTime: '2023-01-01T00:00:00Z',
                modifiedTime: '2024-01-01T00:00:00Z',
                description: 'Game results and statistics',
                labels: {},
                location: 'US'
              },
              {
                id: 'algorithms_v43',
                name: 'algorithms_v43',
                type: 'VIEW',
                schema: [],
                numRows: 0,
                numBytes: 0,
                createdTime: '2024-01-01T00:00:00Z',
                modifiedTime: '2024-01-01T00:00:00Z',
                description: 'Latest hockey analytics algorithms',
                labels: {},
                location: 'US'
              }
            ];
          
          case 'crm':
            return [
              {
                id: 'customers',
                name: 'customers',
                type: 'TABLE',
                schema: [],
                numRows: 25678,
                numBytes: 3456789,
                createdTime: '2023-01-01T00:00:00Z',
                modifiedTime: '2024-01-15T00:00:00Z',
                description: 'Customer contact information and demographics',
                labels: {},
                location: 'US'
              },
              {
                id: 'orders',
                name: 'orders',
                type: 'TABLE',
                schema: [],
                numRows: 156742,
                numBytes: 12456789,
                createdTime: '2023-01-01T00:00:00Z',
                modifiedTime: '2024-01-15T00:00:00Z',
                description: 'Customer orders and transaction history',
                labels: {},
                location: 'US'
              },
              {
                id: 'support_tickets',
                name: 'support_tickets',
                type: 'TABLE',
                schema: [],
                numRows: 8934,
                numBytes: 1234567,
                createdTime: '2023-01-01T00:00:00Z',
                modifiedTime: '2024-01-15T00:00:00Z',
                description: 'Customer support tickets and resolutions',
                labels: {},
                location: 'US'
              },
              {
                id: 'customer_analytics',
                name: 'customer_analytics',
                type: 'VIEW',
                schema: [],
                numRows: 0,
                numBytes: 0,
                createdTime: '2024-01-01T00:00:00Z',
                modifiedTime: '2024-01-15T00:00:00Z',
                description: 'Customer behavior and lifetime value analytics',
                labels: {},
                location: 'US'
              }
            ];
          
          case 'tournament_consolidation':
            return [
              {
                id: 'tournaments',
                name: 'tournaments',
                type: 'TABLE',
                schema: [],
                numRows: 1247,
                numBytes: 567891,
                createdTime: '2023-01-01T00:00:00Z',
                modifiedTime: '2024-01-10T00:00:00Z',
                description: 'Tournament information and metadata',
                labels: {},
                location: 'US'
              },
              {
                id: 'participants',
                name: 'participants',
                type: 'TABLE',
                schema: [],
                numRows: 34567,
                numBytes: 4567890,
                createdTime: '2023-01-01T00:00:00Z',
                modifiedTime: '2024-01-10T00:00:00Z',
                description: 'Tournament participants and registrations',
                labels: {},
                location: 'US'
              },
              {
                id: 'matches',
                name: 'matches',
                type: 'TABLE',
                schema: [],
                numRows: 78901,
                numBytes: 8901234,
                createdTime: '2023-01-01T00:00:00Z',
                modifiedTime: '2024-01-10T00:00:00Z',
                description: 'Match results and game statistics',
                labels: {},
                location: 'US'
              },
              {
                id: 'standings',
                name: 'standings',
                type: 'TABLE',
                schema: [],
                numRows: 2456,
                numBytes: 345678,
                createdTime: '2023-01-01T00:00:00Z',
                modifiedTime: '2024-01-10T00:00:00Z',
                description: 'Tournament standings and rankings',
                labels: {},
                location: 'US'
              }
            ];
          
          default:
            return [];
        }
      }

      // Get basic table list with metadata
      console.log(`Fetching tables from BigQuery dataset: ${datasetId}`);
      const dataset = this.bigquery.dataset(datasetId);
      const [tables] = await dataset.getTables();

      console.log(`Found ${tables.length} tables/views, processing each type...`);

      // Process each table/view based on its type
      const tablesWithInfo = await Promise.all(
        tables.map(async (table) => {
          try {
            // Try to get basic metadata to determine type
            const [metadata] = await table.getMetadata();
            const isView = metadata.type === 'VIEW';
            
            if (isView) {
              // For VIEWs: Don't try to get row counts, just return basic info
              console.log(`Processing VIEW: ${table.id}`);
              return {
                id: table.id!,
                name: table.id!,
                type: 'VIEW',
                schema: metadata.schema?.fields || [],
                numRows: 0, // Views don't have stored row counts
                numBytes: 0, // Views don't have storage size
                createdTime: metadata.creationTime || '',
                modifiedTime: metadata.lastModifiedTime || '',
                description: metadata.description || '',
                labels: metadata.labels || {},
                location: metadata.location || 'US'
              };
            } else {
              // For TABLEs: Try to get row count via SQL
              console.log(`Processing TABLE: ${table.id}`);
              try {
                const countQuery = `SELECT COUNT(*) as total FROM \`${this.projectId}.${datasetId}.${table.id}\` LIMIT 1000000`;
                const [rows] = await this.bigquery!.query({ 
                  query: countQuery,
                  maxResults: 1
                });
                const rowCount = rows[0]?.total ? parseInt(rows[0].total.toString()) : 0;
                
                return {
                  id: table.id!,
                  name: table.id!,
                  type: 'TABLE',
                  schema: metadata.schema?.fields || [],
                  numRows: rowCount, // Real count from SQL
                  numBytes: parseInt(metadata.numBytes || '0') || (rowCount * 100), // Use metadata or estimate
                  createdTime: metadata.creationTime || '',
                  modifiedTime: metadata.lastModifiedTime || '',
                  description: metadata.description || '',
                  labels: metadata.labels || {},
                  location: metadata.location || 'US'
                };
              } catch (countError) {
                // If count query fails, use metadata values
                return {
                  id: table.id!,
                  name: table.id!,
                  type: 'TABLE',
                  schema: metadata.schema?.fields || [],
                  numRows: parseInt(metadata.numRows || '0'),
                  numBytes: parseInt(metadata.numBytes || '0'),
                  createdTime: metadata.creationTime || '',
                  modifiedTime: metadata.lastModifiedTime || '',
                  description: metadata.description || '',
                  labels: metadata.labels || {},
                  location: metadata.location || 'US'
                };
              }
            }
          } catch (error) {
            console.error(`Error processing ${table.id}:`, error);
            // Fallback: assume it's a table with no data
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

      const tableCount = tablesWithInfo.filter(t => t.type === 'TABLE').length;
      const viewCount = tablesWithInfo.filter(t => t.type === 'VIEW').length;
      
      console.log(`Successfully processed ${tableCount} tables and ${viewCount} views`);
      return tablesWithInfo;

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
    // Enhanced sample data based on dataset and table
    let sampleRows: any[] = [];
    
    if (datasetId === 'hockey') {
      switch (tableId) {
        case 'players':
          sampleRows = [
            { id: 1, name: 'Connor McDavid', position: 'C', team: 'EDM', nationality: 'CAN', goals: 64, assists: 89 },
            { id: 2, name: 'Leon Draisaitl', position: 'C', team: 'EDM', nationality: 'GER', goals: 52, assists: 76 },
            { id: 3, name: 'David Pastrnak', position: 'RW', team: 'BOS', nationality: 'CZE', goals: 61, assists: 52 }
          ];
          break;
        case 'teams':
          sampleRows = [
            { id: 1, name: 'Edmonton Oilers', city: 'Edmonton', conference: 'Western', division: 'Pacific' },
            { id: 2, name: 'Boston Bruins', city: 'Boston', conference: 'Eastern', division: 'Atlantic' },
            { id: 3, name: 'Toronto Maple Leafs', city: 'Toronto', conference: 'Eastern', division: 'Atlantic' }
          ];
          break;
        default:
          sampleRows = [
            { id: 1, name: 'Sample Data 1', value: 100 },
            { id: 2, name: 'Sample Data 2', value: 200 }
          ];
      }
    } else if (datasetId === 'crm') {
      switch (tableId) {
        case 'customers':
          sampleRows = [
            { id: 1, first_name: 'John', last_name: 'Smith', email: 'john.smith@email.com', signup_date: '2023-01-15' },
            { id: 2, first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.j@email.com', signup_date: '2023-02-20' },
            { id: 3, first_name: 'Mike', last_name: 'Brown', email: 'mike.brown@email.com', signup_date: '2023-03-10' }
          ];
          break;
        case 'orders':
          sampleRows = [
            { id: 1, customer_id: 1, order_date: '2024-01-10', amount: 149.99, status: 'Delivered' },
            { id: 2, customer_id: 2, order_date: '2024-01-12', amount: 89.50, status: 'Shipped' },
            { id: 3, customer_id: 1, order_date: '2024-01-15', amount: 299.99, status: 'Processing' }
          ];
          break;
        default:
          sampleRows = [
            { id: 1, description: 'CRM Sample Data', value: 'Sample' }
          ];
      }
    } else if (datasetId === 'tournament_consolidation') {
      switch (tableId) {
        case 'tournaments':
          sampleRows = [
            { id: 1, name: 'Winter Championship 2024', start_date: '2024-01-15', end_date: '2024-01-25', status: 'Completed' },
            { id: 2, name: 'Spring Tournament', start_date: '2024-04-01', end_date: '2024-04-10', status: 'Upcoming' },
            { id: 3, name: 'Summer League', start_date: '2024-06-15', end_date: '2024-08-30', status: 'In Progress' }
          ];
          break;
        case 'participants':
          sampleRows = [
            { id: 1, tournament_id: 1, team_name: 'Lightning Bolts', captain: 'Alex Martinez', registration_date: '2023-12-01' },
            { id: 2, tournament_id: 1, team_name: 'Fire Dragons', captain: 'Emma Wilson', registration_date: '2023-12-03' },
            { id: 3, tournament_id: 2, team_name: 'Ice Hawks', captain: 'Ryan Thompson', registration_date: '2024-03-15' }
          ];
          break;
        default:
          sampleRows = [
            { id: 1, description: 'Tournament Sample Data', value: 'Sample' }
          ];
      }
    }

    const result = sampleRows.slice(offset, offset + limit);
    
    return {
      tableId,
      data: result,
      totalRows: result.length,
      totalCount: sampleRows.length,
      query: `Sample data for ${datasetId}.${tableId}`
    };
  }

  async getTableSchema(datasetId: string, tableId: string) {
    try {
      if (!this.bigquery) {
        // Return sample schema based on dataset/table
        if (datasetId === 'hockey' && tableId === 'players') {
          return {
            fields: [
              { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
              { name: 'name', type: 'STRING', mode: 'NULLABLE' },
              { name: 'position', type: 'STRING', mode: 'NULLABLE' },
              { name: 'team', type: 'STRING', mode: 'NULLABLE' },
              { name: 'nationality', type: 'STRING', mode: 'NULLABLE' },
              { name: 'goals', type: 'INTEGER', mode: 'NULLABLE' },
              { name: 'assists', type: 'INTEGER', mode: 'NULLABLE' }
            ]
          };
        }
        
        return {
          fields: [
            { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
            { name: 'name', type: 'STRING', mode: 'NULLABLE' },
            { name: 'value', type: 'STRING', mode: 'NULLABLE' },
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