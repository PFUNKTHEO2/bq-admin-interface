// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { DatasetBrowser } from './components/DatasetBrowser/DatasetBrowser';
import { Login } from './components/Login';
import { useAuth } from './hooks/useAuth';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
const { isAuthenticated, isLoading, login, logout } = useAuth();console.log('App.tsx - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={login} />
      </ThemeProvider>
    );
  }

  // Show main app if authenticated
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout onLogout={logout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/datasets" element={<DatasetBrowser />} />
            <Route path="/datasets/:datasetId" element={<DatasetBrowser />} />
            <Route path="/datasets/:datasetId/tables/:tableId" element={<DatasetBrowser />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;