/**
 * Template Generator Service
 * Generates professional CSV/Excel templates for bulk data upload
 * Follows Amazon-style template structure with metadata and validation rules
 */

import * as XLSX from 'xlsx';

export interface TemplateField {
  name: string;
  displayName: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'url' | 'dropdown';
  required: boolean;
  maxLength?: number;
  pattern?: string;
  options?: string[];
  example: string;
  description?: string;
}

export interface TemplateSection {
  name: string;
  fields: TemplateField[];
}

export type TemplateType = 
  | 'devices' 
  | 'marketplace_listings' 
  | 'lost_reports' 
  | 'found_reports'
  | 'repair_logs'
  | 'stakeholder_registrations'
  | 'stakeholders'
  | 'insurance_policies';

/**
 * Device Registration Template Fields
 * Maps to DeviceRegister.tsx form fields
 */
export const DEVICE_TEMPLATE_SECTIONS: TemplateSection[] = [
  {
    name: 'Basic Info',
    fields: [
      {
        name: 'device_name',
        displayName: 'Device Name',
        type: 'text',
        required: true,
        maxLength: 100,
        example: 'iPhone 13 Pro',
        description: 'Common name for the device'
      },
      {
        name: 'device_type',
        displayName: 'Device Type',
        type: 'dropdown',
        required: true,
        options: ['phone', 'laptop', 'tablet', 'smartwatch', 'headphones', 'camera', 'gaming_console', 'other'],
        example: 'phone',
        description: 'Category of device'
      },
      {
        name: 'brand',
        displayName: 'Brand',
        type: 'text',
        required: true,
        maxLength: 50,
        example: 'Apple',
        description: 'Manufacturer brand name'
      },
      {
        name: 'model',
        displayName: 'Model',
        type: 'text',
        required: true,
        maxLength: 100,
        example: 'A2483',
        description: 'Model number or name'
      }
    ]
  },
  {
    name: 'Identifiers',
    fields: [
      {
        name: 'serial_number',
        displayName: 'Serial Number',
        type: 'text',
        required: true,
        maxLength: 50,
        pattern: '^[A-Z0-9]+$',
        example: 'ABC123XYZ456',
        description: 'Unique serial number (REQUIRED, MUST BE UNIQUE)'
      },
      {
        name: 'imei',
        displayName: 'IMEI',
        type: 'text',
        required: false,
        pattern: '^[0-9]{15}$',
        example: '123456789012345',
        description: '15-digit IMEI for mobile devices'
      },
      {
        name: 'mac_address',
        displayName: 'MAC Address',
        type: 'text',
        required: false,
        pattern: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
        example: 'AA:BB:CC:DD:EE:FF',
        description: 'MAC address for network devices'
      }
    ]
  },
  {
    name: 'Purchase Details',
    fields: [
      {
        name: 'purchase_date',
        displayName: 'Purchase Date',
        type: 'date',
        required: false,
        example: '2024-01-15',
        description: 'Format: YYYY-MM-DD (must be <= today)'
      },
      {
        name: 'purchase_price',
        displayName: 'Purchase Price',
        type: 'number',
        required: false,
        example: '1299.99',
        description: 'Purchase price in currency (numbers only, no symbols)'
      },
      {
        name: 'purchase_location',
        displayName: 'Purchase Location',
        type: 'text',
        required: false,
        maxLength: 200,
        example: 'Apple Store, Sandton City',
        description: 'Where device was purchased'
      },
      {
        name: 'receipt_url',
        displayName: 'Receipt URL',
        type: 'url',
        required: false,
        example: 'https://example.com/receipt.pdf',
        description: 'URL to receipt/invoice document'
      }
    ]
  },
  {
    name: 'Physical Specs',
    fields: [
      {
        name: 'color',
        displayName: 'Color',
        type: 'text',
        required: false,
        maxLength: 50,
        example: 'Graphite',
        description: 'Device color'
      },
      {
        name: 'storage_capacity',
        displayName: 'Storage Capacity',
        type: 'text',
        required: false,
        example: '256GB',
        description: 'Storage size (e.g., 256GB, 1TB)'
      },
      {
        name: 'ram',
        displayName: 'RAM',
        type: 'text',
        required: false,
        example: '8GB',
        description: 'RAM size (e.g., 8GB, 16GB)'
      },
      {
        name: 'condition',
        displayName: 'Condition',
        type: 'dropdown',
        required: false,
        options: ['new', 'like-new', 'excellent', 'good', 'fair', 'poor'],
        example: 'excellent',
        description: 'Current device condition'
      }
    ]
  },
  {
    name: 'Warranty & Insurance',
    fields: [
      {
        name: 'warranty_status',
        displayName: 'Warranty Status',
        type: 'dropdown',
        required: false,
        options: ['active', 'expired', 'none'],
        example: 'active',
        description: 'Current warranty status'
      },
      {
        name: 'warranty_expiry',
        displayName: 'Warranty Expiry Date',
        type: 'date',
        required: false,
        example: '2025-12-31',
        description: 'Format: YYYY-MM-DD'
      },
      {
        name: 'warranty_provider',
        displayName: 'Warranty Provider',
        type: 'text',
        required: false,
        maxLength: 100,
        example: 'Apple Inc.',
        description: 'Company providing warranty'
      },
      {
        name: 'insurance_policy_id',
        displayName: 'Insurance Policy ID',
        type: 'text',
        required: false,
        maxLength: 100,
        example: 'INS-2024-12345',
        description: 'Insurance policy number'
      },
      {
        name: 'insurer_name',
        displayName: 'Insurance Company',
        type: 'text',
        required: false,
        maxLength: 100,
        example: 'Santam Insurance',
        description: 'Name of insurance provider'
      }
    ]
  },
  {
    name: 'Media',
    fields: [
      {
        name: 'device_photos',
        displayName: 'Device Photos URLs',
        type: 'text',
        required: false,
        example: 'https://example.com/photo1.jpg, https://example.com/photo2.jpg',
        description: 'Comma-separated list of photo URLs'
      }
    ]
  },
  {
    name: 'Additional',
    fields: [
      {
        name: 'notes',
        displayName: 'Notes',
        type: 'text',
        required: false,
        maxLength: 500,
        example: 'Device has minor scratch on back cover',
        description: 'Additional notes or comments'
      },
      {
        name: 'tags',
        displayName: 'Tags',
        type: 'text',
        required: false,
        example: 'premium, flagship, 5g',
        description: 'Comma-separated tags for categorization'
      }
    ]
  }
];

