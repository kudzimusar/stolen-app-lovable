# 🧪 **STAKEHOLDER MANAGEMENT SYSTEM - TESTING GUIDE**

**Date**: October 21, 2025  
**Status**: ✅ **FULLY DEPLOYED - READY FOR TESTING**

---

## ✅ **DEPLOYMENT CHECKLIST - COMPLETED**

- ✅ Database tables created (`stakeholder-management-system.sql`)
- ✅ Database view created (`admin-stakeholders-view.sql`)
- ✅ Edge functions deployed:
  - ✅ `admin-stakeholders-list`
  - ✅ `admin-stakeholders-update`
- ✅ Frontend integrated (`StakeholderPanel.tsx`)
- ✅ API routing configured (`vite.config.ts`)

---

## 🧪 **TESTING INSTRUCTIONS**

### **Step 1: Access Admin Dashboard**

1. Login with admin credentials (email: `kudzimusar@gmail.com` or your admin account)
2. Navigate to: `http://localhost:5173/admin/dashboard`
3. Click on the **"Stakeholders"** tab

**Expected Result:**
- ✅ Dashboard loads without errors
- ✅ KPI cards show: Total Stakeholders, Approved, Pending
- ✅ Stakeholder type tabs visible: All, Retailers, Repair Shops, Law Enforcement, Insurance Partners, NGOs

---

### **Step 2: Test Stakeholder Listing**

**Action:** View the stakeholder list

**Expected Result:**
- ✅ Loading spinner appears briefly
- ✅ List loads (may be empty if no test data)
- ✅ Mobile view shows cards (on mobile/small screen)
- ✅ Desktop view shows table (on desktop/large screen)
- ✅ "No stakeholders found" message if empty

---

### **Step 3: Test Filtering**

**Action:** Click through different stakeholder type tabs

**Test Cases:**
1. Click "Retailers" tab → Should filter to only retailers
2. Click "Repair Shops" tab → Should filter to only repair shops
3. Click "Law Enforcement" tab → Should filter to only law enforcement
4. Click "Insurance Partners" tab → Should filter to only insurance partners
5. Click "NGOs" tab → Should filter to only NGOs
6. Click "All" tab → Should show all stakeholders

**Expected Result:**
- ✅ List updates based on selected type
- ✅ Loading indicator appears during fetch
- ✅ URL or state reflects current filter

---

### **Step 4: Test Status Filtering**

**Action:** Click through status tabs

**Test Cases:**
1. Click "Pending" → Should show only pending stakeholders
2. Click "Approved" → Should show only approved stakeholders
3. Click "Rejected" → Should show only rejected stakeholders
4. Click "Suspended" → Should show only suspended stakeholders
5. Click "All" → Should show all statuses

**Expected Result:**
- ✅ List filters correctly
- ✅ Empty state shows if no matches

---

### **Step 5: Test Search Functionality**

**Action:** Use the search input

**Test Cases:**
1. Type a business name → Should filter results
2. Type an email → Should filter results
3. Type a contact → Should filter results
4. Clear search → Should show all results

**Expected Result:**
- ✅ Real-time filtering as you type
- ✅ Results update immediately
- ✅ "No stakeholders found" if no matches

---

### **Step 6: Test Stakeholder Actions (CRITICAL)**

**Prerequisites:** Need at least one test stakeholder with "pending" status

**Test Approve Action:**
1. Find a pending stakeholder
2. Click "Approve" button
3. **Expected:**
   - ✅ Toast notification: "Stakeholder approved successfully"
   - ✅ Status badge updates to "approved"
   - ✅ List refreshes
   - ✅ KPI stats update

**Test Reject Action:**
1. Find a pending stakeholder
2. Click "Reject" button
3. **Expected:**
   - ✅ Toast notification: "Stakeholder rejected successfully"
   - ✅ Status badge updates to "rejected"
   - ✅ List refreshes

**Test Suspend Action:**
1. Find an approved stakeholder
2. Click "Suspend" button
3. **Expected:**
   - ✅ Toast notification: "Stakeholder suspended successfully"
   - ✅ Status badge updates to "suspended"
   - ✅ Button changes to "Activate"

**Test Activate Action:**
1. Find a suspended stakeholder
2. Click "Activate" button
3. **Expected:**
   - ✅ Toast notification: "Stakeholder activated successfully"
   - ✅ Status badge updates to "approved"
   - ✅ Button changes back to "Suspend"

---

### **Step 7: Test Refresh Functionality**

**Action:** Click the refresh button (circular arrow icon)

