# Admin File Import/Export System - User Guide

## Overview

The Admin File Import/Export System allows administrators to efficiently manage bulk data through standardized templates. This system supports:

- ✅ **Template Downloads**: Pre-formatted CSV/Excel templates
- ✅ **Bulk Data Import**: Upload hundreds of records at once
- ✅ **Data Export**: Export data in CSV, Excel, or JSON formats
- ✅ **Real-time Validation**: Instant feedback on data quality
- ✅ **Error Reporting**: Detailed validation errors with row/column references
- ✅ **Role-Based Access**: Different limits based on user roles
- ✅ **Google Drive Integration**: Automatic cloud backup for large files
- ✅ **Statistical Tracking**: Complete audit trail of all operations

## Quick Start

### 1. Download a Template

1. Navigate to any admin panel (Lost & Found, Marketplace, Stakeholders, etc.)
2. Click the **"Download Template"** button
3. Choose your format:
   - **Excel (.xlsx)** - Recommended for most users, includes formatting
   - **CSV (.csv)** - For advanced users or system integration

### 2. Fill the Template

The downloaded template contains:

**Row 1**: Metadata and instructions (DO NOT MODIFY)
**Row 2**: Section headers grouping related fields
**Row 3**: Field names/column headers
**Row 4**: Validation rules and data types
**Row 5**: Example values showing correct format
**Row 6+**: Your data goes here

#### Template Structure Example:

```
┌─────────────────────────────────────────────────────────────────────┐
│ STOLEN Device Registration Template v2025.1                        │
│ Instructions: Fill rows below. Do not edit header rows.            │
├─────────────────┬─────────────────┬─────────────────┬──────────────┤
│  BASIC INFO     │  IDENTIFIERS    │  PURCHASE       │  PHYSICAL    │
├─────────────────┼─────────────────┼─────────────────┼──────────────┤
│ Device Name     │ Serial Number   │ Purchase Date   │ Color        │
│ text(req,max:100)│ text(unique,req)│ date(<=today)   │ text         │
│ iPhone 13 Pro   │ ABC123XYZ       │ 2024-01-15      │ Graphite     │
├─────────────────┼─────────────────┼─────────────────┼──────────────┤
│ [YOUR DATA]     │ [YOUR DATA]     │ [YOUR DATA]     │ [YOUR DATA]  │
└─────────────────┴─────────────────┴─────────────────┴──────────────┘
```

### 3. Upload Your Data

1. Fill the template with your data (starting from row 6)
2. Save the file
3. Click **"Import Data"** button
4. Select your completed file
5. Wait for validation and processing
6. Review the results summary

### 4. Export Data

1. Navigate to the panel with data you want to export
2. Apply any filters (date range, status, search terms)
3. Click **"Export"** button
4. Choose your format:
   - **Excel (.xlsx)** - Multiple sheets, formatting, summary
   - **CSV (.csv)** - Simple, universal compatibility
   - **JSON (.json)** - Technical backups, API integration
5. File downloads automatically

## Available Templates

### 1. Devices Template
**Use Case**: Bulk device registration for retailers, repair shops, or individuals

**Required Fields**:
- device_name
- device_type
- brand
- model
- serial_number (must be unique)

**Optional Fields**:
- imei, mac_address
- color, storage_capacity, ram, condition
- purchase_date, purchase_price, purchase_location
- warranty_status, warranty_expiry, warranty_provider
- insurance_policy_id, insurer_name
- device_photos (comma-separated URLs)
- notes, tags

**Example**:
```csv
device_name,brand,model,serial_number,imei,device_type,color,storage_capacity,purchase_date,purchase_price
iPhone 13 Pro,Apple,A2483,ABC123XYZ,123456789012345,phone,Graphite,256GB,2024-01-15,1299.99
Samsung Galaxy S23,Samsung,SM-S911B,DEF456GHI,987654321098765,phone,Phantom Black,128GB,2024-02-20,899.99
```

### 2. Marketplace Listings Template
**Use Case**: Bulk product listing creation for sellers

**Required Fields**:
- title
- description
- price
- category
- brand
- model
- condition

**Optional Fields**:
- storage, color
- warranty_months
- shipping_options
- photos_url (comma-separated URLs)

**Example**:
```csv
title,description,price,category,brand,model,condition,storage,color,warranty_months
iPhone 13 Pro - Excellent,Barely used iPhone in perfect condition,15999,phones,Apple,iPhone 13 Pro,excellent,256GB,Graphite,6
Samsung Galaxy Tab S8,Like new tablet with S Pen included,8999,tablets,Samsung,Galaxy Tab S8,like-new,128GB,Silver,12
```

### 3. Lost Reports Template
**Use Case**: Bulk lost/stolen device reporting

**Required Fields**:
- report_type (lost or stolen)
- device_category
- device_model
- incident_date
- location_address
- contact_phone

**Optional Fields**:
- serial_number
- location_lat, location_lng
- reward_amount
- photos_url

**Example**:
```csv
report_type,device_category,device_model,incident_date,location_address,reward_amount,contact_phone
lost,phone,iPhone 13 Pro,2024-10-15,Sandton City Mall Johannesburg,5000,+27821234567
stolen,laptop,MacBook Pro 16,2024-10-18,Hyde Park Corner Johannesburg,10000,+27831234567
```

