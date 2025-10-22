/**
 * File Upload Parser
 * Handles parsing and validation of uploaded CSV/Excel files
 * Uses Papa Parse for CSV and SheetJS for Excel
 */

import * as XLSX from 'xlsx';
import { TemplateType } from '@/lib/services/templateGenerator';
import { validateBulkData, parseCSV, ValidationResult } from '@/lib/validators/bulkDataValidator';

/**
 * Parse and validate an uploaded file
 */
export async function parseAndValidateFile(
  file: File,
  templateType: TemplateType
): Promise<ValidationResult> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  let data: any[] = [];
  
  try {
    if (fileExtension === 'csv') {
      data = await parseCSVFile(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      data = await parseExcelFile(file);
    } else {
      throw new Error('Unsupported file format');
    }
    
    // Validate the parsed data
    return validateBulkData(data, templateType);
    
  } catch (error) {
    console.error('File parsing error:', error);
    return {
      isValid: false,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      errors: [{
        row: 0,
        column: '',
        field: 'File',
        value: '',
        error: error instanceof Error ? error.message : 'Failed to parse file',
        severity: 'error'
      }],
      warnings: [],
      validatedData: []
    };
  }
}

/**
 * Parse CSV file
 */
async function parseCSVFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read CSV file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Parse Excel file
 */
async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON, skipping first 5 header rows
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          range: 5, // Start from row 6 (0-indexed, so row 5)
          defval: '',
          raw: false // Convert dates to strings
        });
        
        // Normalize column names to match template field names
        const normalizedData = jsonData.map((row: any) => {
          const normalized: any = {};
          Object.keys(row).forEach(key => {
            // Convert display names to field names (e.g., "Device Name" -> "device_name")
            const fieldName = key.toLowerCase().replace(/\s+/g, '_');
            normalized[fieldName] = row[key];
          });
          return normalized;
        });
        
        resolve(normalizedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export validation errors to a downloadable file
 */
export function exportValidationErrors(errors: any[], filename: string = 'validation_errors.csv'): void {
  if (errors.length === 0) return;
  
  const csvContent = [
    ['Row', 'Column', 'Field', 'Value', 'Error', 'Severity'].join(','),
    ...errors.map(e => [
      e.row,
      e.column,
      e.field,
      e.value,
      e.error,
      e.severity
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

