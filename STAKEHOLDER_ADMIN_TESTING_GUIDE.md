# 🧪 Stakeholder Admin Testing Guide - Complete Walkthrough

## 🎯 All Stakeholder Admin Dashboard URLs

Your new stakeholder admin dashboards are live at these URLs:

### 1. **Retailer Admin Dashboard**
```
http://localhost:8081/retailer-admin
```
**Role Required**: `retailer`  
**What You'll See**: Blue-themed dashboard with Store icon, 8 panels showing retailer-specific data

---

### 2. **Repair Shop Admin Dashboard**
```
http://localhost:8081/repair-shop-admin
```
**Role Required**: `repair_shop`  
**What You'll See**: Orange-themed dashboard with Wrench icon, 8 panels showing repair data

---

### 3. **Insurance Admin Dashboard**
```
http://localhost:8081/insurance-admin
```
**Role Required**: `insurance`  
**What You'll See**: Purple-themed dashboard with Scale icon, 8 panels showing insurance data

---

### 4. **Law Enforcement Admin Dashboard**
```
http://localhost:8081/law-enforcement-admin
```
**Role Required**: `law_enforcement`  
**What You'll See**: Red-themed dashboard with Shield icon, 8 panels showing case data

---

### 5. **NGO Admin Dashboard**
```
http://localhost:8081/ngo-admin
```
**Role Required**: `ngo`  
**What You'll See**: Pink-themed dashboard with Heart icon, 8 panels showing donation data

---

### 6. **Super Admin Dashboard** (Already Working)
```
http://localhost:8081/admin
```
**Role Required**: `super_admin` or `admin`  
**What You'll See**: Blue-themed dashboard with Shield icon, 8 panels showing ALL data

---

### 7. **Individual User** (Already Working)
```
http://localhost:8081/my-devices
```
**Role Required**: `individual`  
**What You'll See**: Personal devices page with import/export toolbar

---

## 🔐 How to Access Stakeholder Dashboards

### Option A: If You Already Have Stakeholder Accounts

**Step 1**: Logout from current session
- Click profile/logout button

**Step 2**: Login with stakeholder credentials
- Go to: http://localhost:8081/login
- Enter email/password for retailer/repair_shop/insurance/law_enforcement/ngo account

**Step 3**: Auto-redirect
- System will automatically redirect to appropriate dashboard
- Retailer → `/retailer-admin`
- Repair Shop → `/repair-shop-admin`
- etc.

---

### Option B: Create New Test Stakeholder Accounts

If you don't have stakeholder accounts, create them:

**Step 1**: Go to registration
```
http://localhost:8081/register
```

**Step 2**: Register with stakeholder role
- Fill in email/password
- **Select role**: Choose "Retailer" / "Repair Shop" / etc.
- Complete registration

**Step 3**: Login
- System auto-redirects to your stakeholder admin dashboard

---

### Option C: Use Supabase to Create Test Accounts Directly

Run this in Supabase SQL Editor to create test accounts:

```sql
-- Create test retailer account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test-retailer@stolen.app',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Then add to users table (replace UUID with returned ID)
INSERT INTO public.users (id, email, role, display_name, verification_status)
VALUES (
  'paste-the-uuid-here',
  'test-retailer@stolen.app',
  'retailer',
  'Test Retailer Store',
  true
);
```

**Or simpler** - just use the registration page!

---

## 📋 What to Test for Each Dashboard

When you access each stakeholder admin dashboard, verify:

### ✅ Dashboard Loads
- [ ] Page loads without errors
- [ ] Shows role-specific name (e.g., "Retailer Admin Dashboard")
- [ ] Shows role-specific icon and color
- [ ] Shows 8 navigation panels

### ✅ 8 Panels Present
- [ ] 📊 Overview
- [ ] 👥 Users
- [ ] 🔍 Lost & Found
- [ ] 🛒 Marketplace
- [ ] 🏪 Stakeholders
- [ ] 💰 Financial
- [ ] 🔒 Security
- [ ] ⚙️ Settings

### ✅ Each Panel Has Toolbar
- [ ] Click each panel
- [ ] Look for "Data Management Toolbar" section
- [ ] Should have 3 buttons: Download Template, Import Data, Export

### ✅ Role-Specific Stats
- [ ] Overview panel shows role-specific KPIs
- [ ] Numbers are filtered to their data only (may be 0 if new account)

### ✅ Template Downloads Work
- [ ] Click "Download Template" in any panel
- [ ] Select Excel or CSV
- [ ] File downloads
- [ ] Open file - has 5-row professional structure

### ✅ Data Isolation (Security Test)
- [ ] Data shown is only for THAT stakeholder
- [ ] Cannot see other stakeholders' data
- [ ] Super admin sees ALL data

---

## 🧪 Complete Testing Checklist

### Test Super Admin
```
URL: http://localhost:8081/admin
Login: Your super admin account (kudzimusar@gmail.com or admin account)
Expected: 
  - ✅ See all 8 panels
  - ✅ Each panel has import/export toolbar
  - ✅ Can download templates
  - ✅ Can see ALL stakeholder data
```

### Test Retailer Admin
```
URL: http://localhost:8081/retailer-admin (auto-redirects on login)
Login: Account with role='retailer'
Expected:
  - ✅ Blue dashboard with Store icon
  - ✅ "Retailer Admin Dashboard" title
  - ✅ 8 panels with retailer-specific labels
  - ✅ Stats show: Total Listings, Active Listings, Revenue, Transactions
  - ✅ Each panel has toolbar
  - ✅ Can download retailer templates
  - ✅ Data shows only THEIR listings (not other retailers)
```

