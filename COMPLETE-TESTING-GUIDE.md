# Complete Testing Guide - All Features

## 🧪 COMPREHENSIVE TESTING CHECKLIST

This guide will help you test ALL the improvements we've made to ensure everything works correctly.

---

## **📋 PRE-TESTING SETUP:**

### **1. Restart Development Server** (IMPORTANT!)

Since we updated `vite.config.ts` (proxy routes), you MUST restart the dev server:

```bash
# In your terminal:
# 1. Stop the current dev server
Press: Ctrl+C (Windows/Linux) or Cmd+C (Mac)

# 2. Start it again
npm run dev

# 3. Wait for the "ready" message
# Should show: "VITE vX.X.X  ready in XXX ms"

# 4. Note the URL (usually http://localhost:8080)
```

### **2. Clear Browser Cache** (Recommended)

```
Hard refresh to ensure you see latest code:
- Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Firefox: Ctrl+Shift+Delete → Clear cache
- Safari: Cmd+Option+E
```

### **3. Open Browser Console** (For Debugging)

```
Press F12 or:
- Chrome: Ctrl+Shift+J (Windows) or Cmd+Option+J (Mac)
- Keep it open to see logs and errors
```

---

## **✅ TEST 1: REGISTRATION FORM IMPROVEMENTS**

### **What to Test:**
- Responsive grid layout
- Auto-fill Device Nickname
- Color dropdown
- Screen size dropdown with latest devices
- Battery health dropdown
- Processor dropdown with latest chips
- New ownership fields

### **Steps:**

1. **Navigate to Registration:**
   ```
   URL: http://localhost:8080/device/register
   ```

2. **Check Responsive Layout:**
   - **On Desktop**: Open browser, make it wide
     - ✅ Should see 2 columns for most fields
     - ✅ Should see 3 columns for Color/Storage/RAM
   - **On Tablet**: Resize browser to ~800px width
     - ✅ Should see 2 columns
   - **On Mobile**: Resize to ~400px width
     - ✅ Should see 1 column (stacked)

3. **Test Auto-Fill Device Nickname:**
   - Select **Brand**: "Apple"
   - **Expected**: Device Nickname auto-fills to "Apple Device"
   - Type **Model**: "iPhone 8 Plus"
   - **Expected**: Device Nickname updates to "Apple iPhone 8 Plus"
   - **Try customizing**: Change to "My iPhone"
   - **Expected**: Saves your custom name

4. **Test Color Dropdown:**
   - Click **Color** field
   - **Expected**: Dropdown shows 13+ color options
   - **Check for**: Space Gray, Silver, Gold, Midnight, Natural Titanium, Green, etc.
   - Select "Green"
   - **Expected**: Field shows "Green"

5. **Test Screen Size Dropdown:**
   - Click **Screen Size** field
   - **Expected**: Dropdown shows screen sizes with device examples
   - **Check for latest**: 
     - ✅ "6.9\" - iPhone 16 Pro Max (2024)"
     - ✅ "6.9\" - Samsung S26 Ultra (2026)"
     - ✅ "6.8\" - Samsung S24/S25 Ultra"
   - **Check for your device**: "5.5\" - iPhone 8 Plus, 7 Plus"
   - Select "5.5"
   - **Expected**: Field shows "5.5\" - iPhone 8 Plus, 7 Plus"

6. **Test Battery Health Dropdown:**
   - Click **Battery Health** field
   - **Expected**: Dropdown shows ranges with condition labels
   - **Check for**:
     - "100% - Brand New"
     - "95-99% - Excellent"
     - "90-94% - Very Good"
   - Select "90-94% - Very Good"
   - **Expected**: Saves as "90"

7. **Test Processor Dropdown:**
   - Click **Processor** field
   - **Expected**: Dropdown shows latest processors
   - **Check for latest**:
     - ✅ "Apple A18 Pro (iPhone 16 Pro, 2024)"
     - ✅ "Snapdragon 8 Elite (S25, 2025)"
     - ✅ "Exynos 2500 (S26, 2026)"
   - **Check for your device**: "A11 Bionic (iPhone 8/X, 2017)"
   - Select "A11 Bionic"
   - **Expected**: Field shows full label

