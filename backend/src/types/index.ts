export interface Dataset {
  id: string;
  name: string;
  description: string;
  created: Date;
  location: string;
  [key: string]: any; // Allow additional properties
}

export interface Table {
  id: string;
  name: string;
  description: string;
  created: Date;
  numRows: number;
  numBytes: number;
  [key: string]: any; // Allow additional properties
}

export interface TableField {
  name: string;
  type: string;
  mode: string;
  description?: string;
  [key: string]: any; // Allow additional properties
}

export interface TableSchema {
  fields: TableField[];
  description: string;
  numRows: number;
  numBytes: number;
  created: Date;
  modified: Date;
  [key: string]: any; // Allow additional properties
}