### Test Repair Shop Admin
```
URL: http://localhost:8081/repair-shop-admin (auto-redirects on login)
Login: Account with role='repair_shop'
Expected:
  - ✅ Orange dashboard with Wrench icon
  - ✅ "Repair Shop Admin Dashboard" title
  - ✅ Stats show: Total Repairs, Pending Repairs, Revenue, Customers
  - ✅ Each panel has toolbar
  - ✅ Can download repair templates
  - ✅ Data shows only THEIR repairs
```

### Test Insurance Admin
```
URL: http://localhost:8081/insurance-admin (auto-redirects on login)
Login: Account with role='insurance'
Expected:
  - ✅ Purple dashboard with Scale icon
  - ✅ "Insurance Admin Dashboard" title
  - ✅ Stats show: Active Policies, Pending Claims, Total Payouts, Total Claims
  - ✅ Each panel has toolbar
  - ✅ Can download insurance templates
  - ✅ Data shows only THEIR policies/claims
```

### Test Law Enforcement Admin
```
URL: http://localhost:8081/law-enforcement-admin (auto-redirects on login)
Login: Account with role='law_enforcement'
Expected:
  - ✅ Red dashboard with Shield icon
  - ✅ "Law Enforcement Admin Dashboard" title
  - ✅ Stats show: Total Cases, Active Cases, Recovery Rate, Reports Accessed
  - ✅ Each panel has toolbar
  - ✅ Can download LE templates
  - ✅ Data shows only THEIR cases
```

### Test NGO Admin
```
URL: http://localhost:8081/ngo-admin (auto-redirects on login)
Login: Account with role='ngo'
Expected:
  - ✅ Pink dashboard with Heart icon
  - ✅ "NGO Admin Dashboard" title
  - ✅ Stats show: Total Donations, Beneficiaries, Devices Managed, Impact Score
  - ✅ Each panel has toolbar
  - ✅ Can download NGO templates
  - ✅ Data shows only THEIR donations
```

### Test Individual User
```
URL: http://localhost:8081/my-devices
Login: Regular user account (role='individual')
Expected:
  - ✅ My Devices page loads
  - ✅ "My Devices - Import/Export" toolbar visible
  - ✅ Can download personal device template
  - ✅ Can import up to 10 devices
  - ✅ Can export personal devices
```

---

## 🔑 Quick Account Creation

### Create Test Accounts Via Registration

**For Each Stakeholder Type**:

1. **Go to**: http://localhost:8081/register

2. **Fill Form**:
   - Email: `test-retailer@stolen.app` (or test-repair@stolen.app, etc.)
   - Password: `Test123!`
   - Select Role: Choose the role you want to test
   - Complete other required fields

3. **Submit**: Click Register

4. **Login**: Login with the new account

5. **Auto-Redirect**: Should go to appropriate admin dashboard

**Repeat for each role**:
- test-retailer@stolen.app → Retailer
- test-repair@stolen.app → Repair Shop
- test-insurance@stolen.app → Insurance
- test-lawenforcement@stolen.app → Law Enforcement
- test-ngo@stolen.app → NGO

---

## 📸 What Each Dashboard Looks Like

### Retailer Admin Dashboard
```
┌────────────────────────────────────────────────────┐
│ 🏪 Retailer Admin Dashboard                        │
│ Welcome, Test Retailer Store                       │
│                                    [Refresh] [0 pending]│
├────────────────────────────────────────────────────┤
│ [📊 Overview] [👥 Users] [🔍 Lost & Found]        │
│ [🛒 Marketplace] [🏪 Stakeholders] [💰 Financial] │
│ [🔒 Security] [⚙️ Settings]                        │
├────────────────────────────────────────────────────┤
│ OVERVIEW PANEL:                                    │
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐│
│ │Total Listings│ │Active Listings│ │Total Revenue││
│ │      0       │ │       0      │ │    R0       ││
│ └──────────────┘ └──────────────┘ └─────────────┘│
│                                                    │
│ Lost & Found Panel:                               │
│ ┌─────────────────────────────────────────────┐  │
│ │ Data Management Toolbar                      │  │
│ │ [Download Template ▼] [Import Data] [Export ▼]│  │
│ └─────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### Each Stakeholder Gets:
- **Their own color theme**
- **Role-specific icon**
- **Role-specific statistics**
- **8-panel structure** (same as Super Admin)
- **Import/export in each panel**
- **Only THEIR data** (RLS enforced)

---

## 🎯 Success Criteria

After testing each role, you should confirm:

- [ ] All 8 dashboards load correctly
- [ ] Each has the right theme/icon/name
- [ ] Import/export toolbar visible in all panels
- [ ] Templates download successfully
- [ ] Templates have professional 5-row structure
- [ ] Role-specific data isolation works
- [ ] Super admin sees all data
- [ ] Individual users have import/export in My Devices

---

## 📞 Report Your Findings

After testing, tell me:

**1. Which roles did you test?**
- [ ] Super Admin
- [ ] Retailer
- [ ] Repair Shop
- [ ] Insurance
- [ ] Law Enforcement
- [ ] NGO
- [ ] Individual User

**2. What worked?**
- Dashboard loaded? ✅ or ❌
- Toolbar visible? ✅ or ❌
- Template download? ✅ or ❌
- Template structure correct? ✅ or ❌

**3. Any issues?**
- Errors in console?
- Missing features?
- Incorrect data?

---

## 🚀 START TESTING NOW

**Quick Test Flow**:

1. **Test Super Admin** first: http://localhost:8081/admin
2. **Create a retailer test account** via registration
3. **Login as retailer** → Auto-redirects to `/retailer-admin`
4. **Explore the 8 panels**
5. **Download a template**
6. **Report results**!

**Your server is running**: http://localhost:8081

**Let me know what you find!** 🎉