**Expected Result:**
- ✅ Button shows spinning animation
- ✅ Data reloads from database
- ✅ Stats update
- ✅ List updates

---

### **Step 8: Test Mobile Responsiveness**

**Action:** Resize browser window or test on mobile device

**Test Points:**
1. **Mobile (< 640px):**
   - ✅ 3-column KPI grid
   - ✅ Card-based list view
   - ✅ Horizontal scrolling tabs
   - ✅ Compact typography (10-12px)
   - ✅ Stacked action buttons

2. **Desktop (>= 640px):**
   - ✅ 4-column KPI grid
   - ✅ Table view with all columns
   - ✅ Standard tab layout
   - ✅ Inline action buttons

---

### **Step 9: Test Error Handling**

**Test Cases:**
1. **No admin access:** Login as regular user → Should not see admin panel
2. **Network error:** Disconnect internet → Should show error toast
3. **Empty results:** Search for non-existent stakeholder → Should show "No stakeholders found"

---

## 🐛 **TROUBLESHOOTING**

### **Issue: "Failed to fetch stakeholders"**

**Possible Causes:**
1. Edge functions not deployed
2. API routing misconfigured
3. Database functions not created

**Solution:**
```bash
# Check edge functions are deployed
supabase functions list

# Verify database functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_admin_stakeholder_stats', 'list_stakeholders', 'get_stakeholder_details');
```

---

### **Issue: "Admin privileges required"**

**Cause:** User is not in `admin_users` table

**Solution:**
```sql
-- Check admin status
SELECT * FROM admin_users WHERE user_id = 'YOUR_USER_ID';

-- If not admin, add them
INSERT INTO admin_users (user_id, permissions, is_active)
VALUES ('YOUR_USER_ID', '["admin:full"]'::jsonb, true);
```

---

### **Issue: Empty stakeholder list**

**Cause:** No stakeholders in database

**Solution:** Create test stakeholders:

```sql
-- Create a test retailer user first
INSERT INTO users (id, email, display_name, role, verification_status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'test-retailer@example.com',
    'Test Retailer',
    'retailer',
    true
);

-- Create retailer stakeholder
INSERT INTO retailers (
    user_id,
    business_name,
    business_type,
    license_number,
    certification_status,
    contact_email,
    contact_phone
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Tech Store Ltd',
    'electronics_retailer',
    'LIC-12345',
    'pending',
    'contact@techstore.com',
    '+1234567890'
);
```

---

## 📊 **DATABASE VERIFICATION QUERIES**

### **Check Stakeholders View:**
```sql
SELECT 
    role,
    approval_status,
    COUNT(*) as count
FROM admin_stakeholders_view
GROUP BY role, approval_status
ORDER BY role, approval_status;
```

### **Check Audit Logs:**
```sql
SELECT 
    stakeholder_type,
    action_type,
    COUNT(*) as count
FROM stakeholder_audit_log
GROUP BY stakeholder_type, action_type
ORDER BY stakeholder_type, action_type;
```

### **Check Statistics:**
```sql
SELECT get_admin_stakeholder_stats();
```

---

## ✅ **SUCCESS CRITERIA**

The system is working correctly when:

- ✅ Admin can access stakeholder panel
- ✅ KPI stats display correctly
- ✅ Stakeholder list loads
- ✅ Filtering by type works
- ✅ Filtering by status works
- ✅ Search functionality works
- ✅ Approve action works and updates status
- ✅ Reject action works and updates status
- ✅ Suspend/Activate actions work
- ✅ Toast notifications appear for all actions
- ✅ Audit logs are created for all actions
- ✅ Mobile responsive design works
- ✅ Refresh button updates data

---

## 🎉 **NEXT STEPS AFTER TESTING**

Once all tests pass, you can:

1. **Create Production Stakeholders**: Add real stakeholder accounts
2. **Set Up Email Notifications**: Integrate with existing notification system
3. **Add Bulk Operations**: Approve/reject multiple stakeholders at once
4. **Enhanced Analytics**: Add charts and trend analysis
5. **Document Management**: File upload for verification documents
6. **API Keys**: Generate API keys for approved stakeholders

---

## 📞 **SUPPORT**

If you encounter any issues during testing:

1. Check browser console for JavaScript errors
2. Check Supabase logs for edge function errors
3. Check database logs for SQL errors
4. Verify all deployment steps were completed
5. Test with test data first before using production data

---

**Testing Guide Complete!** 🚀

Test the system thoroughly and report any issues for immediate fixes.

