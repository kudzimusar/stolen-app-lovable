/**
 * Bulk Data Validation Engine
 * Validates uploaded data against template rules
 * Provides detailed error reporting with row/column references
 */

import { z } from 'zod';
import { TemplateField, TemplateType, getTemplateFields } from '../services/templateGenerator';

export interface ValidationError {
  row: number;
  column: string;
  field: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  validatedData: any[];
}

/**
 * Validate a single field value
 */
function validateField(
  field: TemplateField,
  value: any,
  rowIndex: number,
  allData: any[]
): ValidationError | null {
  // Handle empty values
  if (value === null || value === undefined || value === '') {
    if (field.required) {
      return {
        row: rowIndex,
        column: field.name,
        field: field.displayName,
        value,
        error: `Required field is empty`,
        severity: 'error'
      };
    }
    return null; // Empty non-required field is OK
  }

  // Convert value to string for validation
  const stringValue = String(value).trim();

  // Type validation
  switch (field.type) {
    case 'text':
      if (field.maxLength && stringValue.length > field.maxLength) {
        return {
          row: rowIndex,
          column: field.name,
          field: field.displayName,
          value: stringValue,
          error: `Text exceeds maximum length of ${field.maxLength} characters`,
          severity: 'error'
        };
      }
      break;

    case 'number':
      if (isNaN(Number(stringValue))) {
        return {
          row: rowIndex,
          column: field.name,
          field: field.displayName,
          value: stringValue,
          error: `Invalid number format`,
          severity: 'error'
        };
      }
      if (Number(stringValue) < 0) {
        return {
          row: rowIndex,
          column: field.name,
          field: field.displayName,
          value: stringValue,
          error: `Number must be positive`,
          severity: 'error'
        };
      }
      break;

    case 'date':
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(stringValue)) {
        return {
          row: rowIndex,
          column: field.name,
          field: field.displayName,
          value: stringValue,
          error: `Invalid date format. Use YYYY-MM-DD`,
          severity: 'error'
        };
      }
      const date = new Date(stringValue);
      if (isNaN(date.getTime())) {
        return {
          row: rowIndex,
          column: field.name,
          field: field.displayName,
          value: stringValue,
          error: `Invalid date`,
          severity: 'error'
        };
      }
      // Check if date is in the future (for purchase_date, incident_date)
      if (field.name.includes('date') && !field.name.includes('expiry') && date > new Date()) {
        return {
          row: rowIndex,
          column: field.name,
          field: field.displayName,
          value: stringValue,
          error: `Date cannot be in the future`,
          severity: 'error'
        };
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringValue)) {
        return {
          row: rowIndex,
          column: field.name,
          field: field.displayName,
          value: stringValue,
          error: `Invalid email format`,
          severity: 'error'
        };
      }
      break;

    case 'phone':
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      const cleanPhone = stringValue.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        return {
          row: rowIndex,
          column: field.name,
          field: field.displayName,
          value: stringValue,
          error: `Invalid phone number format. Use international format (e.g., +27821234567)`,
          severity: 'error'
        };
      }
      break;

    case 'url':
      try {
        new URL(stringValue);
      } catch {
        return {
          row: rowIndex,
          column: field.name,
          field: field.displayName,
          value: stringValue,
          error: `Invalid URL format`,
          severity: 'error'
        };
      }
      break;

    case 'dropdown':
      if (field.options && !field.options.includes(stringValue.toLowerCase())) {
        return {
          row: rowIndex,
          column: field.name,
          field: field.displayName,
          value: stringValue,
          error: `Invalid option. Must be one of: ${field.options.join(', ')}`,
          severity: 'error'
        };
      }
      break;
  }

  // Pattern validation
  if (field.pattern) {
    const regex = new RegExp(field.pattern);
    if (!regex.test(stringValue)) {
      return {
        row: rowIndex,
        column: field.name,
        field: field.displayName,
        value: stringValue,
        error: `Value does not match required pattern`,
        severity: 'error'
      };
    }
  }

  // Special field validations
  if (field.name === 'imei' && stringValue.length !== 15) {
    return {
      row: rowIndex,
      column: field.name,
      field: field.displayName,
      value: stringValue,
      error: `IMEI must be exactly 15 digits`,
      severity: 'error'
    };
  }

  return null;
}

/**
 * Check for duplicate values in unique fields
 */
function checkDuplicates(
  data: any[],
  uniqueFields: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenValues: Map<string, Map<any, number[]>> = new Map();

  // Initialize tracking for each unique field
  uniqueFields.forEach(field => {
    seenValues.set(field, new Map());
  });

  // Check each row
  data.forEach((row, index) => {
    uniqueFields.forEach(field => {
      const value = row[field];
      if (value) {
        const fieldMap = seenValues.get(field)!;
        if (fieldMap.has(value)) {
          const previousRows = fieldMap.get(value)!;
          errors.push({
            row: index + 6, // +6 for header rows
            column: field,
            field: field,
            value,
            error: `Duplicate value found (also in row(s) ${previousRows.map(r => r + 6).join(', ')})`,
            severity: 'error'
          });
          previousRows.push(index);
        } else {
          fieldMap.set(value, [index]);
        }
      }
    });
  });

  return errors;
}

/**
 * Validate cross-field business rules
 */
