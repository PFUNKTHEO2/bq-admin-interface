 // src/components/Dashboard/Dashboard.tsx
import React from 'react';
import { Typography, Box } from '@mui/material';

export const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to BigQuery Admin Dashboard
      </Typography>
    </Box>
  );
};
