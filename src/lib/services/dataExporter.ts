/**
 * Data Export Service
 * Exports data from various admin panels to CSV/Excel/JSON
 * Supports filtering, custom columns, and formatting
 */

import * as XLSX from 'xlsx';

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  filename?: string;
  columns?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
  includeHeaders?: boolean;
  formatDates?: boolean;
}

export type ExportDataType =
  | 'users'
  | 'devices'
  | 'marketplace_listings'
  | 'lost_reports'
  | 'stakeholder_registrations'
  | 'stakeholders'
  | 'transactions'
  | 'security_logs';

/**
 * Column definitions for each data type
 */
const COLUMN_DEFINITIONS: Record<ExportDataType, Record<string, string>> = {
  users: {
    id: 'User ID',
    email: 'Email',
    display_name: 'Display Name',
    role: 'Role',
    phone: 'Phone',
    verification_status: 'Verified',
    created_at: 'Registered Date'
  },
  devices: {
    id: 'Device ID',
    device_name: 'Device Name',
    brand: 'Brand',
    model: 'Model',
    serial_number: 'Serial Number',
    imei: 'IMEI',
    device_type: 'Type',
    color: 'Color',
    storage_capacity: 'Storage',
    purchase_date: 'Purchase Date',
    purchase_price: 'Purchase Price',
    status: 'Status',
    created_at: 'Registered Date'
  },
  marketplace_listings: {
    id: 'Listing ID',
    title: 'Title',
    price: 'Price',
    brand: 'Brand',
    model: 'Model',
    condition: 'Condition',
    status: 'Status',
    view_count: 'Views',
    created_at: 'Listed Date',
    sold_at: 'Sold Date'
  },
  lost_reports: {
    id: 'Report ID',
    report_type: 'Type',
    device_category: 'Device Category',
    device_model: 'Device Model',
    serial_number: 'Serial Number',
    incident_date: 'Incident Date',
    location_address: 'Location',
    reward_amount: 'Reward',
    status: 'Status',
    created_at: 'Reported Date'
  },
  stakeholder_registrations: {
    user_id: 'User ID',
    email: 'Email',
    display_name: 'Name',
    role: 'Stakeholder Type',
    business_name: 'Business Name',
    approval_status: 'Status',
    device_count: 'Devices',
    created_at: 'Registered Date'
  },
  stakeholders: {
    user_id: 'User ID',
    email: 'Email',
    display_name: 'Name',
    role: 'Stakeholder Type',
    business_name: 'Business Name',
    approval_status: 'Status',
    device_count: 'Devices',
    created_at: 'Registered Date'
  },
  transactions: {
    id: 'Transaction ID',
    amount: 'Amount',
    currency: 'Currency',
    transaction_type: 'Type',
    status: 'Status',
    from_user: 'From',
    to_user: 'To',
    created_at: 'Date'
  },
  security_logs: {
    id: 'Log ID',
    user_id: 'User ID',
    event_type: 'Event Type',
    ip_address: 'IP Address',
    user_agent: 'User Agent',
    severity: 'Severity',
    created_at: 'Date'
  }
};

/**
 * Format a value for export
 */
function formatValue(value: any, formatDates: boolean = true): any {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle dates
  if (value instanceof Date) {
    return formatDates ? value.toISOString().split('T')[0] : value.toISOString();
  }

  // Handle date strings
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
    const date = new Date(value);
    return formatDates ? date.toISOString().split('T')[0] : value;
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle objects/arrays
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
}

/**
 * Filter data based on options
 */
function filterData(data: any[], options: ExportOptions): any[] {
  let filtered = [...data];

  // Apply date range filter
  if (options.dateRange) {
    filtered = filtered.filter(row => {
      const rowDate = new Date(row.created_at || row.date);
      return rowDate >= options.dateRange!.start && rowDate <= options.dateRange!.end;
    });
  }

  // Apply custom filters
  if (options.filters) {
    filtered = filtered.filter(row => {
      return Object.entries(options.filters!).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true;
        return row[key] === value;
      });
    });
  }

  return filtered;
}

/**
 * Select columns from data
 */
function selectColumns(
  data: any[],
  columns: string[] | undefined,
  dataType: ExportDataType
): any[] {
  if (!columns || columns.length === 0) {
    return data;
  }

  return data.map(row => {
    const selected: any = {};
    columns.forEach(col => {
      selected[col] = row[col];
    });
    return selected;
  });
}

/**
 * Get column headers
 */
function getHeaders(
  columns: string[],
  dataType: ExportDataType
): string[] {
  const defs = COLUMN_DEFINITIONS[dataType];
  return columns.map(col => defs[col] || col);
}

/**
 * Export to CSV format
 */