8. **Test New Ownership Fields:**
   - Scroll down to see:
     - ✅ "Where did you get this device?"
     - ✅ "How did you acquire it?" (dropdown)
     - ✅ "Previous Owner (if applicable)"
   - Fill in:
     - Origin: "Apple Store Sandton"
     - Method: Select "Purchase"
     - Previous Owner: Leave empty
   - **Expected**: All fields save correctly

9. **Test Helpful Tooltips:**
   - **Check for helper text under fields:**
     - ✅ IMEI: "Dial *#06# to find IMEI"
     - ✅ RAM: "Check Settings → About"
     - ✅ Processor: "iPhone 8 Plus: A11 Bionic"
     - ✅ Screen: "Check device box or Apple/Samsung website"
     - ✅ Battery: "iPhone: Settings → Battery → Battery Health"

10. **Complete Registration:**
    - Fill ALL required fields (marked with *)
    - Upload at least 1 photo
    - Click "Next" through all 4 steps
    - On Step 4, click "Register Device"
    - **Expected**: 
      - Success message: "Device Registered Successfully!"
      - Redirects to My Devices page
      - Console shows: "✅ Device registered: {id}"

---

## **✅ TEST 2: MY DEVICES PAGE CONNECTION**

### **What to Test:**
- Page loads real data from database
- Shows your registered device
- Edit button is visible

### **Steps:**

1. **Navigate to My Devices:**
   ```
   URL: http://localhost:8080/my-devices
   Or click "My Devices" in navigation
   ```

2. **Check Console for API Call:**
   - **Expected logs**:
     - "🔍 Fetching user devices..."
     - "📊 Raw API Response: {success: true, devices: [...]}"
     - "✅ Transformed device 1: {...}"

3. **Verify Device Card Shows Real Data:**
   - **Check for**:
     - ✅ Device name: "Apple iPhone 8 Plus" (or your custom name)
     - ✅ Brand: "Apple"
     - ✅ Color: "Green"
     - ✅ Storage: "256GB"
     - ✅ Serial number (partially hidden)
     - ✅ Photos count
     - ✅ Transfer count

4. **Check Action Buttons:**
   - **Expected buttons**:
     - ✅ [View] (eye icon)
     - ✅ [Edit] (pencil icon) ← NEW!
     - ✅ [Sell] (if status is active)
     - ✅ [Transfer]
     - ✅ [Repair]

5. **Test Edit Button:**
   - Click **"Edit"** button on your device
   - **Expected**: Navigates to `/device/{id}/edit`
   - **Expected**: Form loads with 4 steps
   - **Expected**: All existing data is pre-filled
   - Click "Cancel" to return

---

## **✅ TEST 3: EDIT DEVICE FEATURE**

### **What to Test:**
- Edit page loads device data
- 4-step form with pre-filled data
- Can update all fields
- Saves to database

### **Steps:**

1. **Access Edit Device:**
   - From My Devices, click "Edit" on your iPhone 8 Plus
   - **OR** from Device Details page, click "Edit Device" (top right)
   - **Expected**: Opens `/device/30e1752a-afda-4cbd-bd00-b0c90cad077a/edit`

