# STAKEHOLDER SYSTEM - QUICK VERIFICATION GUIDE

**Quick 5-Minute Verification Checklist**

---

## 🚀 QUICK START

### 1. Database Verification (2 minutes)

```bash
# Option A: Using psql (if you have direct database access)
psql -h [your-host] -U [user] -d [database] -f database/sql/verify-stakeholder-system.sql

# Option B: Using Supabase SQL Editor
# 1. Open Supabase Dashboard → SQL Editor
# 2. Copy contents of: database/sql/verify-stakeholder-system.sql
# 3. Paste and Execute
# 4. Check results for ✅ or ❌ indicators
```

**Expected Results:**
- ✅ 6/6 tables exist
- ✅ 1/1 views exist
- ✅ 6/6 functions exist
- ✅ 6/6 RLS enabled
- ✅ 5/5 triggers exist

---

### 2. Edge Functions Verification (1 minute)

```bash
# Check deployment
supabase functions list

# Should show:
# - admin-stakeholders-list
# - admin-stakeholders-update

# Or run automated check:
node scripts/verify-edge-functions.js
```

**If functions are missing:**
```bash
cd supabase
supabase functions deploy admin-stakeholders-list
supabase functions deploy admin-stakeholders-update
```

---

### 3. API Connection Test (2 minutes)

```bash
# Start dev server (if not already running)
npm run dev

# In another terminal, run:
node scripts/test-stakeholder-api.js
```

**Expected Results:**
- ✅ Dev server running
- ✅ API stats endpoint working
- ✅ API list endpoint working
- ✅ Proxy routes configured

---

### 4. Manual Browser Test (Optional)

```
1. Open: http://localhost:8080/admin/dashboard
2. Login with admin credentials
3. Click "Stakeholders" tab
4. Verify:
   - KPI cards show numbers
   - List loads (may be empty if no data)
   - Tabs work (All, Retailers, etc.)
   - Search box appears
```

---

## ❌ QUICK FIXES

### If Database Components Missing:

```bash
# Run these scripts in order:
1. database/sql/stakeholder-management-system.sql
2. database/sql/admin-stakeholders-view.sql
```

### If Edge Functions Missing:

```bash
cd supabase
supabase functions deploy admin-stakeholders-list
supabase functions deploy admin-stakeholders-update
```

### If Not Admin:

```sql
-- Add yourself as admin
INSERT INTO admin_users (user_id, permissions, is_active)
VALUES ('YOUR_USER_ID', '["admin:full"]'::jsonb, true);
```

### If No Test Data:

```sql
-- Create test retailer
INSERT INTO users (id, email, display_name, role, verification_status)
VALUES (gen_random_uuid(), 'test@retailer.com', 'Test Retailer', 'retailer', true)
RETURNING id;

-- Use returned ID
INSERT INTO retailers (user_id, business_name, contact_email)
VALUES ('[RETURNED_ID]', 'Test Store', 'test@store.com');
```

---

## 📊 COMPONENT STATUS

### What Should Exist:

**Database (6 tables):**
- retailers
- repair_shops
- law_enforcement
- insurance_partners
- ngos
- stakeholder_audit_log

**Database (1 view):**
- admin_stakeholders_view

**Database (6 functions):**
- get_admin_stakeholder_stats()
- list_stakeholders()
- get_stakeholder_details()
- get_stakeholder_type()
- get_stakeholder_id()
- update_stakeholder_status()

**Edge Functions (2):**
- admin-stakeholders-list
- admin-stakeholders-update

**Frontend (1 component):**
- src/pages/admin/panels/StakeholderPanel.tsx

**API Routes (2):**
- /api/v1/admin/stakeholders
- /api/v1/admin/stakeholders/update

---

## 🔍 WHERE TO LOOK

### Database Issues:
→ Run: `database/sql/verify-stakeholder-system.sql`

### Edge Function Issues:
→ Run: `node scripts/verify-edge-functions.js`

### API Issues:
→ Run: `node scripts/test-stakeholder-api.js`

### Frontend Issues:
→ Check: Browser console (F12)  
→ Check: Network tab in DevTools

### Detailed Documentation:
→ Read: `STAKEHOLDER-VERIFICATION-REPORT.md`

---

## ✅ SUCCESS INDICATORS

When everything is working:

1. ✅ Database verification shows all components exist
2. ✅ Edge functions verification shows both deployed
3. ✅ API test shows all connections working
4. ✅ Browser shows stakeholder panel without errors
5. ✅ Actions (approve/reject/suspend) work when clicked

---

## 🆘 STILL HAVING ISSUES?

1. Check full report: `STAKEHOLDER-VERIFICATION-REPORT.md`
2. Review deployment guide: `STAKEHOLDER-SYSTEM-STATUS.md`
3. Read testing guide: `STAKEHOLDER-SYSTEM-TESTING-GUIDE.md`
4. Check browser console for specific errors
5. Check Supabase function logs: `supabase functions logs admin-stakeholders-list`

---

**Last Updated**: October 21, 2025  
**System Version**: 1.0  
**Status**: Ready for verification




