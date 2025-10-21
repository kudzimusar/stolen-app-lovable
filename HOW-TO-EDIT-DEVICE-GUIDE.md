# How to Edit Your Device - Complete Guide

## 📍 ACCESS POINTS FOR "EDIT DEVICE"

### **METHOD 1: From My Devices Page (Recommended)**

#### Step-by-Step:

1. **Navigate to My Devices**
   - Click "My Devices" in the navigation menu
   - Or go to: `http://localhost:8080/my-devices`

2. **Find Your Device**
   - Look for your device card (e.g., "iPhone 8 Plus")
   - You'll see device information displayed

3. **Click the "Edit" Button**
   - Location: On each device card
   - Position: Next to the "View" button (in the bottom action buttons)
   - Icon: Pencil icon (✏️)
   - Label: "Edit"

4. **Edit Page Opens**
   - URL: `/device/{your-device-id}/edit`
   - Pre-filled with current device data
   - All fields are editable

5. **Update Fields**
   - Fill in missing fields (RAM, Processor, Screen Size, Battery Health, etc.)
   - Update existing fields if needed

6. **Save Changes**
   - Click "Save Changes" button at the bottom
   - Success message appears
   - Redirects back to My Devices page

---

### **METHOD 2: Direct URL (If You Know Device ID)**

If you know your device ID, you can go directly to:
```
http://localhost:8080/device/{device-id}/edit
```

For example:
```
http://localhost:8080/device/30e1752a-afda-4cbd-bd00-b0c90cad077a/edit
```

---

## 🎨 VISUAL LAYOUT:

### **My Devices Page Layout:**

```
┌─────────────────────────────────────────────┐
│  My Devices                                 │
│  ┌───────────────────────────────────────┐ │
│  │ iPhone 8 Plus                         │ │
│  │ Apple • Green                         │ │
│  │ 256GB • Serial: ABC123                │ │
│  │                                       │ │
│  │ ┌──────────┐  ┌──────────┐          │ │
│  │ │   View   │  │   Edit   │  ← HERE! │ │
│  │ │  (Eye)   │  │ (Pencil) │          │ │
│  │ └──────────┘  └──────────┘          │ │
│  │                                       │ │
│  │ ┌──────────┐  ┌──────────┐          │ │
│  │ │   Sell   │  │ Transfer │          │ │
│  │ └──────────┘  └──────────┘          │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 📝 EDIT DEVICE PAGE SECTIONS:

### **1. Basic Information**
- Device Name
- Brand
- Model
- Color

### **2. Technical Specifications**
- Storage Capacity (dropdown)
- RAM (dropdown)
- Processor (dropdown)
- Screen Size (input)
- Battery Health (input)
- Device Condition (dropdown)

### **3. Purchase Information**
- Warranty Remaining (months)
- Purchase Date
- Purchase Price

### **4. Action Buttons**
- "Save Changes" - Saves updates to database
- "Cancel" - Returns to My Devices without saving

---

## 🔍 HOW TO FIND YOUR DEVICE ID:

If you need the device ID for direct URL access:

### **Method A: From Browser URL**
1. Go to My Devices
2. Click "View" on your device
3. Look at URL: `/device/{THIS-IS-YOUR-ID}`
4. Copy the ID

### **Method B: From Console**
1. Go to My Devices page
2. Open browser console (F12)
3. Look for console logs showing device data
4. Find the `id` field

### **Method C: From Database (Supabase)**
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run:
   ```sql
   SELECT id, device_name FROM devices 
   WHERE current_owner_id = 'your-user-id';
   ```

---

## 🎯 EXAMPLE WORKFLOW:

### **Editing Your iPhone 8 Plus:**

1. **Start**: Go to My Devices page
   ```
   http://localhost:8080/my-devices
   ```

2. **Find**: Locate your iPhone 8 Plus card

3. **Click**: "Edit" button (with pencil icon)

4. **Edit Page Opens**: 
   ```
   http://localhost:8080/device/30e1752a-afda-4cbd-bd00-b0c90cad077a/edit
   ```

5. **Update Fields**:
   - Model: "iPhone 8 Plus" ✓ (already correct)
   - Color: "Green" ✓ (already correct)
   - Storage: "256GB" ✓ (already correct)
   - **RAM: Select "3GB"** ← Add this
   - **Processor: Select "A11 Bionic"** ← Add this
   - **Screen Size: Enter "5.5"** ← Add this
   - **Battery Health: Enter "90"** ← Add this (check your actual battery health)
   - Device Condition: Select "Good" or current condition

6. **Save**: Click "Save Changes" button

7. **Success**: Toast notification appears, redirects to My Devices

8. **Verify**: 
   - Check Product Detail page
   - All fields should now show real data
   - No more "Unknown" values!

---

## 🚀 QUICK ACCESS CHECKLIST:

- [ ] Restart dev server (if you just applied the proxy fix)
- [ ] Navigate to My Devices page
- [ ] Find your device card
- [ ] Look for "Edit" button (next to "View")
- [ ] Click "Edit" button
- [ ] Edit page opens with pre-filled data
- [ ] Update missing fields
- [ ] Click "Save Changes"
- [ ] Success! Device updated

---

## 🔐 SECURITY NOTE:

The Edit Device feature is **protected**:
- ✅ Requires authentication (must be logged in)
- ✅ Validates ownership (can only edit your own devices)
- ✅ Prevents editing other users' devices
- ✅ Checks device ownership before loading
- ✅ Checks device ownership before saving

If you try to edit someone else's device:
- Error message: "This device doesn't exist or you don't have permission to edit it"
- Redirects to My Devices page

---

## 🎉 RESULT:

After editing and saving:
- ✅ Database is updated with new values
- ✅ My Devices page shows updated info
- ✅ Product Detail page shows complete data
- ✅ Marketplace listing (if created) shows complete data
- ✅ No more "Unknown" values!

**Your device now has complete, accurate specifications!** 🎊

