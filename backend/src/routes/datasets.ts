import { Router } from 'express';
import { BigQueryService } from '../services/BigQueryService';

const router = Router();
const bigQueryService = new BigQueryService();

// GET /api/datasets - List all datasets with table counts
router.get('/api/datasets', async (req, res) => {
  try {
    console.log('GET /api/datasets - Fetching all datasets');
    const datasets = await bigQueryService.getDatasets();
    res.json(datasets);
  } catch (error) {
    console.error('Error in GET /api/datasets:', error);
    res.status(500).json({ 
      error: 'Failed to fetch datasets', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// GET /api/datasets/:datasetId/tables - List all tables in a dataset
router.get('/api/datasets/:datasetId/tables', async (req, res) => {
  try {
    const { datasetId } = req.params;
    console.log(`GET /api/datasets/${datasetId}/tables - Fetching tables`);
    
    const tables = await bigQueryService.getTables(datasetId);
    res.json(tables);
  } catch (error) {
    console.error(`Error in GET /api/datasets/${req.params.datasetId}/tables:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch tables', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// GET /api/datasets/:datasetId/tables/:tableId - Get table schema/metadata
router.get('/api/datasets/:datasetId/tables/:tableId', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    console.log(`GET /api/datasets/${datasetId}/tables/${tableId} - Fetching table schema`);
    
    const schema = await bigQueryService.getTableSchema(datasetId, tableId);
    res.json(schema);
  } catch (error) {
    console.error(`Error in GET /api/datasets/${req.params.datasetId}/tables/${req.params.tableId}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch table schema', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// GET /api/datasets/:datasetId/tables/:tableId/data - Get table data
router.get('/api/datasets/:datasetId/tables/:tableId/data', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    console.log(`GET /api/datasets/${datasetId}/tables/${tableId}/data - Fetching table data (limit: ${limit})`);
    
    const data = await bigQueryService.getTableData(datasetId, tableId, limit);
    res.json(data);
  } catch (error) {
    console.error(`Error in GET /api/datasets/${req.params.datasetId}/tables/${req.params.tableId}/data:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch table data', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// POST /api/datasets/:datasetId/tables/:tableId/records - Insert new record
router.post('/api/datasets/:datasetId/tables/:tableId/records', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const record = req.body;
    
    console.log(`POST /api/datasets/${datasetId}/tables/${tableId}/records - Inserting record:`, record);
    
    const result = await bigQueryService.insertRecord(datasetId, tableId, record);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ 
      error: 'Failed to insert record', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// PUT /api/datasets/:datasetId/tables/:tableId/records/:recordId - Update existing record
router.put('/api/datasets/:datasetId/tables/:tableId/records/:recordId', async (req, res) => {
  try {
    const { datasetId, tableId, recordId } = req.params;
    const record = req.body;
    
    // You'll need to determine the primary key field for your tables
    // This assumes there's an 'id' field - adjust based on your schema
    const whereClause = `id = '${recordId}'`;
    
    console.log(`PUT /api/datasets/${datasetId}/tables/${tableId}/records/${recordId} - Updating record:`, record);
    
    const result = await bigQueryService.updateRecord(datasetId, tableId, record, whereClause);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      error: 'Failed to update record', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// DELETE /api/datasets/:datasetId/tables/:tableId/records/:recordId - Delete record
router.delete('/api/datasets/:datasetId/tables/:tableId/records/:recordId', async (req, res) => {
  try {
    const { datasetId, tableId, recordId } = req.params;
    
    // Adjust the where clause based on your primary key field
    const whereClause = `id = '${recordId}'`;
    
    console.log(`DELETE /api/datasets/${datasetId}/tables/${tableId}/records/${recordId} - Deleting record`);
    
    const result = await bigQueryService.deleteRecord(datasetId, tableId, whereClause);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete record', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// POST /api/datasets/:datasetId/tables/:tableId/search - Advanced search endpoint
router.post('/api/datasets/:datasetId/tables/:tableId/search', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const searchOptions = req.body;
    
    console.log(`POST /api/datasets/${datasetId}/tables/${tableId}/search - Advanced search:`, searchOptions);
    
    const results = await bigQueryService.searchTableData(datasetId, tableId, searchOptions);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// POST /api/datasets/:datasetId/tables/:tableId/bulk - Bulk insert endpoint
router.post('/api/datasets/:datasetId/tables/:tableId/bulk', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const { records } = req.body;
    
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'Records must be an array' });
    }
    
    console.log(`POST /api/datasets/${datasetId}/tables/${tableId}/bulk - Bulk inserting ${records.length} records`);
    
    const result = await bigQueryService.bulkInsert(datasetId, tableId, records);
    res.json({ success: true, inserted: records.length, result });
  } catch (error) {
    console.error('Bulk insert error:', error);
    res.status(500).json({ 
      error: 'Bulk insert failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// GET /api/datasets/:datasetId/tables/:tableId/export - Export data to CSV
router.get('/api/datasets/:datasetId/tables/:tableId/export', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const { format = 'csv' } = req.query;
    
    console.log(`GET /api/datasets/${datasetId}/tables/${tableId}/export - Exporting as ${format}`);
    
    const data = await bigQueryService.getTableData(datasetId, tableId);
    
    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${tableId}.csv"`);
      res.send(csvContent);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Export failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// GET /api/datasets/:datasetId/tables/:tableId/schema - Get table schema for forms
router.get('/api/datasets/:datasetId/tables/:tableId/schema', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    
    console.log(`GET /api/datasets/${datasetId}/tables/${tableId}/schema - Fetching schema`);
    
    const schema = await bigQueryService.getTableSchema(datasetId, tableId);
    res.json(schema);
  } catch (error) {
    console.error('Schema error:', error);
    res.status(500).json({ 
      error: 'Failed to get table schema', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;