/**
 * Marketplace Listing Template Fields
 */
export const MARKETPLACE_TEMPLATE_SECTIONS: TemplateSection[] = [
  {
    name: 'Basic Info',
    fields: [
      {
        name: 'title',
        displayName: 'Listing Title',
        type: 'text',
        required: true,
        maxLength: 200,
        example: 'iPhone 13 Pro 256GB Graphite - Excellent Condition',
        description: 'Product listing title'
      },
      {
        name: 'description',
        displayName: 'Description',
        type: 'text',
        required: true,
        maxLength: 2000,
        example: 'Barely used iPhone 13 Pro in excellent condition. No scratches, all accessories included.',
        description: 'Detailed product description'
      },
      {
        name: 'price',
        displayName: 'Price',
        type: 'number',
        required: true,
        example: '15999.00',
        description: 'Selling price (numbers only)'
      },
      {
        name: 'category',
        displayName: 'Category',
        type: 'dropdown',
        required: true,
        options: ['phones', 'laptops', 'tablets', 'smartwatches', 'headphones', 'cameras', 'gaming', 'accessories'],
        example: 'phones',
        description: 'Product category'
      }
    ]
  },
  {
    name: 'Product Details',
    fields: [
      {
        name: 'brand',
        displayName: 'Brand',
        type: 'text',
        required: true,
        maxLength: 50,
        example: 'Apple',
        description: 'Brand name'
      },
      {
        name: 'model',
        displayName: 'Model',
        type: 'text',
        required: true,
        maxLength: 100,
        example: 'iPhone 13 Pro',
        description: 'Model name'
      },
      {
        name: 'condition',
        displayName: 'Condition',
        type: 'dropdown',
        required: true,
        options: ['new', 'like-new', 'excellent', 'good', 'fair'],
        example: 'excellent',
        description: 'Product condition'
      },
      {
        name: 'storage',
        displayName: 'Storage',
        type: 'text',
        required: false,
        example: '256GB',
        description: 'Storage capacity'
      },
      {
        name: 'color',
        displayName: 'Color',
        type: 'text',
        required: false,
        example: 'Graphite',
        description: 'Product color'
      }
    ]
  },
  {
    name: 'Pricing & Delivery',
    fields: [
      {
        name: 'warranty_months',
        displayName: 'Warranty (Months)',
        type: 'number',
        required: false,
        example: '6',
        description: 'Warranty period in months'
      },
      {
        name: 'shipping_options',
        displayName: 'Shipping Options',
        type: 'dropdown',
        required: false,
        options: ['meetup', 'courier', 'collection', 'all'],
        example: 'all',
        description: 'Available delivery methods'
      },
      {
        name: 'photos_url',
        displayName: 'Product Photos',
        type: 'text',
        required: false,
        example: 'https://example.com/img1.jpg, https://example.com/img2.jpg',
        description: 'Comma-separated photo URLs'
      }
    ]
  }
];

