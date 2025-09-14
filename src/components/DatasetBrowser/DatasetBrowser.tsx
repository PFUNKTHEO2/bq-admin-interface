// src/components/DatasetBrowser/DatasetBrowser.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Storage as TableIcon, Visibility } from '@mui/icons-material';
import { apiService } from '../../services/api';

interface Table {
  id: string;
  name: string;
  type: string;
  numRows: number;
  numBytes: number;
  createdTime: string;
  modifiedTime: string;
}

export const DatasetBrowser: React.FC = () => {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      if (!datasetId) return;
      
      try {
        setLoading(true);
        setError(null);
        const tablesData = await apiService.getTables(datasetId);
        setTables(tablesData);
      } catch (err) {
        setError('Failed to load tables');
        console.error('Error fetching tables:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [datasetId]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading tables...
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
        Dataset: {datasetId}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {tables.length} tables found
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Table Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Rows</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tables.map((table) => (
              <TableRow key={table.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TableIcon sx={{ mr: 1, color: 'primary.main' }} />
                    {table.name}
                  </Box>
                </TableCell>
                <TableCell>{table.type}</TableCell>
                <TableCell align="right">{formatNumber(table.numRows)}</TableCell>
                <TableCell align="right">{formatBytes(table.numBytes)}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/datasets/${datasetId}/tables/${table.id}`)}
                  >
                    View Table
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};