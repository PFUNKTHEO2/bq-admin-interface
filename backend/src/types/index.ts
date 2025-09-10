// File: backend/src/types/index.ts
// Replace the entire contents of this file

export interface Dataset {
  id: string;
  name: string;
  description: string;
  location: string;
  created: string;
  lastModified: string;
}

export interface Table {
  id: string;
  name: string;
  type: string;
  schema: any[];
  numRows: number;
  numBytes: number;
  created: string;
  lastModified: string;
  description: string;
  labels: any;
  location: string;
}

export interface TableSchema {
  tableId: string;
  schema: any[];
  description: string;
  numRows: string;
  numBytes: string;
  created: string;
  lastModified: string;
}

export interface TableData {
  tableId: string;
  data: any[];
  totalRows: number;
  query: string;
}