### 4. Stakeholder Registrations Template
**Use Case**: Bulk stakeholder onboarding

**Required Fields**:
- email
- display_name
- role (retailer, repair_shop, law_enforcement, insurance, ngo)
- business_name

**Optional Fields**:
- phone
- address
- license_number
- contact_person

## Validation Rules

### Data Types

- **text**: Plain text, respects maxLength
- **number**: Numeric values only, must be positive
- **date**: Format YYYY-MM-DD, validates ranges
- **email**: Valid email format
- **phone**: International format (e.g., +27821234567)
- **url**: Valid URL format
- **dropdown**: Must match one of the predefined options

### Common Validation Errors

1. **Required field is empty**
   - Solution: Fill all required fields marked with (required)

2. **Invalid date format**
   - Solution: Use YYYY-MM-DD format (e.g., 2024-10-22)

3. **Duplicate serial number**
   - Solution: Ensure each serial_number is unique

4. **Invalid IMEI**
   - Solution: IMEI must be exactly 15 digits

5. **Date in the future**
   - Solution: Purchase/incident dates cannot be in the future

6. **Invalid dropdown value**
   - Solution: Use only values listed in validation row

## Role-Based Limits

Different user roles have different bulk upload limits:

| Role | Max Records Per Upload |
|------|----------------------|
| Individual | 0 (no bulk upload) |
| Premium Individual | 10 devices |
| Retailer | 1,000 devices |
| Repair Shop | 500 entries |
| Law Enforcement | 100 reports |
| Insurance | 1,000 policies |
| NGO | 200 donations |
| Admin | Unlimited |
| Super Admin | Unlimited |

**Upgrade Prompt**: Individual users will see an upgrade prompt when trying to use bulk upload features.

## Advanced Features

### Partial Import

If some rows have errors, you can choose to:
- **Skip invalid rows**: Import only valid data
- **Fix and retry**: Download error report, fix issues, re-upload

### Error Reports

Download a detailed error report showing:
- Row number
- Field name
- Invalid value
- Error description
- Severity (error or warning)

### Export with Filters

Your current search/filter settings are preserved in exports:
- Date range filters
- Status filters
- Search terms
- Custom column selection

### Large File Handling

**Client-side** (files < 5MB):
- Instant processing in browser
- No server load

**Server-side** (files > 5MB):
- Processed on Supabase Edge Functions
- Batch processing (100 rows at a time)
- Real-time progress updates

**Google Drive** (files > 50MB):
- Automatic cloud backup
- Shared with organization
- Permanent audit trail

## Statistical Tracking

Every import/export operation is logged with:
- Operation type (upload, export, template_download)
- File type and format
- Rows processed/successful/failed
- Processing time
- Error logs
- User and timestamp

**View Statistics**:
- Navigate to Admin Settings
- Click "File Operations Analytics"
- View charts and reports

## Troubleshooting

### Import Not Working

1. **Check file format**: Only CSV and Excel (.xlsx) supported
2. **Verify headers**: Do not modify the first 5 rows
3. **Check file size**: Maximum 100MB
4. **Validate data**: Review error messages carefully

### Template Not Downloading

1. **Check browser**: Allow pop-ups for this site
2. **Clear cache**: Try in incognito/private mode
3. **Try different format**: Switch between CSV and Excel

### Validation Errors

1. **Read error message**: Exact row and field specified
2. **Check example**: Compare to row 5 in template
3. **Use correct format**: Follow validation rules in row 4
4. **Download error report**: Get full list of issues

### Slow Processing

1. **Reduce batch size**: Import in smaller chunks
2. **Remove duplicates**: Check for duplicate serial numbers
3. **Check internet**: Ensure stable connection
4. **Use server-side**: System auto-switches for large files

## Best Practices

1. **Start Small**: Test with 5-10 records first
2. **Use Excel**: Better formatting and validation support
3. **Keep Backups**: Save original files before uploading
4. **Validate First**: Check for errors before mass import
5. **Document Changes**: Use notes field for important info
6. **Regular Exports**: Backup data weekly
7. **Clean Data**: Remove duplicates and empty rows
8. **Test Serials**: Verify serial numbers are correct

## Security & Privacy

- ✅ All uploads encrypted in transit (HTTPS)
- ✅ Row-level security (RLS) on all data
- ✅ Role-based access control
- ✅ Complete audit trail
- ✅ Google Drive files private to organization
- ✅ Automatic malware scanning
- ✅ Rate limiting (10 uploads per hour)
- ✅ File size limits prevent abuse

## Support

**Need Help?**
- Email: support@stolen.app
- Live Chat: Available in dashboard
- Documentation: https://docs.stolen.app
- Video Tutorials: https://stolen.app/tutorials

## API Integration

Developers can use the bulk import API:

```bash
POST /api/v1/bulk-import
Authorization: Bearer <token>
Content-Type: application/json

{
  "data_type": "devices",
  "data": [...],
  "options": {
    "skip_duplicates": true,
    "batch_size": 100
  }
}
```

See full API documentation at https://docs.stolen.app/api

---

**Version**: 2025.1
**Last Updated**: October 22, 2025
**Status**: ✅ Production Ready

