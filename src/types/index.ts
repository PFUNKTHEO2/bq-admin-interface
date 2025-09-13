// backend/src/types/index.ts
// Complete type definitions for BigQuery Admin Interface

export interface Dataset {
  id: string;
  name: string;
  description: string;
  location: string;
  created: string;
  lastModified: string;
  tableCount?: number;
}

export interface Table {
  id: string;
  name: string;
  type: string;
  schema: any;
  numRows: number;
  numBytes: number;
  createdTime: string;
  modifiedTime: string;  // CHANGE FROM lastModified TO modifiedTime
  description: string;
  labels: any;
  location: string;
}

export interface TableSchema {
  tableId: string;
  schema: {
    fields: SchemaField[];
  };
}

export interface SchemaField {
  name: string;
  type: string;
  mode: 'REQUIRED' | 'NULLABLE' | 'REPEATED';
  description?: string;
}

export interface TableData {
  tableId: string;
  data: any[];
  totalRows: number;
  query?: string;
}

// FILTERING AND SORTING INTERFACES
export interface FilterCondition {
  id: string;
  column: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'notNull' | 'isNull';
  value: any;
  dataType: 'string' | 'number' | 'date' | 'boolean';
}

export interface SortCondition {
  column: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export interface TableDataOptions {
  offset?: number;
  limit?: number;
  filters?: FilterCondition[];
  sorts?: SortCondition[];
}

export interface TableDataResponse {
  tableId: string;
  data: any[];
  totalRows: number;
  totalCount: number;
  filteredCount: number;
  page?: number;
  pageSize?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  filters?: FilterCondition[];
  sorts?: SortCondition[];
  query?: string;
}

// ADDITIONAL RESPONSE TYPES
export interface TableStats {
  tableId: string;
  rowCount: number;
  sizeBytes: number;
  lastModified: string;
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}