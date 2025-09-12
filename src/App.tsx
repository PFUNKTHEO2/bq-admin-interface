<<<<<<< HEAD
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { DatasetBrowser } from './components/DatasetBrowser/DatasetBrowser';
import { Login } from './components/Login';
import { useAuth } from './hooks/useAuth';
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CssBaseline, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Chip,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import DatasetBrowser from './components/DatasetBrowser/DatasetBrowser';
import { apiService } from './services/api';

interface EditingCell {
  rowIndex: number;
  column: string;
  value: any;
}

// Enhanced TableData component with editing capabilities
const TableDataComponent: React.FC = () => {
  const { datasetId, tableId } = useParams<{ datasetId: string; tableId: string }>();
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingCell, setEditingCell] = React.useState<EditingCell | null>(null);
  const [tempValue, setTempValue] = React.useState('');
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [newRecord, setNewRecord] = React.useState<Record<string, any>>({});
  const [snackbar, setSnackbar] = React.useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [selectedRowIndex, setSelectedRowIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchTableData = async () => {
      if (!datasetId || !tableId) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching data for', datasetId, tableId);
        const response = await apiService.getTableData(datasetId, tableId);
        setData(response.data || []); // FIXED: Extract data array from response
      } catch (err) {
        setError('Failed to load table data');
        console.error('Error fetching table data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [datasetId, tableId]);

  // Filter data based on search
  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Get paginated data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get column names from first row
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const handleCellEdit = (rowIndex: number, column: string, currentValue: any) => {
    setEditingCell({ rowIndex, column, value: currentValue });
    setTempValue(currentValue?.toString() || '');
  };

  const handleSaveCell = async () => {
    if (!editingCell || !datasetId || !tableId) return;

    try {
      const updatedData = [...data];
      updatedData[editingCell.rowIndex][editingCell.column] = tempValue;
      
      // For now, we'll update the local state
      // In a real implementation, you'd call the API to update BigQuery
      // const recordId = updatedData[editingCell.rowIndex].id; // Adjust based on your primary key
      // await apiService.updateRecord(datasetId, tableId, recordId, updatedData[editingCell.rowIndex]);
      
      setData(updatedData);
      setEditingCell(null);
      setSnackbar({ open: true, message: 'Record updated successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update record', severity: 'error' });
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setTempValue('');
  };

  const handleAddRecord = () => {
    const emptyRecord: Record<string, any> = {};
    columns.forEach(col => emptyRecord[col] = '');
    setNewRecord(emptyRecord);
    setShowAddDialog(true);
  };

  const handleSaveNewRecord = async () => {
    if (!datasetId || !tableId) return;

    try {
      // For now, we'll add to local state
      // In a real implementation: await apiService.insertRecord(datasetId, tableId, newRecord);
      
      setData([...data, { ...newRecord, id: Date.now() }]); // Temporary ID
      setShowAddDialog(false);
      setNewRecord({});
      setSnackbar({ open: true, message: 'Record added successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add record', severity: 'error' });
    }
  };

  const handleDeleteRecord = async (rowIndex: number) => {
    if (!datasetId || !tableId) return;

    try {
      // For now, we'll remove from local state
      // In a real implementation:
      // const recordToDelete = data[rowIndex];
      // const recordId = recordToDelete.id; // Adjust based on your primary key
      // await apiService.deleteRecord(datasetId, tableId, recordId);
      
      const updatedData = data.filter((_, index) => index !== rowIndex);
      setData(updatedData);
      setSnackbar({ open: true, message: 'Record deleted successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete record', severity: 'error' });
    }
    setMenuAnchor(null);
  };

  const handleExportData = async () => {
    if (!datasetId || !tableId) return;

    try {
      await apiService.exportTableData(datasetId, tableId, 'csv');
      setSnackbar({ open: true, message: 'Data exported successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to export data', severity: 'error' });
    }
  };

  const renderEditableCell = (row: any, column: string, rowIndex: number) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.column === column;
    const value = row[column];

    if (isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
          <TextField
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            size="small"
            variant="outlined"
            sx={{ minWidth: 120 }}
            autoFocus
          />
          <IconButton size="small" onClick={handleSaveCell} color="primary">
            <SaveIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleCancelEdit}>
            <CancelIcon fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          '&:hover .edit-icon': { opacity: 1 },
          minHeight: '32px',
          cursor: 'pointer'
        }}
        onClick={() => handleCellEdit(rowIndex, column, value)}
      >
        <Typography variant="body2" sx={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          maxWidth: 180
        }}>
          {value?.toString() || ''}
        </Typography>
        <IconButton
          className="edit-icon"
          size="small"
          sx={{ opacity: 0, transition: 'opacity 0.2s', ml: 1 }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading {tableId} data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Add Button */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                {tableId?.replace(/_/g, ' ').toUpperCase()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`Dataset: ${datasetId}`} sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label={`${filteredData.length} records`} sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label={`${columns.length} columns`} sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportData}
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                Export CSV
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRecord}
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                Add Record
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search across all columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Editable Data Table */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', width: 60 }}>
                  Actions
                </TableCell>
                {columns.map((column) => (
                  <TableCell 
                    key={column} 
                    sx={{ 
                      fontWeight: 'bold', 
                      backgroundColor: '#f5f5f5',
                      minWidth: 180,
                      fontSize: '0.875rem'
                    }}
                  >
                    {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex} hover>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setSelectedRowIndex(rowIndex);
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column} sx={{ fontSize: '0.8rem', maxWidth: 250 }}>
                      {renderEditableCell(row, column, rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Row Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          if (selectedRowIndex !== null) handleDeleteRecord(selectedRowIndex);
        }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Record
        </MenuItem>
      </Menu>

      {/* Add Record Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Record</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 2, 
            mt: 1 
          }}>
            {columns.map((column) => (
              <TextField
                key={column}
                label={column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                value={newRecord[column] || ''}
                onChange={(e) => setNewRecord({ ...newRecord, [column]: e.target.value })}
                fullWidth
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveNewRecord} variant="contained">Save Record</Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
>>>>>>> f247f1d617cd6cb23e93e7b4f55589660002ab41

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
<<<<<<< HEAD
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
=======
    background: {
      default: '#f5f5f5',
    },
  },
});

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

>>>>>>> f247f1d617cd6cb23e93e7b4f55589660002ab41
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
<<<<<<< HEAD
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
=======
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Navbar onMenuClick={toggleSidebar} />
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              marginTop: '64px',
              marginLeft: sidebarOpen ? '240px' : '0px',
              transition: 'margin-left 0.3s ease',
              padding: 3,
              backgroundColor: 'background.default',
              minHeight: 'calc(100vh - 64px)'
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/datasets" element={<DatasetBrowser />} />
              <Route path="/datasets/:datasetId" element={<DatasetBrowser />} />
              <Route path="/datasets/:datasetId/tables/:tableId" element={<TableDataComponent />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};
>>>>>>> f247f1d617cd6cb23e93e7b4f55589660002ab41

export default App;