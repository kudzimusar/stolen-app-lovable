# Product Detail Page Database Migration Guide

## Overview
This guide provides step-by-step instructions to migrate your Supabase database to support the comprehensive Product Detail page with real data instead of mock data.

## Migration Files Created

### 1. New Tables (8 tables)
- `create-seller-profiles-table.sql` - Seller information and ratings
- `create-device-verifications-table.sql` - Verification history (QR scans, serial lookups, etc.)
- `create-device-ownership-history-table.sql` - Ownership transfer history
- `create-device-repairs-table.sql` - Repair history
- `create-device-certificates-table.sql` - Warranties and certificates
- `create-device-risk-assessment-table.sql` - Risk analysis data
- `create-price-history-table.sql` - Price tracking for listings
- `create-device-reviews-table.sql` - Reviews and ratings system

### 2. Enhanced Existing Tables
- `add-missing-columns-to-devices.sql` - Additional device specifications and tracking
- `add-missing-columns-to-marketplace-listings.sql` - Enhanced marketplace features

### 3. Comprehensive Migration
- `comprehensive-product-detail-migration.sql` - All-in-one migration script

## How to Apply Migrations

### Option 1: Manual Application via Supabase Dashboard
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste each SQL file content
4. Run them in this order:

```
1. create-seller-profiles-table.sql
2. create-device-verifications-table.sql
3. create-device-ownership-history-table.sql
4. create-device-repairs-table.sql
5. create-device-certificates-table.sql
6. create-device-risk-assessment-table.sql
7. create-price-history-table.sql
8. create-device-reviews-table.sql
9. add-missing-columns-to-devices.sql
10. add-missing-columns-to-marketplace-listings.sql
```

### Option 2: Single Comprehensive Migration
1. Copy the content from `comprehensive-product-detail-migration.sql`
2. Paste into Supabase SQL Editor
3. Run the entire script

## What This Migration Accomplishes

### Database Tables Created
1. **seller_profiles** - Stores detailed seller information, ratings, verification status
2. **device_verifications** - Tracks all verification events (QR scans, serial lookups, blockchain anchors)
3. **device_ownership_history** - Complete ownership transfer history with certificates
4. **device_repairs** - Repair history with service providers and costs
5. **device_certificates** - Warranties, authenticity certificates, ownership certificates
6. **device_risk_assessment** - Risk analysis and scoring
7. **price_history** - Price tracking for marketplace listings
8. **device_reviews** - Review and rating system

### Enhanced Device Data
- Trust scores and verification levels
- Enhanced specifications (RAM, processor, screen size, battery health)
- Marketplace eligibility and pricing recommendations
- Risk assessment and security status

### Enhanced Marketplace Listings
- Premium trust score features
- Watchlist and inquiry tracking
- SEO optimization fields
- Advanced marketplace features (escrow, shipping, negotiations)

## Data Acquisition Strategy

### Device Registration Form Updates Needed
The Device Registration Form (`/device/register`) needs to be updated to collect:

1. **Enhanced Device Specifications**
   - RAM (GB)
   - Processor
   - Screen size (inches)
   - Battery health percentage
   - Device condition assessment

2. **Warranty Information**
   - Warranty months
   - Warranty expiry date
   - Warranty document upload

3. **Enhanced Verification**
   - QR code scanning
   - Serial number verification
   - Document verification

4. **Repair History**
   - Past repairs
   - Service providers
   - Repair costs

### Marketplace Listing Form Updates Needed
The List My Device form (`/list-my-device`) needs to:

1. **Auto-populate** device data from the devices table
2. **Collect listing-specific** information:
   - Price and currency
   - Description and tags
   - Marketplace features (escrow, shipping, negotiations)

## Next Steps After Migration

### 1. Update Edge Functions
- Modify `marketplace-listings` edge function to fetch data from new tables
- Update `my-devices` edge function to include enhanced device data
- Update `create-listing` edge function to populate new fields

### 2. Update Frontend Components
- Update `ProductDetail.tsx` to display real data from new tables
- Update `DeviceRegister.tsx` to collect new data fields
- Update `ListMyDevice.tsx` to auto-populate and collect enhanced data

### 3. Update APIs
- Modify marketplace APIs to serve rich data from new tables
- Add new endpoints for reviews, repairs, certificates
- Update data transformation logic

## Verification

After running the migrations, verify by:

1. **Check Tables**: Ensure all 8 new tables exist
2. **Check Columns**: Verify new columns were added to existing tables
3. **Test RLS**: Ensure Row Level Security policies are working
4. **Test Functions**: Verify utility functions are created
5. **Test Triggers**: Ensure triggers are firing correctly

## Troubleshooting

### Common Issues
1. **Permission Errors**: Ensure you're running as a database owner
2. **Constraint Violations**: Check for existing data conflicts
3. **Function Errors**: Verify function syntax and dependencies

### Rollback Plan
If issues occur, you can rollback by:
1. Dropping new tables
2. Removing added columns
3. Dropping functions and triggers

## Support

If you encounter issues:
1. Check the SQL error messages
2. Verify table dependencies
3. Ensure proper permissions
4. Test functions individually

---

**Note**: This migration significantly enhances your database schema to support a comprehensive Product Detail page with real data instead of mock data. All the data elements shown in your images can now be stored and retrieved from the database.

