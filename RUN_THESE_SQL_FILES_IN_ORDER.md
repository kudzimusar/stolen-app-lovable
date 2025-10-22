# 🚀 SQL Deployment - Run in This EXACT Order

## ✅ Complete Stakeholder System Deployment

Run these 2 SQL files in Supabase SQL Editor in this order:

---

## Step 1: Create Missing Tables (FIRST)

**File**: `supabase/migrations/20251023000002_complete_stakeholder_tables.sql`

**What it creates**:
- ✅ `repair_orders` - For repair shop admins
- ✅ `insurance_policies` - For insurance admins
- ✅ `insurance_claims` - For insurance admins  
- ✅ `device_donations` - For NGO admins
- ✅ `marketplace_transactions` - For retailer admins
- ✅ Adds `assigned_officer_id` to `stolen_reports` - For law enforcement
- ✅ RLS policies for all new tables

**How to run**:
1. Open: https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new
2. Copy ALL contents of: `supabase/migrations/20251023000002_complete_stakeholder_tables.sql`
3. Paste in SQL Editor
4. Click "RUN"
5. Should see: ✅ Complete stakeholder tables created successfully

---

## Step 2: Create Admin System (SECOND)

**File**: `supabase/migrations/20251023000001_stakeholder_admin_system.sql`

**What it creates**:
- ✅ `stakeholder_admin_requests` - Admin approval workflow
- ✅ 5 role-specific views (retailer, repair, insurance, LE, NGO stats)
- ✅ Helper functions (approve_stakeholder_admin_request, has_stakeholder_admin_access)
- ✅ RLS policies for admin requests

**How to run**:
1. Open: https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new
2. Copy ALL contents of: `supabase/migrations/20251023000001_stakeholder_admin_system.sql`
3. Paste in SQL Editor
4. Click "RUN"
5. Should see: ✅ Stakeholder admin system created successfully

---

## ✅ Verification (30 seconds)

After running BOTH files, verify in SQL Editor:

### Test 1: Tables exist
```sql
SELECT COUNT(*) FROM repair_orders;
SELECT COUNT(*) FROM insurance_policies;
SELECT COUNT(*) FROM insurance_claims;
SELECT COUNT(*) FROM device_donations;
SELECT COUNT(*) FROM marketplace_transactions;
SELECT COUNT(*) FROM stakeholder_admin_requests;
```

All should return `0` (empty tables) or data - NO ERRORS ✅

### Test 2: Views exist
```sql
SELECT * FROM retailer_admin_stats LIMIT 1;
SELECT * FROM repair_shop_admin_stats LIMIT 1;
SELECT * FROM insurance_admin_stats LIMIT 1;
SELECT * FROM law_enforcement_admin_stats LIMIT 1;
SELECT * FROM ngo_admin_stats LIMIT 1;
```

All should return empty results or data - NO ERRORS ✅

### Test 3: Functions exist
```sql
SELECT has_stakeholder_admin_access('00000000-0000-0000-0000-000000000000');
```

Should return: `false` - NO ERRORS ✅

---

## 🎉 After Successful Deployment

Your system is now 100% complete and ready to test!

### Quick Test:

**Test 1 - Super Admin Dashboard**:
```
Go to: http://localhost:8081/admin
Click: Lost & Found panel
See: "Data Management Toolbar"
Click: "Download Template" → Excel
Result: Professional template downloads! ✅
```

**Test 2 - Individual User**:
```
Go to: http://localhost:8081/my-devices
See: "My Devices - Import/Export" toolbar
Click: "Download Template" → Excel
Result: Personal device template downloads! ✅
```

**Test 3 - Stakeholder Admin** (if you have test account):
```
Login as: retailer
Auto-redirect to: http://localhost:8081/retailer-admin
See: 8-panel Retailer Admin Dashboard
Each panel has: Import/export toolbar
```

---

## 📊 What You Get

After running both files:

**Tables Created** (5):
- repair_orders (repair shop operations)
- insurance_policies (insurance coverage)
- insurance_claims (insurance claims processing)
- device_donations (NGO donation management)
- marketplace_transactions (sales transactions)
- stakeholder_admin_requests (admin approval workflow)

**Views Created** (5):
- retailer_admin_stats
- repair_shop_admin_stats
- insurance_admin_stats
- law_enforcement_admin_stats
- ngo_admin_stats

**Functions Created** (2):
- approve_stakeholder_admin_request()
- has_stakeholder_admin_access()

**RLS Policies**: Complete data isolation for all stakeholder roles

---

## 🔐 Security

Each stakeholder admin can ONLY see their own data:
- ✅ Retailer A cannot see Retailer B's data
- ✅ Repair Shop cannot see Insurance data
- ✅ Law Enforcement cannot modify marketplace listings
- ✅ Super Admin can see everything (for support)

---

## ⚡ Quick Links

**Supabase SQL Editor**: https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new

**File 1** (run FIRST): `supabase/migrations/20251023000002_complete_stakeholder_tables.sql`

**File 2** (run SECOND): `supabase/migrations/20251023000001_stakeholder_admin_system.sql`

**Your App**: http://localhost:8081

---

**Time**: 2 minutes total  
**Difficulty**: Copy/paste  
**Result**: Complete stakeholder admin system with full functionality!

🚀 **GO!**

