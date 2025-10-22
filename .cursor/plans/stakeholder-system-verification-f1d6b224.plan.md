<!-- f1d6b224-86ab-4e7e-8ad9-185219edb7e8 dc44151c-77d8-4f6a-9c00-2791eb24f4f7 -->
# Stakeholder System Connection Verification Plan

## Overview
Verify the complete stakeholder management system implementation including database tables, views, functions, edge functions, and frontend connections.

## System Architecture Summary

### Frontend Component
- **Location**: `src/pages/admin/panels/StakeholderPanel.tsx`
- **Features**: View stakeholders, filter by type/status, approve/reject/suspend/activate actions
- **API Calls**: 
  - `POST /api/v1/admin/stakeholders` (list & stats)
  - `POST /api/v1/admin/stakeholders/update` (actions)

### API Routing (vite.config.ts)
```
/api/v1/admin/stakeholders → admin-stakeholders-list edge function
/api/v1/admin/stakeholders/update → admin-stakeholders-update edge function
```

### Edge Functions
1. **admin-stakeholders-list** (`supabase/functions/admin-stakeholders-list/index.ts`)
   - Actions: `get_stats`, `list_stakeholders`, `get_stakeholder_details`
   - Calls database functions: `get_admin_stakeholder_stats()`, `list_stakeholders()`, `get_stakeholder_details()`

2. **admin-stakeholders-update** (`supabase/functions/admin-stakeholders-update/index.ts`)
   - Actions: `approve`, `reject`, `suspend`, `activate`, `update_notes`
   - Calls database function: `update_stakeholder_status()`

### Database Schema

#### Tables to Verify:
1. **retailers** - Electronic device retailers with certification levels
2. **repair_shops** - Device repair services with specializations
3. **law_enforcement** - Police/law enforcement with clearance levels
4. **insurance_partners** - Insurance providers with coverage types
5. **ngos** - Non-profit organizations with focus areas
6. **stakeholder_audit_log** - Comprehensive audit trail

#### Views to Verify:
- **admin_stakeholders_view** - Unified view combining all stakeholder types

#### Functions to Verify:
1. `get_admin_stakeholder_stats()` - Returns comprehensive statistics
2. `list_stakeholders(type, status, search, limit, offset)` - Lists stakeholders with filters
3. `get_stakeholder_details(user_id)` - Gets details for one stakeholder
4. `get_stakeholder_type(user_id)` - Gets stakeholder type
5. `get_stakeholder_id(user_id)` - Gets stakeholder ID
6. `update_stakeholder_status(user_id, status, admin_id, notes)` - Updates approval status

## Verification Steps

### Step 1: Create Database Verification Script
Create a SQL script to check:
- All 6 stakeholder tables exist
- The admin_stakeholders_view exists
- All 6 database functions exist
- Row Level Security (RLS) is enabled
- Indexes are created
- Triggers for audit logging exist

### Step 2: Create Edge Function Deployment Check
Verify both edge functions are deployed to Supabase:
- `admin-stakeholders-list`
- `admin-stakeholders-update`

### Step 3: Create Connection Test Script
Create a test script to:
- Test API routing from frontend to edge functions
- Test database function calls
- Verify authentication flow
- Test each action (approve, reject, suspend, activate)

### Step 4: Create Comprehensive Status Report
Document findings including:
- Database deployment status
- Edge function deployment status
- API connection status
- Any missing components
- Recommendations for fixes

## Key Files Involved

**Database Scripts:**
- `database/sql/stakeholder-management-system.sql` - Creates tables, triggers, RLS
- `database/sql/admin-stakeholders-view.sql` - Creates view and query functions

**Edge Functions:**
- `supabase/functions/admin-stakeholders-list/index.ts`
- `supabase/functions/admin-stakeholders-update/index.ts`

**Frontend:**
- `src/pages/admin/panels/StakeholderPanel.tsx`
- `vite.config.ts` (API routing)

**Documentation:**
- `STAKEHOLDER-SYSTEM-STATUS.md` - Deployment guide
- `STAKEHOLDER-SYSTEM-TESTING-GUIDE.md` - Testing instructions

## Expected Issues & Solutions

### Possible Issue 1: Database Tables Not Created
**Check**: Query `information_schema.tables`
**Solution**: Run `stakeholder-management-system.sql` and `admin-stakeholders-view.sql`

### Possible Issue 2: Edge Functions Not Deployed
**Check**: List deployed functions via Supabase CLI
**Solution**: Deploy using `supabase functions deploy admin-stakeholders-list` and `supabase functions deploy admin-stakeholders-update`

### Possible Issue 3: Database Functions Not Found
**Check**: Query `information_schema.routines`
**Solution**: Re-run `admin-stakeholders-view.sql`

### Possible Issue 4: Authentication Failures
**Check**: Verify `admin_users` table has active admin
**Solution**: Ensure user is in `admin_users` with `is_active = true`

## Deliverables

1. **Database Verification SQL Script** - Checks all database components
2. **Connection Test Results** - Documents what's working and what's not
3. **Deployment Status Report** - Complete status of all components
4. **Fix Instructions** - Step-by-step guide to fix any issues found

### To-dos

- [ ] Create SQL verification script to check all stakeholder tables, views, functions, RLS policies, and triggers exist
- [ ] Create script to verify edge functions (admin-stakeholders-list and admin-stakeholders-update) are deployed
- [ ] Create test script to verify API routing from frontend through vite proxy to edge functions
- [ ] Verify admin authentication flow from StakeholderPanel through edge functions to database
- [ ] Generate comprehensive status report documenting all findings, deployment status, and any issues