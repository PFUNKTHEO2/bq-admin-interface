// File: backend/src/services/BigQueryService.ts
// Replace the entire contents of this file

import { BigQuery } from '@google-cloud/bigquery';
import { Dataset, Table } from '../types';

class BigQueryService {
  private bigquery: BigQuery;

  constructor() {
    // Check if we have credentials
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    if (!credentialsJson || !projectId) {
      console.warn('BigQuery credentials not found, using sample data');
      this.bigquery = null as any;
      return;
    }

    try {
      const credentials = JSON.parse(credentialsJson);
      this.bigquery = new BigQuery({
        projectId,
        credentials,
      });
      console.log('BigQuery client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize BigQuery client:', error);
      this.bigquery = null as any;
    }
  }

  async getDatasets(): Promise<Dataset[]> {
    try {
      if (!this.bigquery) {
        // Return hardcoded data if no BigQuery connection
        return [
          {
            id: 'hockey',
            name: 'hockey',
            description: 'Hockey analytics and statistics data',
            location: 'US',
            created: '2023-01-01',
            lastModified: '2024-01-01'
          },
          {
            id: 'crm',
            name: 'crm',
            description: 'Customer relationship management data',
            location: 'US',
            created: '2023-01-01',
            lastModified: '2024-01-01'
          },
          {
            id: 'tournament_consolidation',
            name: 'tournament_consolidation',
            description: 'Tournament and competition data',
            location: 'US',
            created: '2023-01-01',
            lastModified: '2024-01-01'
          }
        ];
      }

      const [datasets] = await this.bigquery.getDatasets();
      
      return datasets.map(dataset => ({
        id: dataset.id!,
        name: dataset.id!,
        description: dataset.metadata?.description || '',
        location: dataset.metadata?.location || 'US',
        created: dataset.metadata?.creationTime || '',
        lastModified: dataset.metadata?.lastModifiedTime || ''
      }));
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw error;
    }
  }