/**
 * Lost Report Template Fields
 */
export const LOST_REPORT_TEMPLATE_SECTIONS: TemplateSection[] = [
  {
    name: 'Report Details',
    fields: [
      {
        name: 'report_type',
        displayName: 'Report Type',
        type: 'dropdown',
        required: true,
        options: ['lost', 'stolen'],
        example: 'lost',
        description: 'Type of report'
      },
      {
        name: 'device_category',
        displayName: 'Device Category',
        type: 'dropdown',
        required: true,
        options: ['phone', 'laptop', 'tablet', 'smartwatch', 'camera', 'other'],
        example: 'phone',
        description: 'Type of device'
      },
      {
        name: 'device_model',
        displayName: 'Device Model',
        type: 'text',
        required: true,
        maxLength: 100,
        example: 'iPhone 13 Pro',
        description: 'Device model name'
      },
      {
        name: 'serial_number',
        displayName: 'Serial Number',
        type: 'text',
        required: false,
        maxLength: 50,
        example: 'ABC123XYZ456',
        description: 'Device serial number if known'
      }
    ]
  },
  {
    name: 'Incident Information',
    fields: [
      {
        name: 'incident_date',
        displayName: 'Incident Date',
        type: 'date',
        required: true,
        example: '2024-10-15',
        description: 'Date device was lost/stolen (YYYY-MM-DD)'
      },
      {
        name: 'location_address',
        displayName: 'Location Address',
        type: 'text',
        required: true,
        maxLength: 200,
        example: 'Sandton City Mall, Johannesburg',
        description: 'Where incident occurred'
      },
      {
        name: 'location_lat',
        displayName: 'Latitude',
        type: 'number',
        required: false,
        example: '-26.1076',
        description: 'GPS latitude (optional)'
      },
      {
        name: 'location_lng',
        displayName: 'Longitude',
        type: 'number',
        required: false,
        example: '28.0567',
        description: 'GPS longitude (optional)'
      }
    ]
  },
  {
    name: 'Contact & Reward',
    fields: [
      {
        name: 'reward_amount',
        displayName: 'Reward Amount',
        type: 'number',
        required: false,
        example: '5000',
        description: 'Reward amount in ZAR'
      },
      {
        name: 'contact_phone',
        displayName: 'Contact Phone',
        type: 'phone',
        required: true,
        example: '+27821234567',
        description: 'Contact phone number'
      },
      {
        name: 'photos_url',
        displayName: 'Device Photos',
        type: 'text',
        required: false,
        example: 'https://example.com/device.jpg',
        description: 'Comma-separated photo URLs'
      }
    ]
  }
];

/**
 * Generate template metadata header (Row 1)
 */
function generateMetadataRow(templateType: TemplateType, version: string = '2025.1'): string[] {
  const timestamp = new Date().toISOString();
  const metadata = [
    `TemplateType=${templateType.toUpperCase()}`,
    `Version=${version}`,
    `Category=bulk_upload`,
    `Generated=${timestamp}`,
    'Instructions: Use ENGLISH to fill this template. The top 5 rows are for STOLEN system use only. Do not modify or delete header rows.'
  ];
  
  return [metadata.join(', ')];
}

/**
 * Generate section headers (Row 2)
 */
function generateSectionHeaders(sections: TemplateSection[]): string[] {
  const headers: string[] = [];
  
  sections.forEach(section => {
    // Add section name as first column of that section
    headers.push(section.name);
    // Add empty strings for remaining fields in section
    for (let i = 1; i < section.fields.length; i++) {
      headers.push('');
    }
  });
  
  return headers;
}

/**
 * Generate field names (Row 3)
 */
function generateFieldNames(sections: TemplateSection[]): string[] {
  const fieldNames: string[] = [];
  
  sections.forEach(section => {
    section.fields.forEach(field => {
      fieldNames.push(field.displayName);
    });
  });
  
  return fieldNames;
}

/**
 * Generate field types and validation rules (Row 4)
 */
function generateValidationRow(sections: TemplateSection[]): string[] {
  const validations: string[] = [];
  
  sections.forEach(section => {
    section.fields.forEach(field => {
      const rules: string[] = [field.type];
      
      if (field.required) rules.push('required');
      if (field.maxLength) rules.push(`max:${field.maxLength}`);
      if (field.pattern) rules.push(`pattern:${field.pattern}`);
      if (field.options) rules.push(`options:${field.options.join('|')}`);
      
      validations.push(rules.join(','));
    });
  });
  
  return validations;
}