2. **Verify Step 1 Pre-Filled:**
   - **Check ALL fields are pre-filled**:
     - ✅ Device Nickname: "iPhone 8plus" or "Apple iPhone 8 Plus"
     - ✅ Brand: "Apple"
     - ✅ Model: "iPhone 8 Plus"
     - ✅ Serial: (disabled, can't change)
     - ✅ Color: "Green"
     - ✅ Storage: "256GB"
     - ✅ Other fields: NULL or empty (as expected)

3. **Fill in Missing Fields:**
   - **RAM**: Select "3GB"
   - **Processor**: Select "A11 Bionic (iPhone 8/X, 2017)"
   - **Screen Size**: Select "5.5\" - iPhone 8 Plus, 7 Plus"
   - **Battery Health**: Select "90-94% - Very Good"
   - **Device Origin**: Type "Apple Store Sandton"
   - **Acquisition Method**: Select "Purchase"
   - Click **"Next"**

4. **Step 2 - Documents:**
   - **Expected**: Shows existing photos (if any)
   - Can upload new photos or keep existing
   - Click **"Next"**

5. **Step 3 - Purchase Info:**
   - **Expected**: Shows existing purchase data
   - Can update if needed
   - Click **"Next"**

6. **Step 4 - Review:**
   - **Expected**: Shows summary of ALL changes
   - **Verify**:
     - RAM: 3GB
     - Processor: A11 Bionic
     - Screen: 5.5"
     - Battery: 90%
   - Click **"Save Changes"**

7. **Verify Success:**
   - **Expected**: Toast message "Device Updated Successfully!"
   - **Expected**: Redirects to `/my-devices`
   - **Expected**: Console shows success

8. **Check Database Updated:**
   - Go to Supabase Dashboard
   - SQL Editor → Run:
     ```sql
     SELECT 
       device_name, brand, model, color, storage_capacity,
       ram_gb, processor, screen_size_inch, battery_health_percentage
     FROM devices
     WHERE id = '30e1752a-afda-4cbd-bd00-b0c90cad077a';
     ```
   - **Expected**:
     - ram_gb: 3
     - processor: "A11 Bionic"
     - screen_size_inch: 5.5
     - battery_health_percentage: 90

---

## **✅ TEST 4: MARKETPLACE LISTING**

### **What to Test:**
- Can create listing with complete data
- Listing shows on marketplace
- Product Detail page shows all real data

### **Steps:**

1. **Create Listing:**
   - Go to My Devices
   - Click **"Sell"** on your iPhone 8 Plus (or click "+" bottom nav → List My Device)
   - **Expected**: Shows `/list-my-device` with your device pre-selected
   - Fill in:
     - Title: "iPhone 8 Plus 256GB - Excellent Condition"
     - Description: "Well maintained, complete with box"
     - Price: 5999
     - Condition: "Good"
   - Click **"Publish Listing"**

2. **Verify Listing Created:**
   - **Expected**: Success message
   - **Expected**: Console shows: "✅ Listing created successfully"

3. **Check Marketplace:**
   - Navigate to `/marketplace`
   - **Expected**: Your listing appears
   - **Check for**:
     - ✅ Title: "iPhone 8 Plus 256GB..."
     - ✅ Price: "ZAR 5,999"
     - ✅ Image (if uploaded)
     - ✅ Condition badge

4. **Open Product Detail Page:**
   - Click on your listing
   - **Expected**: Opens `/marketplace/product/{listing-id}`

5. **Verify ALL Tabs Show Real Data:**

   **Main Info:**
   - ✅ Title: "iPhone 8 Plus 256GB - Excellent Condition"
   - ✅ Price: "ZAR 5,999"
   - ✅ Condition: "Clean" badge
   - ✅ Warranty: "X months" (if set)
   - ✅ Location: Real location

   **Seller Info:**
   - ✅ Name: YOUR real name (not "Unknown Seller")
   - ✅ Avatar: First letter of your name
   - ✅ Rating: "0" (new seller) or real rating
   - ✅ Verification: Shows status

   **Details Tab:**
   - ✅ Brand: "Apple"
   - ✅ Model: "iPhone 8 Plus"
   - ✅ Serial Status: "Clean"
   - ✅ Color: "Green"
   - ✅ Storage: "256GB"
   - ✅ RAM: "3GB" ← Should show now!
   - ✅ Processor: "A11 Bionic" ← Should show now!
   - ✅ Screen Size: "5.5\"" ← Should show now!
   - ✅ Battery Health: "90%" ← Should show now!

   **Ownership Tab:**
   - ✅ Record 1: Your name
   - ✅ From: "Apple Store Sandton" ← Should show now!
   - ✅ Date: Registration date
   - ✅ Method: "purchase" ← Should show now!
   - ✅ Blockchain TX: Real hash
   - ✅ Verified badge

   **Verification Tab:**
   - ✅ Shows verification record
   - ✅ Method: "BLOCKCHAIN_ANCHOR"
   - ✅ Verifier: "STOLEN Platform"
   - ✅ Confidence: 95%+
   - ✅ Timestamp: Registration date

   **Risk Analysis Tab:**
   - ✅ Status: "No Risk Factors Detected"
   - ✅ Risk Score: "100/100" or "0/100"
   - ✅ Assessment Date: Real date
   - ✅ Data Source: "STOLEN Platform Risk Assessment Engine"

   **Certificates Tab:**
   - ✅ Warranty Certificate (if warranty set)
   - ✅ Authenticity Certificate
   - ✅ View/Download buttons work

   **Repairs Tab:**
   - ✅ Shows "No repair history available" (expected for new device)

6. **Test Action Buttons:**
   - **Buy Now (Escrow)**: Click → Should go to `/checkout/{id}?escrow=true`
   - **Add to Cart**: Click → Should add to cart
   - **Quick Request**: Click → Should go to `/hot-buyer-request`
   - **Preview Ownership Proof**: Click → Opens dialog with blockchain data
   - **View on Etherscan**: Click → Opens Etherscan in new tab
   - **Download Certificate**: Click → Downloads blockchain certificate
   - **Contact Seller**: Click → Goes to `/seller/{id}/contact`
   - **View Seller Profile**: Click → Goes to `/seller/{id}`

---

## **✅ TEST 5: ADMIN PANEL**

### **What to Test:**
- Admin can see pending listings
- Can approve/reject listings
- Shows real seller data

### **Steps:**

1. **Navigate to Admin Dashboard:**
   ```
   URL: http://localhost:8080/admin/dashboard
   ```

2. **Go to Marketplace Tab:**
   - Click **"Marketplace"** tab

3. **Verify Listing Appears:**
   - **Expected**: Your listing shows in pending/active section
   - **Check for**:
     - ✅ Device name
     - ✅ Brand: "Apple"
     - ✅ Model: "iPhone 8 Plus"
     - ✅ Price: "ZAR 5,999"
     - ✅ Seller: YOUR name (not "Unknown")
     - ✅ Status badge

4. **Check Console:**
   - **Expected logs**:
     - "🔍 Fetching listings for admin review..."
     - "✅ Fetched X listings"
   - **Should NOT see**:
     - ❌ "401 Unauthorized"
     - ❌ "TypeError: user?.getIdToken is not a function"

---

## **✅ TEST 6: DATABASE VERIFICATION**

### **What to Test:**
- All 7 database records were created
- Data is correctly stored

### **Steps:**

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn
   ```

2. **SQL Editor → Run These Queries:**

   **A. Check Device Record:**
   ```sql
   SELECT 
     id, device_name, brand, model, color, storage_capacity,
     ram_gb, processor, screen_size_inch, battery_health_percentage,
     device_condition, blockchain_hash, trust_score
   FROM devices
   WHERE current_owner_id = 'YOUR_USER_ID'
   ORDER BY created_at DESC
   LIMIT 1;
   ```
   **Expected**:
   - ✅ All fields populated (no NULLs for fields you filled)
   - ✅ ram_gb: 3
   - ✅ processor: "A11 Bionic"
   - ✅ screen_size_inch: 5.5
   - ✅ battery_health_percentage: 90

   **B. Check Ownership History:**
   ```sql
   SELECT 
     owner_id, transfer_from_entity, transfer_method, 
     transfer_date, verification_status, blockchain_tx_id
   FROM device_ownership_history
   WHERE device_id = 'YOUR_DEVICE_ID'
   ORDER BY transfer_date DESC;
   ```
   **Expected**:
   - ✅ At least 1 record
   - ✅ transfer_from_entity: "Apple Store Sandton" (your input)
   - ✅ transfer_method: "purchase"
   - ✅ verification_status: "verified"
   - ✅ blockchain_tx_id: Real hash

   **C. Check Verifications:**
   ```sql
   SELECT 
     verification_method, verifier_name, confidence_score,
     status, verification_timestamp
   FROM device_verifications
   WHERE device_id = 'YOUR_DEVICE_ID';
   ```
   **Expected**:
   - ✅ At least 1 record
   - ✅ verification_method: "BLOCKCHAIN_ANCHOR"
   - ✅ verifier_name: "STOLEN Platform"
   - ✅ confidence_score: 95 or higher
   - ✅ status: "verified"

   **D. Check Risk Assessment:**
   ```sql
   SELECT 
     risk_score, risk_status, risk_factors, 
     assessment_date, assessed_by
   FROM device_risk_assessment
   WHERE device_id = 'YOUR_DEVICE_ID'
   AND is_active = true;
   ```
   **Expected**:
   - ✅ 1 record
   - ✅ risk_score: 100 (clean)
   - ✅ risk_status: "clean"
   - ✅ risk_factors: [] (empty array)
   - ✅ assessed_by: "System - Initial Registration"

   **E. Check Certificates:**
   ```sql
   SELECT 
     certificate_type, issuer, issue_date, expiry_date,
     verification_status, is_active
   FROM device_certificates
   WHERE device_id = 'YOUR_DEVICE_ID'
   AND is_active = true;
   ```
   **Expected**:
   - ✅ 2 records: "warranty" and "authenticity"
   - ✅ Warranty: issuer = "Apple", has expiry_date
   - ✅ Authenticity: issuer = "STOLEN Platform"
   - ✅ Both: verification_status = "verified"

   **F. Check Seller Profile:**
   ```sql
   SELECT 
     user_id, full_name, rating, total_sales,
     verification_status, is_premium
   FROM seller_profiles
   WHERE user_id = 'YOUR_USER_ID';
   ```
   **Expected**:
   - ✅ 1 record
   - ✅ full_name: Your real name
   - ✅ rating: 0 (new seller)
   - ✅ total_sales: 0
   - ✅ verification_status: "pending"

   **G. Check Marketplace Listing:**
   ```sql
   SELECT 
     ml.id, ml.title, ml.price, ml.status, ml.device_id,
     d.brand, d.model, d.color, d.storage_capacity,
     d.ram_gb, d.processor, d.screen_size_inch
   FROM marketplace_listings ml
   LEFT JOIN devices d ON ml.device_id = d.id
   WHERE ml.device_id = 'YOUR_DEVICE_ID';
   ```
   **Expected**:
   - ✅ 1 record (if you created a listing)
   - ✅ All device fields populated (no NULLs)
   - ✅ status: "active" or "pending"

---

## **✅ TEST 7: PRODUCT DETAIL PAGE (COMPREHENSIVE)**

### **What to Test:**
- NO "Unknown" values
- All tabs show real data
- All buttons work
- Seller info is real

### **Steps:**

1. **Open Your Listing:**
   - From Marketplace, click your listing
   - **OR** directly: `/marketplace/product/{listing-id}`

2. **Console Check:**
   - **Expected logs**:
     - "🔍 Fetching listing details for ID: {id}"
     - "✅ Real listing data loaded: {...}"
     - "🔍 Trust Score: X"
     - "🔍 Seller Data: {name, rating, ...}"
     - "🔍 Ownership History: [{...}]"
     - "🔍 Verifications: [{...}]"

3. **Verify NO "Unknown" Values:**
   - **Check Details Tab**:
     - Brand: Should say "Apple" NOT "Unknown"
     - Model: Should say "iPhone 8 Plus" NOT "Unknown"
     - Color: Should say "Green" NOT "Unknown"
     - Storage: Should say "256GB" NOT "Unknown"
     - RAM: Should say "3GB" NOT "Unknown" or missing
     - Processor: Should say "A11 Bionic" NOT missing
     - Screen: Should say "5.5\"" NOT missing
     - Battery: Should say "90%" NOT missing

4. **Verify Seller Info:**
   - Name: Should show YOUR name NOT "Unknown Seller" or "TechDeals Pro"
   - Avatar: Should show YOUR first letter
   - Rating: Should show real rating (0 for new seller)
   - Verification: Should show real status

5. **Verify Ownership History:**
   - Should show 1 record with:
     - ✅ Owner: YOUR name (not "John Doe")
     - ✅ From: "Apple Store Sandton" (your input, not "Apple Store")
     - ✅ Method: "purchase" (your selection)
     - ✅ Date: Real date (not mock date)
     - ✅ Blockchain TX: Real hash
     - ✅ Verified badge

---

## **🔍 COMMON ISSUES & SOLUTIONS:**

### **Issue 1: Fields Still Show "Unknown"**
**Solution:**
- Check if you filled the field during edit
- Check database (SQL query above)
- Check console for API response

### **Issue 2: Can't See New Fields**
**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Restart dev server
- Clear browser cache

### **Issue 3: "401 Unauthorized" Errors**
**Solution:**
- Log out and log back in
- Check auth token in console
- Verify Supabase connection

### **Issue 4: Ownership History Empty**
**Solution:**
- Check device_ownership_history table in database
- Verify register-device function created the record
- Check edge function logs in Supabase

### **Issue 5: Certificates Missing**
**Solution:**
- Check device_certificates table
- Verify register-device function created certificate records
- Upload warranty document if missing

---

## **📊 TESTING CHECKLIST:**

### **Registration Form:**
- [ ] Dev server restarted
- [ ] Form shows responsive grid (2-3 columns on desktop)
- [ ] Device Nickname auto-fills from Brand + Model
- [ ] Color dropdown shows 13+ colors
- [ ] Screen size dropdown shows iPhone 16, S26 Ultra
- [ ] Battery health dropdown shows condition labels
- [ ] Processor dropdown shows A18 Pro, Snapdragon 8 Elite, Exynos 2500
- [ ] New ownership fields visible (Origin, Method, Previous Owner)
- [ ] All tooltips show helpful text
- [ ] Registration completes successfully

### **My Devices Page:**
- [ ] Shows real device data
- [ ] "Edit" button visible
- [ ] Console shows API success
- [ ] No errors in console

### **Edit Device:**
- [ ] Opens with 4-step form
- [ ] Pre-fills all existing data
- [ ] Can update all fields
- [ ] Saves successfully
- [ ] Database updates confirmed

### **Product Detail Page:**
- [ ] NO "Unknown" values in Details tab
- [ ] Seller shows YOUR name (not "Unknown")
- [ ] Ownership History shows YOUR data (not "John Doe")
- [ ] All specs show (RAM, Processor, Screen, Battery)
- [ ] Certificates tab shows warranty + authenticity
- [ ] All buttons work
- [ ] Console shows real data (no mock fallbacks)

### **Database:**
- [ ] devices table has all your data
- [ ] device_ownership_history has 1+ records
- [ ] device_verifications has 1+ records
- [ ] device_risk_assessment has 1 record
- [ ] device_certificates has 2 records
- [ ] seller_profiles has 1 record
- [ ] marketplace_listings has 1 record (if created)

---

## **🎯 EXPECTED FINAL STATE:**

After all tests pass:

✅ Registration form is modern, responsive, easy to use
✅ My Devices shows real data with Edit button
✅ Edit Device works with 4-step form
✅ Product Detail page shows 100% real data (no "Unknown")
✅ Seller info is real (your name, not mock)
✅ Ownership history is real (your data, not "John Doe")
✅ All 7 database tables populated
✅ All buttons and routes work
✅ Admin panel shows listings
✅ Marketplace shows listings

**NO MOCK DATA! NO "UNKNOWN" VALUES! EVERYTHING REAL AND CONNECTED!** 🎉

---

## **📝 REPORT RESULTS:**

After testing, please report:
1. ✅ What works correctly
2. ❌ What still shows "Unknown" or errors
3. 📊 Console logs (if any errors)
4. 🗄️ Database query results (to verify data)

**This will help me fix any remaining issues!** 🚀