  async getTables(datasetId: string): Promise<Table[]> {
    try {
      if (!this.bigquery) {
        // Return hardcoded sample tables
        return this.getSampleTables(datasetId);
      }

      const dataset = this.bigquery.dataset(datasetId);
      const [tables] = await dataset.getTables();

      return tables.map(table => ({
        id: table.id!,
        name: table.id!,
        type: table.metadata?.type || 'TABLE',
        schema: table.metadata?.schema?.fields || [],
        numRows: parseInt(table.metadata?.numRows || '0'),
        numBytes: parseInt(table.metadata?.numBytes || '0'),
        created: table.metadata?.creationTime || '',
        lastModified: table.metadata?.lastModifiedTime || '',
        description: table.metadata?.description || '',
        labels: table.metadata?.labels || {},
        location: table.metadata?.location || 'US'
      }));
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  }

  async getTableSchema(datasetId: string, tableId: string): Promise<any> {
    try {
      if (!this.bigquery) {
        // Return sample schema
        return {
          tableId,
          schema: [
            { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
            { name: 'name', type: 'STRING', mode: 'NULLABLE' },
            { name: 'created_date', type: 'TIMESTAMP', mode: 'NULLABLE' }
          ],
          description: `Schema for ${tableId} table`,
          numRows: '1000',
          numBytes: '50000'
        };
      }

      const table = this.bigquery.dataset(datasetId).table(tableId);
      const [metadata] = await table.getMetadata();

      return {
        tableId,
        schema: metadata.schema?.fields || [],
        description: metadata.description || '',
        numRows: metadata.numRows || '0',
        numBytes: metadata.numBytes || '0',
        created: metadata.creationTime,
        lastModified: metadata.lastModifiedTime
      };
    } catch (error) {
      console.error('Error fetching table schema:', error);
      throw error;
    }
  }

  async getTableData(datasetId: string, tableId: string, limit: number = 100): Promise<any> {
    try {
      if (!this.bigquery) {
        // Return sample data
        return this.getSampleTableData(tableId, limit);
      }

      const query = `
        SELECT *
        FROM \`${this.bigquery.projectId}.${datasetId}.${tableId}\`
        LIMIT ${limit}
      `;

      const [rows] = await this.bigquery.query({
        query,
        location: 'US',
      });

      return {
        data: rows,
        totalRows: rows.length,
        hasMore: rows.length === limit,
        schema: await this.getTableSchema(datasetId, tableId)
      };
    } catch (error) {
      console.error('Error fetching table data:', error);
      throw error;
    }
  }

  private getSampleTables(datasetId: string): Table[] {
    if (datasetId === 'hockey') {
      return [
        {
          id: 'algorithm_config',
          name: 'algorithm_config',
          type: 'TABLE',
          schema: [],
          numRows: 26,
          numBytes: 2560,
          created: '2023-01-01',
          lastModified: '2024-01-01',
          description: 'Algorithm configuration settings',
          labels: {},
          location: 'US'
        },
        {
          id: 'all_drafts',
          name: 'all_drafts',
          type: 'TABLE',
          schema: [],
          numRows: 5892,
          numBytes: 531300,
          created: '2023-01-01',
          lastModified: '2024-01-01',
          description: 'All draft data',
          labels: {},
          location: 'US'
        },
        {
          id: 'college_commitments_raw',
          name: 'college_commitments_raw',
          type: 'TABLE',
          schema: [],
          numRows: 1226,
          numBytes: 89250,
          created: '2023-01-01',
          lastModified: '2024-01-01',
          description: 'Raw college commitment data',
          labels: {},
          location: 'US'
        }
      ];
    } else if (datasetId === 'crm') {
      return [
        {
          id: 'customers',
          name: 'customers',
          type: 'TABLE',
          schema: [],
          numRows: 1000,
          numBytes: 50000,
          created: '2023-01-01',
          lastModified: '2024-01-01',
          description: 'Customer data',
          labels: {},
          location: 'US'
        }
      ];
    } else if (datasetId === 'tournament_consolidation') {
      return [
        {
          id: 'tournaments',
          name: 'tournaments',
          type: 'TABLE',
          schema: [],
          numRows: 500,
          numBytes: 25000,
          created: '2023-01-01',
          lastModified: '2024-01-01',
          description: 'Tournament data',
          labels: {},
          location: 'US'
        }
      ];
    }
    
    return [];
  }

  private getSampleTableData(tableId: string, limit: number): any {
    const sampleData = [];
    
    for (let i = 0; i < limit; i++) {
      if (tableId === 'algorithm_config') {
        sampleData.push({
          id: i + 1,
          algorithm_name: `Algorithm_${i + 1}`,
          version: `v${Math.floor(i / 10) + 1}.${i % 10}`,
          parameters: JSON.stringify({ param1: i, param2: String.fromCharCode(65 + (i % 26)) }),
          created_date: new Date(2023, 0, 1 + i).toISOString(),
          status: i % 3 === 0 ? 'active' : 'inactive'
        });
      } else if (tableId === 'all_drafts') {
        sampleData.push({
          id: i + 1,
          player_name: `Player ${i + 1}`,
          team: `Team ${String.fromCharCode(65 + (i % 26))}`,
          position: ['Forward', 'Defense', 'Goalie'][i % 3],
          draft_year: 2020 + (i % 5),
          round: Math.floor(i / 30) + 1,
          pick: (i % 30) + 1,
          points: Math.floor(Math.random() * 100)
        });
      } else if (tableId === 'college_commitments_raw') {
        sampleData.push({
          id: i + 1,
          player_name: `Student ${i + 1}`,
          college: `University ${String.fromCharCode(65 + (i % 26))}`,
          sport: 'Hockey',
          commitment_date: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
          position: ['Forward', 'Defense', 'Goalie'][i % 3]
        });
      } else {
        sampleData.push({
          id: i + 1,
          name: `Record ${i + 1}`,
          value: Math.floor(Math.random() * 1000),
          category: `Category ${String.fromCharCode(65 + (i % 5))}`,
          date: new Date(2023, i % 12, (i % 28) + 1).toISOString()
        });
      }
    }

    return {
      data: sampleData,
      totalRows: sampleData.length,
      hasMore: sampleData.length === limit,
      schema: {
        tableId,
        schema: this.getSampleSchema(tableId)
      }
    };
  }

  private getSampleSchema(tableId: string): any[] {
    if (tableId === 'algorithm_config') {
      return [
        { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'algorithm_name', type: 'STRING', mode: 'NULLABLE' },
        { name: 'version', type: 'STRING', mode: 'NULLABLE' },
        { name: 'parameters', type: 'STRING', mode: 'NULLABLE' },
        { name: 'created_date', type: 'TIMESTAMP', mode: 'NULLABLE' },
        { name: 'status', type: 'STRING', mode: 'NULLABLE' }
      ];
    } else if (tableId === 'all_drafts') {
      return [
        { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'player_name', type: 'STRING', mode: 'NULLABLE' },
        { name: 'team', type: 'STRING', mode: 'NULLABLE' },
        { name: 'position', type: 'STRING', mode: 'NULLABLE' },
        { name: 'draft_year', type: 'INTEGER', mode: 'NULLABLE' },
        { name: 'round', type: 'INTEGER', mode: 'NULLABLE' },
        { name: 'pick', type: 'INTEGER', mode: 'NULLABLE' },
        { name: 'points', type: 'INTEGER', mode: 'NULLABLE' }
      ];
    } else {
      return [
        { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'name', type: 'STRING', mode: 'NULLABLE' },
        { name: 'value', type: 'INTEGER', mode: 'NULLABLE' },
        { name: 'category', type: 'STRING', mode: 'NULLABLE' },
        { name: 'date', type: 'TIMESTAMP', mode: 'NULLABLE' }
      ];
    }
  }
}

export default new BigQueryService();