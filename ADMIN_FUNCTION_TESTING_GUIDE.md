# 🧪 Admin Function Testing Guide

## 📋 **Overview**
This guide will help you test the deployed `admin-approve-claim` and `submit-claim` functions.

## 🔧 **Step 1: Fix Super Admin User**

### **Run the Super Admin Fix Script:**
```sql
-- Execute this in your Supabase SQL Editor
\i fix-super-admin-user.sql
```

### **Expected Results:**
- ✅ `kudzimusar@gmail.com` should be set up as a super admin
- ✅ Super admin role should exist in `admin_roles` table
- ✅ User should have full permissions

## 🧪 **Step 2: Test Data Setup**

### **Run the Test Data Script:**
```sql
-- Execute this in your Supabase SQL Editor
\i test-deployed-functions.sql
```

### **Expected Results:**
- ✅ At least one report with `claim_pending` status
- ✅ Active admin users available for testing
- ✅ Test data created for workflow testing

## 🎯 **Step 3: Test Admin Approval Workflow**

### **3.1 Access Admin Dashboard**
1. Go to: `http://localhost:8081/admin/dashboard`
2. Login with: `kudzimusar@gmail.com`
3. Navigate to **Lost & Found Management**

### **3.2 Test Admin Approval**
1. **Find a "Claim Pending" report**
2. **Click "Approve" button**
3. **Expected Result**: 
   - ✅ Report status changes to `approved`
   - ✅ Notification sent to claimant
   - ✅ Success message displayed

### **3.3 Test Admin Rejection**
1. **Find another "Claim Pending" report**
2. **Click "Reject" button**
3. **Expected Result**:
   - ✅ Report status changes to `rejected`
   - ✅ Notification sent to claimant
   - ✅ Success message displayed

## 🔄 **Step 4: Test Submit Claim Function**

### **4.1 Test Public Claim Submission**
1. Go to: `http://localhost:8081/claim-device`
2. **Fill out the form:**
   - Serial Number: `TEST123456789`
   - Purchase Details: Test purchase info
   - Contact Information: Your email
3. **Submit the form**
4. **Expected Result**:
   - ✅ Success message displayed
   - ✅ Report created with `claim_pending` status
   - ✅ Admin notification sent

### **4.2 Verify Claim in Database**
```sql
-- Check if claim was created
SELECT 
    id,
    device_model,
    claim_status,
    claimant_name,
    claim_submitted_at
FROM lost_found_reports 
WHERE claim_status = 'claim_pending'
ORDER BY claim_submitted_at DESC;
```

## 🔍 **Step 5: API Endpoint Testing**

### **5.1 Test admin-approve-claim Endpoint**
```bash
# Test approval
curl -X POST "https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/admin-approve-claim" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "report_id": "REPORT_ID_HERE",
    "approval_status": "approved",
    "admin_notes": "Test approval"
  }'
```

### **5.2 Test submit-claim Endpoint**
```bash
# Test claim submission
curl -X POST "https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/submit-claim" \
  -H "Content-Type: application/json" \
  -d '{
    "serial_number": "TEST123456789",
    "purchase_details": "Test purchase",
    "contact_email": "test@example.com",
    "additional_proof": "Test proof"
  }'
```

## 📊 **Step 6: Verification Checklist**

### **✅ Admin Approval Workflow**
- [ ] Super admin user can access admin dashboard
- [ ] Admin can see "Claim Pending" reports
- [ ] Approve button works and updates status
- [ ] Reject button works and updates status
- [ ] Notifications are sent to claimants
- [ ] Success messages are displayed

### **✅ Submit Claim Workflow**
- [ ] Public claim form is accessible
- [ ] Form submission creates claim_pending report
- [ ] Admin receives notification of new claim
- [ ] Claim appears in admin dashboard
- [ ] Serial number validation works

### **✅ Database Updates**
- [ ] `lost_found_reports` table updates correctly
- [ ] `notifications` table receives new entries
- [ ] `admin_users` table has super admin
- [ ] `admin_roles` table has super_admin role

## 🚨 **Troubleshooting**

### **If Super Admin Login Fails:**
1. Check if user exists in `auth.users`
2. Verify admin role assignment
3. Check permissions in `admin_users` table

### **If Admin Dashboard Shows No Data:**
1. Verify admin user permissions
2. Check if reports exist with correct status
3. Verify API endpoints are accessible

### **If Functions Return Errors:**
1. Check function logs in Supabase dashboard
2. Verify JWT token is valid
3. Check database permissions

## 📞 **Support**

If you encounter issues:
1. Check the Supabase function logs
2. Verify database table structures
3. Test API endpoints directly
4. Check browser console for errors

---

**Last Updated**: October 2025  
**Status**: Ready for Testing
