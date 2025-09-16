import express from 'express';
import BigQueryService from '../services/BigQueryService';

const router = express.Router();
const bigQueryService = new BigQueryService();

// GET /api/datasets
router.get('/datasets', async (req, res) => {
  try {
    console.log('GET /api/datasets - Fetching all datasets');
    const datasets = await bigQueryService.getDatasets();
    res.json(datasets);
  } catch (error: any) {
    console.error('Error fetching datasets:', error?.message);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

// GET /api/datasets/:datasetId/tables
router.get('/datasets/:datasetId/tables', async (req, res) => {
  try {
    const { datasetId } = req.params;
    console.log(`GET /api/datasets/${datasetId}/tables - Fetching tables`);
    const tables = await bigQueryService.getTables(datasetId);
    console.log(`Retrieved ${tables.length} tables from ${datasetId}`);
    res.json(tables);
  } catch (error: any) {
    console.error('Error fetching tables:', error?.message);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// ✅ FIXED: GET /api/datasets/:datasetId/tables/:tableId/data
router.get('/datasets/:datasetId/tables/:tableId/data', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const { limit = 100, filters, sorts } = req.query;

    console.log(`GET /api/datasets/${datasetId}/tables/${tableId}/data - Fetching table data (limit: ${limit})`);

    let options: any = { limit: parseInt(limit as string) };

    // Parse filters if provided
    if (filters) {
      try {
        options.filters = JSON.parse(filters as string);
        console.log('Applied filters:', options.filters);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid filters JSON' });
      }
    }

    // Parse sorts if provided  
    if (sorts) {
      try {
        options.sorts = JSON.parse(sorts as string);
        console.log('Applied sorts:', options.sorts);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid sorts JSON' });
      }
    }

    const result = await bigQueryService.getTableData(datasetId, tableId, options);
    
    // ✅ FIXED: Ensure consistent response format that frontend expects
    const response = {
      data: result.data || result.rows || [], // Support both formats
      totalRows: result.totalCount || result.totalRows || 0,
      hasMore: (result.data?.length || result.rows?.length || 0) === parseInt(limit as string),
      pagination: {
        limit: parseInt(limit as string),
        offset: 0,
        total: result.totalCount || result.totalRows || 0
      },
      source: 'bigquery',
      query: result.query || null
    };
    
    console.log(`Retrieved ${response.data.length} rows from ${datasetId}.${tableId} (total: ${response.totalRows})`);
    res.json(response);
  } catch (error: any) {
    console.error('Error fetching table data:', error?.message);
    console.error('Error stack:', error?.stack);
    
    // Provide detailed error information for debugging
    res.status(500).json({ 
      error: 'Failed to fetch table data',
      details: error.message,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString(),
      requestParams: {
        datasetId: req.params.datasetId,
        tableId: req.params.tableId,
        queryParams: req.query
      }
    });
  }
});

// ✅ FIXED: GET /api/datasets/:datasetId/tables/:tableId - Get table schema (TypeScript errors fixed)
router.get('/datasets/:datasetId/tables/:tableId', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    console.log(`GET /api/datasets/${datasetId}/tables/${tableId} - Fetching schema`);
    
    const schema = await bigQueryService.getTableSchema(datasetId, tableId);
    const tables = await bigQueryService.getTables(datasetId);
    const tableInfo = tables.find((t: any) => t.name === tableId);
    
    const response = {
      tableId,
      name: tableId,
      type: tableInfo?.type || 'TABLE',
      schema: schema.fields || [],
      numRows: tableInfo?.numRows || '0',
      numBytes: tableInfo?.numBytes || '0',
      creationTime: tableInfo?.createdTime || '',
      lastModifiedTime: tableInfo?.modifiedTime || '',
      description: tableInfo?.description || '',
      primaryKey: ['id'],
      editableColumns: schema.fields
        ?.filter((field: any) => field.name !== 'id' && !field.name.includes('created_at') && !field.name.includes('updated_at'))
        .map((field: any) => field.name) || []
    };
    
    console.log(`Retrieved schema for ${datasetId}.${tableId} with ${response.schema.length} fields`);
    res.json(response);
  } catch (error: any) {
    console.error('Error fetching table schema:', error?.message);
    res.status(500).json({ 
      error: 'Failed to fetch table schema',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;