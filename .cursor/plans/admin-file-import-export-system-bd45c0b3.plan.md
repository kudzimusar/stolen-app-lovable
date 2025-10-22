<!-- bd45c0b3-31f6-4b95-8b0a-799700b1b005 2f0bd65e-34d1-4526-972a-d6cf59e156bb -->
# Admin File Upload/Export System with Templates

## Overview

Build a comprehensive file import/export system that allows admin users to download standardized templates, fill them offline, and bulk upload data. System includes validation, Google Drive integration for large files, and statistical tracking across all admin panels.

## Current System Analysis

### Admin Roles Identified

Based on codebase analysis:

**1. Super Admin** (`super_admin`)

- Full access to all panels and data
- Portal: `/admin` - UnifiedAdminDashboard.tsx
- Can export/import: ALL data across all panels

**2. Stakeholder Admins** (Multiple types)

- **Retailer** (`retailer`) - Bulk device inventory, sales data
- **Repair Shop** (`repair_shop`) - Repair logs, parts inventory
- **Law Enforcement** (`law_enforcement`) - Case files, stolen reports
- **Insurance** (`insurance`) - Policy data, claims
- **NGO** (`ngo`) - Donation records, beneficiary data
- Portal: Stakeholder-specific dashboards
- Can export/import: Role-specific data only

**3. Regular Admin** (`admin`)

- Limited administrative access
- Portal: `/admin` with restricted panels
- Can export/import: Assigned sections only

### Database Tables by Admin Panel

**📊 Overview Panel:**

- Statistics aggregation (read-only exports)
- System health metrics

**👥 Users Panel:**

- `users` - All user accounts
- `user_risk_profiles` - Security profiles
- `user_reputation` - Community scores
- `mfa_setup` - Authentication data

**🔍 Lost & Found Panel:**

- `lost_found_reports` - Lost/found submissions
- `stolen_reports` - Theft reports
- `found_tips` - Community tips
- `community_tips` - Anonymous sightings
- `device_matches` - AI matching results
- `success_stories` - Recovery stories

**🛒 Marketplace Panel:**

- `marketplace_listings` - Product listings
- `marketplace_categories` - Category structure
- `listing_views` - View analytics
- `marketplace_watchlist` - User favorites
- `marketplace_inquiries` - Buyer questions
- `seller_reviews` - Ratings/reviews
- `marketplace_transactions` - Sales data

**🏪 Stakeholders Panel:**

- `users` (filtered by stakeholder roles)
- Stakeholder-specific business data
- Approval workflows

**💰 Financial Panel:**

- `wallets` - User wallet balances
- `transactions` - Payment history
- `escrow_transactions` - Held payments
- `payment_intents` - Payment processing
- Reward payment records

**🔒 Security Panel:**

- `fraud_analysis_logs` - Fraud detection
- `user_risk_profiles` - Risk assessments
- `mfa_verifications` - Auth logs
- `device_fingerprints` - Device tracking
- `transaction_security_logs` - Security events
- `audit_logs` - System audit trail

**⚙️ Settings Panel:**

- System configuration data
- Admin user management
- Role permissions

## Architectural Coherence Strategy

### Integration with Existing System

**Existing Patterns to Follow:**

1. **Edge Functions Pattern**: Follow `lost-found-reports`, `admin-stakeholders-list` structure
2. **Database Migrations**: Use existing migration pattern in `supabase/migrations/`
3. **Component Structure**: Match `src/pages/admin/panels/` organization
4. **Auth Integration**: Use existing `useAuth()` hook and `getAuthToken()`
5. **RLS Policies**: Follow existing Row Level Security patterns
6. **Type Safety**: Extend `src/integrations/supabase/types.ts`
7. **UI Components**: Use existing shadcn/ui components from `@/components/ui/`
8. **API Response Format**: Match existing `{ success: boolean, data: any, error: string }` pattern

**Backwards Compatibility:**

- No breaking changes to existing device registration flow
- New bulk upload complements (not replaces) single device registration
- Existing database schema remains unchanged
- All new tables use standard UUID primary keys and timestamps
- RLS policies protect all admin operations

**Enhancement Approach:**

- Add features to existing admin panels (not rebuild them)
- Extend UnifiedAdminDashboard with new toolbar component
- Integrate with existing Supabase storage buckets
- Use existing blockchain integration for device ownership
- Leverage current notification system for upload/export alerts

## Implementation Architecture

### Phase 1: Template System Foundation

