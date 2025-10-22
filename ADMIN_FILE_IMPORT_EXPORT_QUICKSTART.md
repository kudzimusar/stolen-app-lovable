# Admin File Import/Export - Developer Quick Start

## 🚀 Installation & Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

This will install the new package: `xlsx@^0.18.5`

### 2. Run Database Migration
```bash
# Using Supabase CLI (recommended)
npx supabase db push

# Or directly with psql
psql -U postgres -d stolen_db -f supabase/migrations/20251023000000_admin_file_operations.sql
```

### 3. Deploy Edge Function
```bash
npx supabase functions deploy bulk-data-import
```

### 4. Test the System
```bash
npm run dev
```

Navigate to: `http://localhost:8080/admin`

## 🎯 Usage in Your Admin Panels

### Basic Integration (Copy-Paste Ready)

Add to any admin panel in 3 steps:

#### Step 1: Import the Component
```typescript
import DataManagementToolbar from "@/components/admin/DataManagementToolbar";
```

#### Step 2: Add to JSX
```tsx
<DataManagementToolbar
  dataType="devices"  // or "marketplace_listings", "lost_reports", etc.
  data={yourFilteredData}
  onImportComplete={async (importedData) => {
    console.log(`Imported ${importedData.length} records`);
    await refreshYourData();
  }}
  showTemplateDownload={true}
  showImport={true}
  showExport={true}
/>
```

#### Step 3: Done! ✅

## 📝 Template Types Available

Use these values for `dataType` prop:

- `"devices"` - Device registrations
- `"marketplace_listings"` - Product listings
- `"lost_reports"` - Lost device reports
- `"found_reports"` - Found device reports
- `"stakeholder_registrations"` - Partner registrations
- `"users"` - User accounts
- `"transactions"` - Financial transactions
- `"security_logs"` - Security events

## 🎨 Customization Options

```tsx
<DataManagementToolbar
  dataType="devices"
  data={data}
  onImportComplete={handleImport}
  
  // Optional customization
  userRole="retailer"              // For permission checking
  showTemplateDownload={true}      // Show/hide template button
  showImport={true}                // Show/hide import button
  showExport={true}                // Show/hide export button
  label="Custom Label Text"        // Custom toolbar title
/>
```

## 🧪 Testing Import Functionality

### Test with Sample Data

1. Download a template (click "Download Template" → Excel)
2. Fill in sample data (use row 5 as reference)
3. Save the file
4. Click "Import Data" and select the file
5. Check the validation results

### Sample Device Data
```csv
device_name,brand,model,serial_number,device_type,color,purchase_date,purchase_price
iPhone 13 Pro,Apple,A2483,TEST001,phone,Graphite,2024-01-15,1299.99
Samsung Galaxy S23,Samsung,SM-S911B,TEST002,phone,Black,2024-02-20,899.99
MacBook Pro 16,Apple,MK1E3,TEST003,laptop,Silver,2024-03-10,2999.99
```

## 📊 View Statistics

Query file operations:
```sql
-- Get statistics for current user
SELECT * FROM get_file_operation_stats(auth.uid(), 30);

-- View all operations
SELECT * FROM admin_file_operations_view
ORDER BY created_at DESC
LIMIT 10;
```

## 🛠️ Advanced: Direct API Usage

```typescript
// Import the services directly
import { downloadTemplate } from '@/lib/services/templateGenerator';
import { exportData } from '@/lib/services/dataExporter';
import { validateBulkData } from '@/lib/validators/bulkDataValidator';

// Download template programmatically
downloadTemplate('devices', 'xlsx');

// Export data programmatically
await exportData(myData, 'devices', {
  format: 'xlsx',
  formatDates: true,
  includeHeaders: true
});

// Validate data before import
const result = validateBulkData(parsedData, 'devices');
if (result.isValid) {
  // Process the data
}
```

## 🔍 Debugging

### Enable Debug Logging
```typescript
// In your component
onImportComplete={async (importedData) => {
  console.log('Import complete:', {
    count: importedData.length,
    data: importedData,
    timestamp: new Date().toISOString()
  });
}}
```

### Check Edge Function Logs
```bash
npx supabase functions logs bulk-data-import
```

### View Database Logs
```sql
SELECT * FROM admin_file_operations
WHERE admin_user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;
```

## 🚨 Common Issues & Fixes

### Issue: "xlsx module not found"
**Fix**: Run `npm install`

### Issue: "Permission denied"
**Fix**: Check user role in database
```sql
SELECT role FROM users WHERE id = auth.uid();
```

### Issue: "Validation errors"
**Fix**: Download error report and check row-by-row

### Issue: "File too large"
**Fix**: Split into smaller batches (< 100MB each)

## 📖 Documentation Links

- **User Guide**: `ADMIN_FILE_IMPORT_EXPORT_GUIDE.md`
- **Implementation Details**: `ADMIN_FILE_IMPORT_EXPORT_IMPLEMENTATION.md`
- **Template Service**: `src/lib/services/templateGenerator.ts`
- **Validator**: `src/lib/validators/bulkDataValidator.ts`
- **Exporter**: `src/lib/services/dataExporter.ts`

## 💡 Pro Tips

1. **Start Small**: Test with 5-10 records first
2. **Use Excel**: Better validation and formatting
3. **Check Examples**: Row 5 in templates shows correct format
4. **Validate First**: Review errors before fixing
5. **Keep Backups**: Save original files
6. **Monitor Stats**: Check `admin_file_operations` table regularly

## 🎉 You're Ready!

The system is now fully operational. Navigate to any admin panel and look for the "Download Template" / "Import Data" / "Export" buttons.

**Need Help?**
- Check inline code comments
- Review JSDoc documentation  
- See comprehensive guides in docs folder

---

**Quick Start Version**: 1.0.0
**Last Updated**: October 22, 2025

