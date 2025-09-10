// File: backend/src/routes/datasets.ts
// Replace the entire contents of this file

import { Router } from 'express';
import BigQueryService from '../services/BigQueryService';

const router = Router();

// Get all datasets
router.get('/', async (req, res) => {
  try {
    const datasets = await BigQueryService.getDatasets();
    res.json(datasets);
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

// Get tables in a dataset
router.get('/:datasetId/tables', async (req, res) => {
  try {
    const { datasetId } = req.params;
    const tables = await BigQueryService.getTables(datasetId);
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Get table schema
router.get('/:datasetId/tables/:tableId', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const schema = await BigQueryService.getTableSchema(datasetId, tableId);
    res.json(schema);
  } catch (error) {
    console.error('Error fetching table schema:', error);
    res.status(500).json({ error: 'Failed to fetch table schema' });
  }
});

// Get table data
router.get('/:datasetId/tables/:tableId/data', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const data = await BigQueryService.getTableData(datasetId, tableId, limit);
    res.json(data);
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

export default router;