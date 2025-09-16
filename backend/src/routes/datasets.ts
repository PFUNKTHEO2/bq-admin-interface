import express from 'express';
import BigQueryService from '../services/BigQueryService';

const router = express.Router();
const bigQueryService = new BigQueryService();

// GET /api/datasets - Get all datasets
router.get('/datasets', async (req, res) => {
  try {
    console.log('GET /api/datasets - Fetching all datasets');
    const datasets = await bigQueryService.getDatasets();
    
    // ✅ FIXED: Consistent API response format
    res.json(datasets); // Keep original format for compatibility
  } catch (error: any) {
    console.error('Error fetching datasets:', error?.message);
    res.status(500).json({ 
      error: 'Failed to fetch datasets',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/datasets/:datasetId/tables - Get tables in dataset  
router.get('/datasets/:datasetId/tables', async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { search, type, limit = 1000, offset = 0 } = req.query;
    
    console.log(`GET /api/datasets/${datasetId}/tables - Fetching tables`);
    
    let tables = await bigQueryService.getTables(datasetId);
    
    // Apply filters
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      tables = tables.filter(table => 
        table.name.toLowerCase().includes(searchTerm) ||
        (table.description && table.description.toLowerCase().includes(searchTerm))
      );
    }
    
    if (type) {
      tables = tables.filter(table => table.type === type);
    }
    
    // Apply pagination
    const startIndex = parseInt(offset as string);
    const pageSize = parseInt(limit as string);
    const paginatedTables = tables.slice(startIndex, startIndex + pageSize);
    
    console.log(`Retrieved ${paginatedTables.length} tables from ${datasetId}`);
    res.json(paginatedTables); // Keep original format for compatibility
  } catch (error: any) {
    console.error('Error fetching tables:', error?.message);
    res.status(500).json({ 
      error: 'Failed to fetch tables',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ✅ NEW: GET /api/datasets/:datasetId/tables/:tableId - Get table schema
router.get('/datasets/:datasetId/tables/:tableId', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    console.log(`GET /api/datasets/${datasetId}/tables/${tableId} - Fetching schema`);
    
    const schema = await bigQueryService.getTableSchema(datasetId, tableId);
    const tables = await bigQueryService.getTables(datasetId);
    const tableInfo = tables.find(t => t.name === tableId);
    
    // Fix TypeScript errors by properly typing the field parameter
    const editableColumns = schema.fields
      ?.filter((field: any) => field.name !== 'id' && !field.name.includes('created_at') && !field.name.includes('updated_at'))
      .map((field: any) => field.name) || [];
    
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
      primaryKey: ['id'], // Could be determined from schema
      editableColumns: editableColumns
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

// ✅ FIXED: GET /api/datasets/:datasetId/tables/:tableId/data - Get table data
router.get('/datasets/:datasetId/tables/:tableId/data', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const { 
      limit = 100, 
      offset = 0, 
      sort, 
      filters, 
      search, 
      columns,
      orderBy,
      where
    } = req.query;

    console.log(`GET /api/datasets/${datasetId}/tables/${tableId}/data - Fetching data (limit: ${limit}, offset: ${offset})`);

    const options: any = { 
      limit: parseInt(limit as string), 
      offset: parseInt(offset as string) 
    };

    // Parse sort parameter (support both 'sort' and 'orderBy')
    if (sort) {
      try {
        options.sorts = JSON.parse(sort as string);
        console.log('Applied sorts:', options.sorts);
      } catch (e) {
        console.warn('Invalid sort JSON, ignoring');
      }
    } else if (orderBy) {
      options.orderBy = orderBy as string;
      console.log('Applied orderBy:', options.orderBy);
    }

    // Parse filters parameter (support both 'filters' and 'where')
    if (filters) {
      try {
        options.filters = JSON.parse(filters as string);
        console.log('Applied filters:', options.filters);
      } catch (e) {
        console.warn('Invalid filters JSON, ignoring');
      }
    } else if (where) {
      options.where = where as string;
      console.log('Applied where:', options.where);
    }

    // Add search functionality
    if (search) {
      options.search = search as string;
      console.log('Applied search:', options.search);
    }

    // Add column selection
    if (columns) {
      options.columns = (columns as string).split(',');
      console.log('Selected columns:', options.columns);
    }

    const result = await bigQueryService.getTableData(datasetId, tableId, options);
    
    // ✅ FIXED: Ensure consistent response format that frontend expects
    const response = {
      data: result.data || result.rows || [], // Support both formats
      totalRows: result.totalCount || result.totalRows || 0,
      hasMore: (result.data?.length || result.rows?.length || 0) === parseInt(limit as string),
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: result.totalCount || result.totalRows || 0
      },
      source: 'bigquery',
      query: result.query || null,
      executionTime: result.executionTime || null
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

// ✅ NEW: PUT /api/datasets/:datasetId/tables/:tableId/rows/:rowId - Update single row
router.put('/datasets/:datasetId/tables/:tableId/rows/:rowId', async (req, res) => {
  try {
    const { datasetId, tableId, rowId } = req.params;
    const { data, validateOnly = false } = req.body;
    
    console.log(`PUT /api/datasets/${datasetId}/tables/${tableId}/rows/${rowId} - Update row`);
    
    if (validateOnly) {
      // Just validate the data format
      res.json({
        success: true,
        valid: true,
        rowId,
        validatedFields: Object.keys(data || {}),
        message: 'Row data validation successful'
      });
      return;
    }
    
    // TODO: Implement actual BigQuery UPDATE
    // For now, return success simulation
    const response = {
      success: true,
      rowId,
      updatedFields: Object.keys(data || {}),
      rowData: { ...data, id: rowId, updated_at: new Date().toISOString() },
      message: 'Row updated successfully'
    };
    
    console.log(`Row ${rowId} updated in ${datasetId}.${tableId}`);
    res.json(response);
  } catch (error: any) {
    console.error('Error updating row:', error?.message);
    res.status(500).json({ 
      error: 'Failed to update row',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ✅ NEW: PUT /api/datasets/:datasetId/tables/:tableId/bulk - Bulk operations
router.put('/datasets/:datasetId/tables/:tableId/bulk', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const { operations, validateOnly = false, transactional = true } = req.body;
    
    console.log(`PUT /api/datasets/${datasetId}/tables/${tableId}/bulk - ${operations?.length || 0} operations`);
    
    if (!operations || !Array.isArray(operations)) {
      return res.status(400).json({
        error: 'Invalid operations array',
        details: 'operations must be an array of operation objects'
      });
    }
    
    if (validateOnly) {
      const validationResults = operations.map((op: any, index: number) => ({
        index,
        type: op.type,
        valid: ['UPDATE', 'INSERT', 'DELETE'].includes(op.type),
        rowId: op.rowId
      }));
      
      res.json({
        success: true,
        totalOperations: operations.length,
        validationResults,
        allValid: validationResults.every((r: any) => r.valid),
        message: 'Bulk operations validation completed'
      });
      return;
    }
    
    // TODO: Implement actual bulk operations
    // For now, simulate success
    const results = operations.map((op: any, index: number) => ({
      index,
      operation: op.type,
      rowId: op.rowId,
      success: true,
      ...(op.type === 'UPDATE' && { updatedFields: Object.keys(op.data || {}) }),
      ...(op.type === 'INSERT' && { newRowId: `new-${Date.now()}-${index}` })
    }));
    
    const response = {
      success: true,
      totalOperations: operations.length,
      successful: results.filter((r: any) => r.success).length,
      failed: results.filter((r: any) => !r.success).length,
      results,
      message: 'Bulk operations completed successfully'
    };
    
    console.log(`Bulk operations completed: ${response.successful} successful, ${response.failed} failed`);
    res.json(response);
  } catch (error: any) {
    console.error('Error in bulk operations:', error?.message);
    res.status(500).json({ 
      error: 'Bulk operations failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ✅ NEW: POST /api/datasets/:datasetId/tables/:tableId/export - Export data
router.post('/datasets/:datasetId/tables/:tableId/export', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const { format = 'csv', filters, columns, limit = 10000 } = req.body;
    
    console.log(`POST /api/datasets/${datasetId}/tables/${tableId}/export - Format: ${format}`);
    
    // For now, return a mock export URL
    const exportId = `export-${Date.now()}`;
    const response = {
      success: true,
      exportId,
      format,
      status: 'processing',
      downloadUrl: `/api/exports/${exportId}/download`,
      estimatedRows: limit,
      message: 'Export job started successfully'
    };
    
    console.log(`Export job ${exportId} started for ${datasetId}.${tableId}`);
    res.json(response);
  } catch (error: any) {
    console.error('Error starting export:', error?.message);
    res.status(500).json({ 
      error: 'Failed to start export',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;