/**
 * Generate example values (Row 5)
 */
function generateExampleRow(sections: TemplateSection[]): string[] {
  const examples: string[] = [];
  
  sections.forEach(section => {
    section.fields.forEach(field => {
      examples.push(field.example);
    });
  });
  
  return examples;
}

/**
 * Generate CSV template
 */
export function generateCSVTemplate(templateType: TemplateType): string {
  let sections: TemplateSection[] = [];
  
  switch (templateType) {
    case 'devices':
      sections = DEVICE_TEMPLATE_SECTIONS;
      break;
    case 'marketplace_listings':
      sections = MARKETPLACE_TEMPLATE_SECTIONS;
      break;
    case 'lost_reports':
    case 'found_reports':
      sections = LOST_REPORT_TEMPLATE_SECTIONS;
      break;
    case 'stakeholder_registrations':
    case 'stakeholders':
      sections = DEVICE_TEMPLATE_SECTIONS; // Use device template as fallback
      break;
    default:
      sections = DEVICE_TEMPLATE_SECTIONS;
  }
  
  const rows: string[][] = [
    generateMetadataRow(templateType),
    generateSectionHeaders(sections),
    generateFieldNames(sections),
    generateValidationRow(sections),
    generateExampleRow(sections),
    // Add 3 empty rows for user data entry
    new Array(sections.reduce((sum, s) => sum + s.fields.length, 0)).fill(''),
    new Array(sections.reduce((sum, s) => sum + s.fields.length, 0)).fill(''),
    new Array(sections.reduce((sum, s) => sum + s.fields.length, 0)).fill('')
  ];
  
  // Convert to CSV format
  return rows.map(row => 
    row.map(cell => {
      // Escape cells containing commas or quotes
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
}

/**
 * Generate Excel template with formatting
 */
export function generateExcelTemplate(templateType: TemplateType): ArrayBuffer {
  let sections: TemplateSection[] = [];
  
  switch (templateType) {
    case 'devices':
      sections = DEVICE_TEMPLATE_SECTIONS;
      break;
    case 'marketplace_listings':
      sections = MARKETPLACE_TEMPLATE_SECTIONS;
      break;
    case 'lost_reports':
    case 'found_reports':
      sections = LOST_REPORT_TEMPLATE_SECTIONS;
      break;
    case 'stakeholder_registrations':
    case 'stakeholders':
      sections = DEVICE_TEMPLATE_SECTIONS; // Use device template as fallback
      break;
    default:
      sections = DEVICE_TEMPLATE_SECTIONS;
  }
  
  const rows: any[][] = [
    generateMetadataRow(templateType),
    generateSectionHeaders(sections),
    generateFieldNames(sections),
    generateValidationRow(sections),
    generateExampleRow(sections),
    // Add 50 empty rows for user data entry
    ...Array(50).fill(null).map(() => 
      new Array(sections.reduce((sum, s) => sum + s.fields.length, 0)).fill('')
    )
  ];
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  
  // Set column widths
  const colWidths = sections.flatMap(section => 
    section.fields.map(() => ({ wch: 20 }))
  );
  ws['!cols'] = colWidths;
  
  // Freeze header rows
  ws['!freeze'] = { xSplit: 0, ySplit: 5 };
  
  XLSX.utils.book_append_sheet(wb, ws, 'Upload Template');
  
  // Generate buffer
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

/**
 * Download template file
 */
export function downloadTemplate(
  templateType: TemplateType,
  format: 'csv' | 'xlsx'
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `stolen_${templateType}_template_${timestamp}.${format}`;
  
  if (format === 'csv') {
    const csv = generateCSVTemplate(templateType);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    const buffer = generateExcelTemplate(templateType);
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

/**
 * Get template field configuration
 */
export function getTemplateFields(templateType: TemplateType): TemplateField[] {
  let sections: TemplateSection[] = [];
  
  switch (templateType) {
    case 'devices':
      sections = DEVICE_TEMPLATE_SECTIONS;
      break;
    case 'marketplace_listings':
      sections = MARKETPLACE_TEMPLATE_SECTIONS;
      break;
    case 'lost_reports':
    case 'found_reports':
      sections = LOST_REPORT_TEMPLATE_SECTIONS;
      break;
    case 'stakeholder_registrations':
    case 'stakeholders':
      sections = DEVICE_TEMPLATE_SECTIONS; // Use device template as fallback
      break;
    default:
      sections = DEVICE_TEMPLATE_SECTIONS;
  }
  
  return sections.flatMap(section => section.fields);
}

