// Complete frontend API service with CRUD operations
// Location: frontend/src/services/api.ts

// Export interfaces for use in components
export interface Dataset {
  id: string;
  name: string;
  description: string;
  location: string;
  tables?: number;
}

export interface Table {
  id: string;
  name: string;
  type: string;
  numRows: number;
  numBytes: number;
  createdTime: string;
  modifiedTime: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    // Updated to use Railway backend URL as default
    this.baseURL = process.env.REACT_APP_API_URL || 'https://bigquery-admin-backend-production.up.railway.app';
  }

  // Existing methods - GET operations
  async getDatasets(): Promise<Dataset[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/datasets`);
      if (!response.ok) {
        throw new Error('Failed to fetch datasets');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw error;
    }
  }

  async getTables(datasetId: string): Promise<Table[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/datasets/${datasetId}/tables`);
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  }

  async getTableSchema(datasetId: string, tableId: string) {
    try {
      const response = await fetch(`${this.baseURL}/api/datasets/${datasetId}/tables/${tableId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch table schema');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching table schema:', error);
      throw error;
    }
  }

  async getTableData(datasetId: string, tableId: string, limit?: number) {
    try {
      const url = `${this.baseURL}/api/datasets/${datasetId}/tables/${tableId}/data${limit ? `?limit=${limit}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch table data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching table data:', error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // NEW CRUD Operations
  async insertRecord(datasetId: string, tableId: string, record: any) {
    try {
      const response = await fetch(`${this.baseURL}/api/datasets/${datasetId}/tables/${tableId}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to insert record');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error inserting record:', error);
      throw error;
    }
  }

  async updateRecord(datasetId: string, tableId: string, recordId: string, record: any) {
    try {
      const response = await fetch(`${this.baseURL}/api/datasets/${datasetId}/tables/${tableId}/records/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update record');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  }

  async deleteRecord(datasetId: string, tableId: string, recordId: string) {
    try {
      const response = await fetch(`${this.baseURL}/api/datasets/${datasetId}/tables/${tableId}/records/${recordId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete record');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  }

  // Advanced search functionality
  async searchTableData(datasetId: string, tableId: string, searchOptions: {
    searchTerm?: string;
    columns?: string[];
    filters?: Array<{field: string, operator: string, value: any}>;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  }) {
    try {
      const response = await fetch(`${this.baseURL}/api/datasets/${datasetId}/tables/${tableId}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchOptions),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  // Bulk insert functionality
  async bulkInsert(datasetId: string, tableId: string, records: any[]) {
    try {
      const response = await fetch(`${this.baseURL}/api/datasets/${datasetId}/tables/${tableId}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bulk insert failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in bulk insert:', error);
      throw error;
    }
  }

  // Export table data
  async exportTableData(datasetId: string, tableId: string, format: string = 'csv') {
    try {
      const response = await fetch(`${this.baseURL}/api/datasets/${datasetId}/tables/${tableId}/export?format=${format}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }
      
      if (format === 'csv') {
        const blob = await response.blob();
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${tableId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true, message: 'File downloaded successfully' };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Get detailed table schema for form generation
  async getDetailedTableSchema(datasetId: string, tableId: string) {
    try {
      const response = await fetch(`${this.baseURL}/api/datasets/${datasetId}/tables/${tableId}/schema`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get table schema');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting detailed schema:', error);
      throw error;
    }
  }

  // Utility method to handle API errors consistently
  private async handleResponse(response: Response) {
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
  }

  // Connection status check
  async getConnectionStatus() {
    try {
      const isHealthy = await this.checkHealth();
      const datasets = await this.getDatasets();
      
      return {
        connected: true,
        healthy: isHealthy,
        datasetCount: datasets.length,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  // Add method to get current base URL for debugging
  getCurrentBaseURL(): string {
    return this.baseURL;
  }
}

// Export a singleton instance
export const apiService = new ApiService();
export default apiService;