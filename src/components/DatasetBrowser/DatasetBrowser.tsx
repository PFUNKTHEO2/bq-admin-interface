// src/components/DatasetBrowser/DatasetBrowser.tsx
import React from 'react';
import { Typography, Box } from '@mui/material';

export const DatasetBrowser: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dataset Browser
      </Typography>
      <Typography variant="body1">
        Browse your BigQuery datasets here
      </Typography>
    </Box>
  );
}; 