function validateBusinessRules(
  row: any,
  rowIndex: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Rule: warranty_expiry must be after purchase_date
  if (row.purchase_date && row.warranty_expiry) {
    const purchaseDate = new Date(row.purchase_date);
    const expiryDate = new Date(row.warranty_expiry);
    if (expiryDate < purchaseDate) {
      errors.push({
        row: rowIndex,
        column: 'warranty_expiry',
        field: 'Warranty Expiry Date',
        value: row.warranty_expiry,
        error: 'Warranty expiry date cannot be before purchase date',
        severity: 'error'
      });
    }
  }

  // Rule: incident_date should be recent (within last 2 years) - warning only
  if (row.incident_date) {
    const incidentDate = new Date(row.incident_date);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    if (incidentDate < twoYearsAgo) {
      errors.push({
        row: rowIndex,
        column: 'incident_date',
        field: 'Incident Date',
        value: row.incident_date,
        error: 'Incident date is more than 2 years old. This may affect recovery chances.',
        severity: 'warning'
      });
    }
  }

  // Rule: Price should be reasonable (warning if >100000)
  if (row.purchase_price && Number(row.purchase_price) > 100000) {
    errors.push({
      row: rowIndex,
      column: 'purchase_price',
      field: 'Purchase Price',
      value: row.purchase_price,
      error: 'Unusually high price. Please verify this is correct.',
      severity: 'warning'
    });
  }

  // Rule: Price should be reasonable (warning if <100)
  if (row.price && Number(row.price) > 0 && Number(row.price) < 100) {
    errors.push({
      row: rowIndex,
      column: 'price',
      field: 'Price',
      value: row.price,
      error: 'Unusually low price. Please verify this is correct.',
      severity: 'warning'
    });
  }

  return errors;
}

/**
 * Parse CSV data from file
 */
export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n');
  const dataLines = lines.slice(5); // Skip header rows (5 rows)
  
  if (dataLines.length === 0) {
    return [];
  }

  // Get headers from row 3 (field names)
  const headerLine = lines[2];
  const headers = parseCSVLine(headerLine);
  
  // Parse data rows
  const data: any[] = [];
  dataLines.forEach((line, index) => {
    if (line.trim()) {
      const values = parseCSVLine(line);
      const row: any = {};
      headers.forEach((header, i) => {
        const fieldName = header.toLowerCase().replace(/\s+/g, '_');
        row[fieldName] = values[i] || '';
      });
      data.push(row);
    }
  });

  return data;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

/**
 * Main validation function
 */
export function validateBulkData(
  data: any[],
  templateType: TemplateType
): ValidationResult {
  const fields = getTemplateFields(templateType);
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const validatedData: any[] = [];

  // Define unique fields per template type
  const uniqueFields: Record<TemplateType, string[]> = {
    devices: ['serial_number', 'imei'],
    marketplace_listings: [],
    lost_reports: [],
    found_reports: [],
    repair_logs: [],
    stakeholder_registrations: [],
    insurance_policies: ['policy_number']
  };

  // Validate each row
  data.forEach((row, index) => {
    const rowIndex = index + 6; // +6 for header rows
    const rowErrors: ValidationError[] = [];

    // Validate each field
    fields.forEach(field => {
      const value = row[field.name];
      const error = validateField(field, value, rowIndex, data);
      if (error) {
        if (error.severity === 'error') {
          rowErrors.push(error);
        } else {
          warnings.push(error);
        }
      }
    });

    // Business rule validation
    const businessRuleErrors = validateBusinessRules(row, rowIndex);
    businessRuleErrors.forEach(error => {
      if (error.severity === 'error') {
        rowErrors.push(error);
      } else {
        warnings.push(error);
      }
    });

    // If no errors, add to valid data
    if (rowErrors.length === 0) {
      validatedData.push(row);
    } else {
      errors.push(...rowErrors);
    }
  });

  // Check for duplicates
  const uniqueFieldsForType = uniqueFields[templateType] || [];
  if (uniqueFieldsForType.length > 0) {
    const duplicateErrors = checkDuplicates(data, uniqueFieldsForType);
    errors.push(...duplicateErrors);
  }

  return {
    isValid: errors.length === 0,
    totalRows: data.length,
    validRows: validatedData.length,
    invalidRows: data.length - validatedData.length,
    errors,
    warnings,
    validatedData
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  const grouped = errors.reduce((acc, error) => {
    const key = `Row ${error.row}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  let output = '';
  Object.entries(grouped).forEach(([row, rowErrors]) => {
    output += `\n${row}:\n`;
    rowErrors.forEach(error => {
      output += `  • ${error.field}: ${error.error}\n`;
    });
  });

  return output;
}

/**
 * Export validation results to CSV
 */
export function exportValidationReport(result: ValidationResult): string {
  const rows: string[][] = [
    ['Validation Report'],
    ['Total Rows', result.totalRows.toString()],
    ['Valid Rows', result.validRows.toString()],
    ['Invalid Rows', result.invalidRows.toString()],
    ['Errors', result.errors.length.toString()],
    ['Warnings', result.warnings.length.toString()],
    [],
    ['Row', 'Column', 'Field', 'Value', 'Error', 'Severity']
  ];

  [...result.errors, ...result.warnings].forEach(error => {
    rows.push([
      error.row.toString(),
      error.column,
      error.field,
      String(error.value),
      error.error,
      error.severity
    ]);
  });

  return rows.map(row => row.join(',')).join('\n');
}

