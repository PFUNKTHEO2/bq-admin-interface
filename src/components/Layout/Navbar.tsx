import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#1976d2',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <StorageIcon sx={{ mr: 1 }} />
        
        <Typography 
          variant="h6" 
          noWrap 
          component="div"
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
          }}
        >
          BigQuery Admin Interface
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label="hockey-data-analysis"
            variant="outlined"
            size="small"
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          
          <Chip
            label="Development Mode"
            variant="outlined"
            size="small"
            sx={{
              color: '#4caf50',
              borderColor: '#4caf50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