#### 1.1 Template Generator Service

**File:** `src/lib/services/templateGenerator.ts`

Create template generator that:

- Generates CSV/Excel templates based on device registration form
- Includes header rows with field names and validation rules
- Adds example rows with sample data
- Supports multiple template types (devices, users, listings, reports)
- Includes data dictionaries and field descriptions

**Template Structure (Amazon-Style Professional Format):**

```
Row 1: TEMPLATE METADATA
- TemplateType=STOLEN_DEVICES, Version=2025.1, Category=bulk_upload
- Settings: contentLanguage=en, feedType=device_registration
- Instructions: "Use ENGLISH to fill this template. The top 4 rows are for STOLEN system use only. Do not modify or delete the top 4 rows."

Row 2: SECTION HEADERS (Grouped Columns)
- Basic Info | Identifiers | Purchase Details | Physical Specs | Warranty & Insurance | Media | Discovery & Marketing

Row 3: FIELD NAMES (Column Headers)
- device_name, brand, model, device_type, serial_number, imei, mac_address, purchase_date, purchase_price, color, storage_capacity, warranty_status...

Row 4: FIELD TYPES & VALIDATION
- text(required,max:100), text(required), text(required), dropdown(phone|laptop|tablet), text(unique,required), numeric(15digits), text, date(<=today), decimal(>0), text...

Row 5: EXAMPLE VALUES
- iPhone 13 Pro, Apple, A2483, phone, ABC123XYZ, 123456789012345, AA:BB:CC:DD:EE:FF, 2024-01-15, 1299.99, Graphite, 256GB, active...

Row 6+: USER DATA ENTRY ROWS (Empty for bulk fill)
```

**Template Visual Layout:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STOLEN Device Registration Template v2025.1 | Category: Bulk Upload        │
│ Instructions: Fill rows below with device details. Do not edit header rows.│
├─────────────────┬─────────────────┬─────────────────┬──────────────────────┤
│  BASIC INFO     │  IDENTIFIERS    │  PURCHASE       │  PHYSICAL SPECS      │
├─────────────────┼─────────────────┼─────────────────┼──────────────────────┤
│ device_name     │ serial_number   │ purchase_date   │ color                │
│ text(req,max:100)│ text(unique,req)│ date(<=today)   │ text                 │
│ iPhone 13 Pro   │ ABC123XYZ       │ 2024-01-15      │ Graphite             │
├─────────────────┼─────────────────┼─────────────────┼──────────────────────┤
│ [FILL HERE]     │ [FILL HERE]     │ [FILL HERE]     │ [FILL HERE]          │
└─────────────────┴─────────────────┴─────────────────┴──────────────────────┘
```

#### 1.2 Device Registration Field Mapping

**Reference:** `src/pages/user/DeviceRegister.tsx`

Map all device registration fields to template columns:

- Basic Info: device_name, device_type, brand, model
- Identifiers: serial_number, imei, mac_address
- Purchase: purchase_date, purchase_price, purchase_location, receipt_url
- Physical: color, storage_capacity, ram, condition
- Warranty: warranty_status, warranty_expiry, warranty_provider
- Insurance: insurance_policy_id, insurer_name
- Photos: device_photos (URLs or base64)
- Additional: notes, tags, custom_fields

### Phase 2: File Upload & Validation System

#### 2.1 File Parser Component

**File:** `src/components/admin/FileUploadParser.tsx`

Features:

- Drag-and-drop file upload UI
- Support CSV and Excel (XLSX) formats
- Client-side parsing with Papa Parse (CSV) and SheetJS (Excel)
- Real-time validation preview
- Error highlighting with row/column references
- Partial import option (skip invalid rows)
- Progress indicators for large files

#### 2.2 Validation Engine

**File:** `src/lib/validators/bulkDataValidator.ts`

Validation rules:

- Required field checks
- Data type validation (string, number, date, email, phone)
- Format validation (IMEI 15 digits, serial numbers, URLs)
- Unique constraint checks (serial_number, imei must be unique)
- Foreign key validation (user_id exists, valid categories)
- Business logic (purchase_date <= today, price >= 0)
- Cross-field validation (warranty_expiry > purchase_date)
- Duplicate detection within upload file

#### 2.3 Bulk Processing Service

**File:** `supabase/functions/bulk-data-import/index.ts`

Edge Function for server-side processing:

- Handle large files (>10MB)
- Batch database inserts (chunks of 100 rows)
- Transaction management (rollback on critical errors)
- Background job processing
- Real-time progress updates via Supabase Realtime
- Error logging and reporting
- Blockchain integration for device ownership records

### Phase 3: Export System

#### 3.1 Data Export Service

**File:** `src/lib/services/dataExporter.ts`

Export capabilities:

- Export to CSV/Excel with formatting
- Custom column selection
- Date range filtering
- Search/filter preservation
- Include related data (joins)
- Format dates, numbers, currencies correctly
- Handle NULL values gracefully

#### 3.2 Export Formats

- **CSV**: Simple, fast, universal compatibility
- **Excel (XLSX)**: Multiple sheets, formatting, formulas, charts
- **JSON**: Technical backups, API integration
- **PDF**: Reports with branding (future enhancement)

### Phase 4: Google Drive Integration

#### 4.1 Google Drive API Setup

**File:** `src/lib/integrations/googleDrive.ts`

Features:

- OAuth 2.0 authentication flow
- Direct upload for large files (>5MB)
- Automatic folder organization by admin role
- File versioning and history
- Shared drive support for organizations
- Automatic file naming with timestamps
- Public/private link generation

#### 4.2 Storage Strategy

- Small files (<5MB): Direct browser download
- Medium files (5-50MB): Supabase Storage bucket
- Large files (>50MB): Google Drive with reference link
- Archive files: Automatic Google Drive backup monthly

**Environment Setup:**

```typescript
// .env
VITE_GOOGLE_DRIVE_CLIENT_ID=your_client_id
VITE_GOOGLE_DRIVE_API_KEY=your_api_key
GOOGLE_DRIVE_FOLDER_ID=admin_uploads_folder
```

### Phase 5: Statistical Tracking

#### 5.1 File Operations Tracking

**Database:** New table `admin_file_operations`

```sql
CREATE TABLE admin_file_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES users(id),
  operation_type TEXT NOT NULL, -- 'upload', 'export', 'template_download'
  file_type TEXT NOT NULL, -- 'devices', 'users', 'listings', 'reports'
  file_format TEXT, -- 'csv', 'xlsx', 'json'
  file_size BIGINT,
  rows_processed INTEGER,
  rows_successful INTEGER,
  rows_failed INTEGER,
  processing_time_ms INTEGER,
  storage_location TEXT, -- 'local', 'supabase', 'google_drive'
  google_drive_file_id TEXT,
  error_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5.2 Analytics Dashboard

