import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Edit3, 
  Save, 
  X, 
  Filter, 
  RefreshCw, 
  Database, 
  Table, 
  Plus, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  BarChart3
} from 'lucide-react';

const API_BASE_URL = 'https://bq-admin-interface-production.up.railway.app';

const BigQueryAdmin = () => {
  // State management
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalRows, setTotalRows] = useState(0);
  
  // Editing
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});
  
  // Filtering
  const [filters, setFilters] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch data functions
  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      fetchTables(selectedDataset);
    }
  }, [selectedDataset]);

  useEffect(() => {
    if (selectedTable && selectedDataset) {
      fetchTableData();
    }
  }, [selectedTable, page, rowsPerPage, filters]);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/datasets`);
      if (!response.ok) throw new Error('Failed to fetch datasets');
      const data = await response.json();
      setDatasets(data);
      if (data.length > 0) {
        setSelectedDataset(data[0].id);
      }
    } catch (err) {
      setError('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async (datasetId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/datasets/${datasetId}/tables`);
      if (!response.ok) throw new Error('Failed to fetch tables');
      const data = await response.json();
      setTables(data);
      setSelectedTable(null);
      setTableData([]);
    } catch (err) {
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async () => {
    if (!selectedTable || !selectedDataset) return;
    
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        limit: rowsPerPage.toString(),
        offset: (page * rowsPerPage).toString()
      });

      if (filters.length > 0) {
        queryParams.append('filters', JSON.stringify(filters));
      }

      const response = await fetch(
        `${API_BASE_URL}/api/datasets/${selectedDataset}/tables/${selectedTable.id}/data?${queryParams}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch table data');
      const data = await response.json();
      
      setTableData(data.data || []);
      setTotalRows(data.totalCount || data.data?.length || 0);
      setSchema(selectedTable.schema || []);
    } catch (err) {
      setError('Failed to load table data');
    } finally {
      setLoading(false);
    }
  };

  // Data manipulation functions
  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setPage(0);
    setFilters([]);
    setEditingRow(null);
  };

  const handleEditRow = (rowIndex, rowData) => {
    setEditingRow(rowIndex);
    setEditedData({ ...rowData });
  };

  const handleSaveRow = async () => {
    try {
      setLoading(true);
      const newData = [...tableData];
      newData[editingRow] = editedData;
      setTableData(newData);
      
      setEditingRow(null);
      setEditedData({});
      setSuccess('Row updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const handleCellEdit = (fieldName, value) => {
    setEditedData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const exportToCSV = () => {
    if (!tableData.length || !selectedTable) return;

    const headers = schema.map(field => field.name);
    const csvContent = [
      headers.join(','),
      ...tableData.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = value?.toString() || '';
          return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDataset}_${selectedTable.id}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    setSuccess('CSV exported successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const exportFullTableToCSV = async () => {
    if (!selectedTable || !selectedDataset) return;
    
    try {
      setLoading(true);
      setSuccess('Preparing full export...');
      
      // Fetch all data in larger chunks
      let allData = [];
      let currentPage = 0;
      const chunkSize = 1000;
      
      while (true) {
        const response = await fetch(
          `${API_BASE_URL}/api/datasets/${selectedDataset}/tables/${selectedTable.id}/data?limit=${chunkSize}&offset=${currentPage * chunkSize}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) break;
        
        allData = [...allData, ...data.data];
        currentPage++;
        
        // Update progress
        setSuccess(`Exported ${allData.length} rows...`);
        
        // Break if we got less than chunk size (end of data)
        if (data.data.length < chunkSize) break;
      }

      // Create CSV
      const headers = schema.map(field => field.name);
      const csvContent = [
        headers.join(','),
        ...allData.map(row => 
          headers.map(header => {
            const value = row[header];
            const stringValue = value?.toString() || '';
            return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedDataset}_${selectedTable.id}_FULL_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess(`Full export complete: ${allData.length} rows exported`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to export full table');
    } finally {
      setLoading(false);
    }
  };

  // Filter functions
  const addFilter = () => {
    if (schema.length === 0) return;
    setFilters(prev => [...prev, {
      column: schema[0].name,
      operator: 'equals',
      value: ''
    }]);
  };

  const updateFilter = (index, field, value) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, [field]: value } : filter
    ));
  };

  const removeFilter = (index) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const applyFilters = () => {
    setPage(0);
    fetchTableData();
    setShowFilterPanel(false);
  };

  const clearAllFilters = () => {
    setFilters([]);
    setPage(0);
    fetchTableData();
  };

  // Utility functions
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const renderCellContent = (row, field, rowIndex) => {
    const value = row[field.name];
    const isEditing = editingRow === rowIndex;

    if (isEditing) {
      if (field.type === 'STRING') {
        return (
          <input
            type="text"
            value={editedData[field.name] || ''}
            onChange={(e) => handleCellEdit(field.name, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      } else if (field.type === 'INTEGER' || field.type === 'FLOAT') {
        return (
          <input
            type="number"
            value={editedData[field.name] || ''}
            onChange={(e) => handleCellEdit(field.name, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      } else if (field.type === 'BOOLEAN') {
        return (
          <select
            value={editedData[field.name] || false}
            onChange={(e) => handleCellEdit(field.name, e.target.value === 'true')}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={true}>True</option>
            <option value={false}>False</option>
          </select>
        );
      }
    }

    // Display mode
    if (field.type === 'BOOLEAN') {
      return (
        <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value ? 'True' : 'False'}
        </span>
      );
    }
    
    if (field.type === 'TIMESTAMP' || field.type === 'DATE') {
      return value ? new Date(value).toLocaleString() : '';
    }
    
    if (field.type === 'INTEGER' || field.type === 'FLOAT') {
      return value !== null && value !== undefined ? formatNumber(value) : '';
    }
    
    return value?.toString() || '';
  };

  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'} flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <Database className="h-6 w-6 text-blue-600" />
              {!sidebarCollapsed && (
                <span className="ml-2 text-lg font-semibold text-gray-800">BigQuery Admin</span>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Dataset Selection */}
            <div className="p-4 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dataset</label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Table Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tables List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Tables ({filteredTables.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {filteredTables.map((table) => (
                    <div
                      key={table.id}
                      onClick={() => handleTableSelect(table)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTable?.id === table.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <Table className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="font-medium text-sm text-gray-800">{table.name}</span>
                        <span className={`ml-auto px-2 py-1 text-xs rounded ${
                          table.type === 'VIEW' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {table.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(table.numRows)} rows • {formatBytes(table.numBytes)}
                      </div>
                      {table.description && (
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {table.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedTable ? (
          <>
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedTable.name}</h1>
                  {selectedTable.description && (
                    <p className="text-gray-600 mt-1">{selectedTable.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-600">{formatNumber(selectedTable.numRows)} rows</span>
                    </div>
                    <div className="flex items-center">
                      <Database className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-600">{formatBytes(selectedTable.numBytes)}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      selectedTable.type === 'VIEW' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedTable.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                    {filters.length > 0 && (
                      <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1">
                        {filters.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={fetchTableData}
                    className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </button>
                  <button
                    onClick={exportToCSV}
                    disabled={!tableData.length}
                    className="flex items-center px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export Page
                  </button>
                  <button
                    onClick={exportFullTableToCSV}
                    disabled={!selectedTable}
                    className="flex items-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-md transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export All
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {filters.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Active Filters:</span>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.map((filter, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {filter.column} {filter.operator} {filter.value}
                        <button
                          onClick={() => removeFilter(index)}
                          className="ml-1 hover:text-blue-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Panel */}
              {showFilterPanel && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Configure Filters</h3>
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <select
                        value={filter.column}
                        onChange={(e) => updateFilter(index, 'column', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {schema.map((field) => (
                          <option key={field.name} value={field.name}>
                            {field.name} ({field.type})
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="equals">Equals</option>
                        <option value="contains">Contains</option>
                        <option value="startsWith">Starts With</option>
                        <option value="gt">Greater Than</option>
                        <option value="lt">Less Than</option>
                        <option value="notNull">Not Null</option>
                      </select>
                      
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="px-2 py-1 border border-gray-300 rounded text-sm flex-1"
                      />
                      
                      <button
                        onClick={() => removeFilter(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={addFilter}
                      disabled={!schema.length}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Filter
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-hidden bg-white">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading data...</span>
                </div>
              ) : (
                <>
                  <div className="overflow-auto h-full">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                            Actions
                          </th>
                          {schema.map((field) => (
                            <th
                              key={field.name}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-36"
                            >
                              <div>
                                <div className="font-semibold">{field.name}</div>
                                <div className="text-xs text-gray-400 normal-case">
                                  {field.type} {field.mode !== 'NULLABLE' && '(Required)'}
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              {editingRow === rowIndex ? (
                                <div className="flex space-x-1">
                                  <button
                                    onClick={handleSaveRow}
                                    className="p-1 text-green-600 hover:text-green-800"
                                  >
                                    <Save className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1 text-red-600 hover:text-red-800"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleEditRow(rowIndex, row)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                            {schema.map((field) => (
                              <td key={field.name} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {renderCellContent(row, field, rowIndex)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-700">Rows per page:</span>
                        <select
                          value={rowsPerPage}
                          onChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value));
                            setPage(0);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                          <option value={250}>250</option>
                          <option value={500}>500</option>
                          <option value={1000}>1000</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">
                          {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, totalRows)} of {formatNumber(totalRows)}
                        </span>
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="p-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setPage(page + 1)}
                            disabled={(page + 1) * rowsPerPage >= totalRows}
                            className="p-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Table</h2>
              <p className="text-gray-600">Choose a table from the sidebar to view and edit its data</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Features available:</p>
                <ul className="mt-2 space-y-1">
                  <li>• View and edit table data in real-time</li>
                  <li>• Export current page or entire tables to CSV</li>
                  <li>• Apply filters and search through data</li>
                  <li>• Handle large datasets with pagination</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center">
            <X className="h-4 w-4 mr-2" />
            {error}
            <button onClick={() => setError('')} className="ml-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center">
            {success}
            <button onClick={() => setSuccess('')} className="ml-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BigQueryAdmin;