function exportToCSV(
  data: any[],
  columns: string[],
  dataType: ExportDataType,
  options: ExportOptions
): string {
  const rows: string[][] = [];

  // Add headers
  if (options.includeHeaders !== false) {
    rows.push(getHeaders(columns, dataType));
  }

  // Add data rows
  data.forEach(row => {
    const rowData = columns.map(col => {
      const value = formatValue(row[col], options.formatDates);
      // Escape CSV special characters
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    rows.push(rowData);
  });

  return rows.map(row => row.join(',')).join('\n');
}

/**
 * Export to Excel format
 */
function exportToExcel(
  data: any[],
  columns: string[],
  dataType: ExportDataType,
  options: ExportOptions
): ArrayBuffer {
  // Prepare data with headers
  const headers = getHeaders(columns, dataType);
  const rows = data.map(row => 
    columns.map(col => formatValue(row[col], options.formatDates))
  );

  // Create workbook
  const wb = XLSX.utils.book_new();
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = columns.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  // Add autofilter
  ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(columns.length - 1)}1` };

  // Add sheet to workbook
  const sheetName = dataType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Add summary sheet
  const summaryData = [
    ['Export Summary'],
    ['Data Type', dataType],
    ['Total Records', data.length],
    ['Export Date', new Date().toISOString()],
    ['Columns', columns.length],
    []
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Generate buffer
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

/**
 * Export to JSON format
 */
function exportToJSON(
  data: any[],
  columns: string[],
  options: ExportOptions
): string {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
      columns: columns,
      filters: options.filters || {},
      dateRange: options.dateRange || null
    },
    data: data.map(row => {
      const formatted: any = {};
      columns.forEach(col => {
        formatted[col] = formatValue(row[col], false); // Keep dates as ISO strings in JSON
      });
      return formatted;
    })
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Main export function
 */
export async function exportData(
  data: any[],
  dataType: ExportDataType,
  options: ExportOptions = { format: 'csv' }
): Promise<void> {
  // Filter data
  const filtered = filterData(data, options);

  if (filtered.length === 0) {
    throw new Error('No data to export after applying filters');
  }

  // Determine columns
  const columns = options.columns || Object.keys(COLUMN_DEFINITIONS[dataType]);

  // Select columns
  const selected = selectColumns(filtered, columns, dataType);

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = options.filename || 
    `stolen_${dataType}_export_${timestamp}.${options.format}`;

  // Export based on format
  let blob: Blob;

  switch (options.format) {
    case 'csv':
      const csv = exportToCSV(selected, columns, dataType, options);
      blob = new Blob([csv], { type: 'text/csv' });
      break;

    case 'xlsx':
      const xlsx = exportToExcel(selected, columns, dataType, options);
      blob = new Blob([xlsx], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      break;

    case 'json':
      const json = exportToJSON(selected, columns, options);
      blob = new Blob([json], { type: 'application/json' });
      break;

    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }

  // Download file
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export with filters preserved from UI state
 */
export async function exportWithFilters(
  data: any[],
  dataType: ExportDataType,
  uiFilters: Record<string, any>,
  format: 'csv' | 'xlsx' | 'json' = 'csv'
): Promise<void> {
  await exportData(data, dataType, {
    format,
    filters: uiFilters,
    formatDates: true,
    includeHeaders: true
  });
}

/**
 * Quick export function for admin panels
 */
export async function quickExport(
  data: any[],
  dataType: ExportDataType,
  format: 'csv' | 'xlsx' = 'xlsx'
): Promise<void> {
  await exportData(data, dataType, {
    format,
    formatDates: true,
    includeHeaders: true
  });
}

/**
 * Get available columns for a data type
 */
export function getAvailableColumns(dataType: ExportDataType): { key: string; label: string }[] {
  const defs = COLUMN_DEFINITIONS[dataType];
  return Object.entries(defs).map(([key, label]) => ({ key, label }));
}

/**
 * Estimate export file size
 */
export function estimateFileSize(
  rowCount: number,
  columnCount: number,
  format: 'csv' | 'xlsx' | 'json'
): number {
  const avgCellSize = 50; // bytes per cell
  const rowSize = columnCount * avgCellSize;
  const dataSize = rowCount * rowSize;

  // Format overhead
  const overhead = {
    csv: 1.1, // 10% overhead for delimiters
    xlsx: 1.5, // 50% overhead for XML structure
    json: 2.0  // 100% overhead for JSON structure
  };

  return Math.round(dataSize * overhead[format]);
}

/**
 * Check if export should use Google Drive (file too large)
 */
export function shouldUseGoogleDrive(estimatedSize: number): boolean {
  const THRESHOLD = 5 * 1024 * 1024; // 5MB
  return estimatedSize > THRESHOLD;
}

