// src/components/Dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Chip,
} from '@mui/material';
import {
  Dataset as DatasetIcon,
  TableChart as TableIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { apiService, Dataset } from '../../services/api';

interface DatasetWithTables extends Dataset {
  tableCount?: number;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<DatasetWithTables[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [totalTables, setTotalTables] = useState(0);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await apiService.checkHealth();
        setBackendStatus('connected');
      } catch (err) {
        setBackendStatus('disconnected');
        console.error('Backend health check failed:', err);
      }
    };

    const fetchDataWithTableCounts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get datasets
        const datasetsData = await apiService.getDatasets();
        
        // Then get table counts for each dataset
        const datasetsWithCounts = await Promise.all(
          datasetsData.map(async (dataset) => {
            try {
              const tables = await apiService.getTables(dataset.id);
              return { ...dataset, tableCount: tables.length };
            } catch (err) {
              console.error(`Error fetching tables for ${dataset.id}:`, err);
              return { ...dataset, tableCount: 0 };
            }
          })
        );
        
        setDatasets(datasetsWithCounts);
        
        // Calculate total tables
        const total = datasetsWithCounts.reduce((sum, dataset) => sum + (dataset.tableCount || 0), 0);
        setTotalTables(total);
        
      } catch (err) {
        setError('Failed to load datasets. Check your backend connection.');
        console.error('Error fetching datasets:', err);
      } finally {
        setLoading(false);
      }
    };

    checkBackendHealth();
    fetchDataWithTableCounts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          BigQuery Admin Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage and explore your hockey-data-analysis project datasets
        </Typography>
      </Box>

      {/* Backend Status Alert */}
      {backendStatus === 'disconnected' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Backend Disconnected - Check if your backend server is running on localhost:3001
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        mb: 4,
        flexWrap: 'wrap',
        '& > *': { flex: '1 1 250px', minWidth: 250 }
      }}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent sx={{ color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {datasets.length}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Datasets
                </Typography>
              </Box>
              <DatasetIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <CardContent sx={{ color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {totalTables}+
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Tables
                </Typography>
              </Box>
              <TableIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <CardContent sx={{ color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  43
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Algorithms
                </Typography>
              </Box>
              <SpeedIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: backendStatus === 'connected' 
            ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
            : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        }}>
          <CardContent sx={{ color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {backendStatus === 'connected' ? 'Fast' : 'Down'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Response Time
                </Typography>
              </Box>
              {backendStatus === 'connected' ? (
                <CheckIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              ) : (
                <ErrorIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Available Datasets */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Available Datasets
      </Typography>

      {datasets.length === 0 ? (
        <Alert severity="info">
          No datasets available. Check your backend connection.
        </Alert>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          flexWrap: 'wrap',
          '& > *': { flex: '1 1 300px', minWidth: 300 }
        }}>
          {datasets.map((dataset) => (
            <Card key={dataset.id} sx={{ 
              height: 'fit-content',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StorageIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                    {dataset.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                  {dataset.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip 
                    icon={<TableIcon />} 
                    label={`${dataset.tableCount || 0} tables`} 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                  />
                  <Chip 
                    icon={<LocationIcon />} 
                    label={dataset.location} 
                    color="secondary" 
                    variant="outlined" 
                    size="small"
                  />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/datasets/${dataset.id}`)}
                  sx={{ 
                    py: 1.5,
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                    }
                  }}
                >
                  Explore Dataset
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};