Display statistics:

- Total uploads/exports by admin role
- Success/failure rates
- Most common errors
- Average processing time
- Storage usage by location
- Top imported data types

### Phase 6: UI Implementation Per Admin Panel

#### 6.1 Common Upload/Export Component

**File:** `src/components/admin/DataManagementToolbar.tsx`

Reusable component with:

- "Download Template" button
- "Import Data" button with file picker
- "Export Data" button with format selector
- Progress modal during processing
- Success/error notifications
- Recent operations history

#### 6.2 Panel-Specific Integration

**Lost & Found Panel** (`LostFoundPanel.tsx`):

- Templates: lost_reports_template.xlsx, found_reports_template.xlsx
- Import: Bulk report submissions with photo URLs
- Export: All reports with filters (date, status, location)

**Marketplace Panel** (`MarketplacePanel.tsx`):

- Templates: product_listings_template.xlsx
- Import: Bulk listings with validation (price, condition, photos)
- Export: Listings with sales analytics

**Stakeholders Panel** (`StakeholderPanel.tsx`):

- Templates: stakeholder_registration_template.xlsx
- Import: Bulk stakeholder approvals
- Export: Partner directory with contact info

**Users Panel** (`UsersPanel.tsx`):

- Templates: user_accounts_template.xlsx
- Import: Bulk user creation (admin only)
- Export: User list with activity metrics

**Financial Panel** (`FinancialPanel.tsx`):

- Templates: transactions_template.xlsx, rewards_template.xlsx
- Import: Manual transaction adjustments (super admin only)
- Export: Financial reports (transactions, balances, rewards)

**Security Panel** (`SecurityPanel.tsx`):

- Export only: Audit logs, fraud reports, security events
- No imports (read-only for security)

### Phase 7: Premium Feature Implementation

#### 7.1 Access Control

