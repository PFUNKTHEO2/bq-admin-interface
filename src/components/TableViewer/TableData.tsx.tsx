import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { apiService } from '../../services/api';

const TableData: React.FC = () => {
  const { datasetId, tableId } = useParams<{ datasetId: string; tableId: string }>();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTableData = async () => {
      if (!datasetId || !tableId) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching data for', datasetId, tableId);
        const response = await apiService.getTableData(datasetId, tableId);
        setData(response.data || []); // Extract the data array from the response
      } catch (err) {
        setError('Failed to load table data');
        console.error('Error fetching table data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [datasetId, tableId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading table data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {tableId} Data
      </Typography>
      <Typography variant="body1">
        Dataset: {datasetId}
      </Typography>
      <Typography variant="body1">
        Found {data.length} records
      </Typography>
      <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </Box>
  );
};

export default TableData;