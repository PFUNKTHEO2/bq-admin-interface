import express from 'express';
import BigQueryService from '../services/BigQueryService';

const router = express.Router();
const bigQueryService = new BigQueryService();

// GET /api/datasets - Get all datasets
router.get('/datasets', async (req, res) => {
  try {
    console.log('GET /api/datasets - Fetching all datasets');
    console.log('Fetching datasets...');
    const datasets = await bigQueryService.getDatasets();
    console.log(`Found ${datasets.length} datasets`);
    res.json(datasets);
  } catch (error: any) {
    console.error('Error fetching datasets:', error?.message);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

// GET /api/datasets/:datasetId/tables - Get tables in dataset
router.get('/datasets/:datasetId/tables', async (req, res) => {
  try {
    const { datasetId } = req.params;
    console.log(`GET /api/datasets/${datasetId}/tables - Fetching tables`);
    console.log(`Fetching tables for dataset: ${datasetId}`);
    const tables = await bigQueryService.getTables(datasetId);
    console.log(`Found ${tables.length} tables in ${datasetId}`);
    res.json(tables);
  } catch (error: any) {
    console.error('Error fetching tables:', error?.message);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// GET /api/datasets/:datasetId/tables/:tableId/data - Get table data with enhanced filtering
router.get('/datasets/:datasetId/tables/:tableId/data', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const { limit = 100, filters, sorts } = req.query;

    console.log(`GET /api/datasets/${datasetId}/tables/${tableId}/data - Fetching table data (limit: ${limit})`);
    console.log(`Fetching data for table: ${datasetId}.${tableId} (limit: ${limit})`);

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

    const data = await bigQueryService.getTableData(datasetId, tableId, options);
    console.log(`Retrieved ${data.data?.length || 0} rows from ${datasetId}.${tableId}`);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching table data:', error?.message);
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

export default router;  // ✅ CORRECT - exports router