```typescript
// Permission matrix
const canBulkUpload = (userRole: string, itemCount: number): boolean => {
  const limits = {
    individual: 0,           // No bulk upload
    premium_individual: 10,  // Up to 10 devices
    retailer: 1000,         // Up to 1000 devices
    repair_shop: 500,       // Up to 500 devices
    law_enforcement: 100,   // Up to 100 reports
    insurance: 1000,        // Up to 1000 policies
    ngo: 200,              // Up to 200 donations
    admin: Infinity,       // Unlimited
    super_admin: Infinity  // Unlimited
  };
  return itemCount <= (limits[userRole] || 0);
};
```

#### 7.2 Premium Upsell UI

For individual users hitting limits:

- Show upgrade prompt with benefits
- Display current usage vs. premium limits
- One-click upgrade to premium account

## Technical Implementation Details

### Key Technologies

- **File Parsing**: Papa Parse (CSV), SheetJS (Excel)
- **Google Drive**: Google Drive API v3
- **Validation**: Zod schemas
- **UI Components**: Radix UI Dialog, Progress, Toast
- **Backend**: Supabase Edge Functions (Deno)
- **State Management**: React Query for async operations

### Database Functions Needed

**1. Bulk Device Insert:**

```sql
CREATE OR REPLACE FUNCTION bulk_insert_devices(
  devices JSONB,
  owner_id UUID
) RETURNS TABLE(success INTEGER, failed INTEGER, errors JSONB);
```

**2. Bulk Marketplace Listing Insert:**

```sql
CREATE OR REPLACE FUNCTION bulk_insert_marketplace_listings(
  listings JSONB,
  seller_id UUID
) RETURNS TABLE(success INTEGER, failed INTEGER, errors JSONB);
```

**3. Export Data with Filters:**

```sql
CREATE OR REPLACE FUNCTION export_filtered_data(
  table_name TEXT,
  filters JSONB,
  columns TEXT[]
) RETURNS TABLE(data JSONB);
```

### Security Considerations

- Row-level security (RLS) policies for all tables
- Admin role verification on all endpoints
- File size limits (max 100MB per upload)
- Malware scanning for uploaded files
- Rate limiting (10 uploads per hour per admin)
- Audit logging for all import/export operations
- Encrypted storage for sensitive exports

## File Templates by Role

### Retailer Template (`device_inventory_template.xlsx`)

Columns: device_name, brand, model, serial_number, imei, color, storage, condition, purchase_price, supplier, stock_quantity, warranty_months, photos_url

### Repair Shop Template (`repair_logs_template.xlsx`)

Columns: device_id, customer_id, repair_type, issue_description, parts_used, labor_cost, parts_cost, repair_date, technician, warranty_days

### Lost & Found Template (`lost_report_template.xlsx`)

Columns: report_type, device_category, device_model, serial_number, incident_date, location_address, location_lat, location_lng, reward_amount, contact_phone, photos_url

### Marketplace Template (`product_listing_template.xlsx`)

Columns: title, description, price, category, brand, model, condition, storage, color, warranty_months, shipping_options, photos_url

### Insurance Template (`policy_upload_template.xlsx`)

Columns: policy_number, customer_email, device_serial, coverage_type, premium_amount, coverage_limit, start_date, end_date, deductible

## Success Metrics

- Template download rate by role
- Upload success rate (target: >95%)
- Average processing time (target: <30s for 100 rows)
- User satisfaction with bulk upload feature
- Reduction in manual data entry time
- Google Drive storage usage optimization

## Implementation Timeline

- Phase 1-2: Template generation & validation (Week 1-2)
- Phase 3: Export system (Week 2)
- Phase 4: Google Drive integration (Week 3)
- Phase 5: Statistical tracking (Week 3-4)
- Phase 6: UI implementation (Week 4-5)
- Phase 7: Premium features & testing (Week 5-6)

### To-dos

- [ ] Create template generator service with device registration field mapping and validation rules
- [ ] Build file upload parser component with CSV/Excel support and real-time validation preview
- [ ] Implement comprehensive validation engine with business rules and duplicate detection
- [ ] Create Supabase Edge Function for server-side bulk data processing with transactions
- [ ] Build data export service supporting CSV, Excel, and JSON formats with filtering
- [ ] Implement Google Drive API integration with OAuth and automatic file organization
- [ ] Create admin_file_operations table and analytics dashboard for tracking all operations
- [ ] Build reusable DataManagementToolbar component and integrate into all admin panels
- [ ] Create PostgreSQL functions for bulk inserts and filtered exports with RLS
- [ ] Implement role-based access control with premium limits and upgrade prompts
- [ ] Test all import/export flows and create user documentation with examples