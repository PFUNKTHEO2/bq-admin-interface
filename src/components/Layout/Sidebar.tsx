import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  TableChart as TableIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 240;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
  },
  {
    text: 'Datasets',
    icon: <StorageIcon />,
    path: '/datasets',
  },
  {
    text: 'Query Editor',
    icon: <SearchIcon />,
    path: '/query',
  },
];

const secondaryItems = [
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isSelected = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, mt: 8 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Navigation
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Main Navigation */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isSelected(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isSelected(item.path) ? 'white' : 'action.active',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isSelected(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Dataset Quick Links */}
      <Box sx={{ px: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Quick Access
        </Typography>
        <List dense>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/datasets/hockey')}
              sx={{ borderRadius: 1, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <TableIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Hockey Dataset"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/datasets/crm')}
              sx={{ borderRadius: 1, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <TableIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="CRM Dataset"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/datasets/tournament_consolidation')}
              sx={{ borderRadius: 1, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <TableIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Tournament Data"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      
      {/* Secondary Items - at bottom */}
      <Box sx={{ mt: 'auto', pb: 2 }}>
        <Divider sx={{ mb: 1 }} />
        <List>
          {secondaryItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isSelected(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
