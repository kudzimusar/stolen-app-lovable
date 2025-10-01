# 🧪 Lost and Found Feature - Complete Testing Guide

## ⚠️ IMPORTANT: Old vs New Reports

### **The Problem with Existing Reports:**
Your current 2 reports in the database were submitted with **blob URLs** that have **expired**. This is why:
- ❌ Photos show: `blob:http://localhost:8080/...` → **EXPIRED**
- ❌ Documents show: `blob:http://localhost:8080/...` → **EXPIRED**
- ❌ Images fail to load
- ❌ "ERR_FILE_NOT_FOUND" errors

### **The Solution:**
✅ **Submit a NEW report** with the updated code  
✅ **Photos/Documents will upload to Supabase Storage**  
✅ **Get permanent URLs**: `https://...supabase.co/storage/...`  
✅ **Never expire**

---

## 🚀 Step-by-Step Testing Process

### **STEP 1: Create Storage Bucket** 
**Status:** ✅ Already done (you ran `create-storage-bucket.sql`)

### **STEP 2: Submit a NEW Report**

1. **Go to:** `http://localhost:8080/lost-found-report`
2. **Fill in device info:**
   - Device name: "Samsung Galaxy S23"
   - Serial: "ABC123456"
   - Description: "Black phone with purple case"
   
3. **Select location:**
   - Click on map OR
   - Search for "Sandton"
   - **Verify**: Green "Location Selected" box appears

4. **Upload photos:**
   - Click "Choose" or "Camera"
   - Select 2-3 photos
   - **Watch console**: Should see:
     ```
     📤 Uploading to Supabase Storage: lost-found/...
     ✅ File uploaded, public URL: https://lerjhxchglztvhbsdjjn.supabase.co/...
     ```

5. **Upload documents:**
   - Click "Choose File" under "Additional Documents"
   - Select a PDF or image
   - **Watch console**: Should see same upload messages

6. **Enter contact:**
   - Type your email: "test@example.com"
   - Check "Post to public community board"

7. **Submit:**
   - Click "Report Lost Device"
   - **Watch console** for:
     ```
     📋 Report data being sent: {
       photosCount: 2,
       documentsCount: 1,
       contact: "test@example.com"
     }
     ✅ Report submitted successfully! ID: xxx-xxx-xxx
     ```

---

### **STEP 3: Verify on Community Board**

1. **Auto-redirects** to `/community-board`
2. **Should see:**
   - ✅ Your new report listed
   - ✅ Device name: "Samsung Galaxy S23"
   - ✅ Time: "Just now"
   - ✅ Location: "Sandton..."
   - ✅ Reporter: Your username

3. **Quick Stats should show:**
   - Lost: 3 (2 old + 1 new)
   - Found: 0
   - Reunited: 0

---

### **STEP 4: Test "View Details"**

1. **Click "View Details"** on your NEW report
2. **Check console:**
   ```
   📋 Raw data from API: {
     contact_preferences: { method: "test@example.com", public: true },
     photos: ["https://...supabase.co/storage/..."],
     documents: ["https://...supabase.co/storage/..."],
     device_model: "Samsung Galaxy S23"
   }
   ```

3. **Page should show:**
   - ✅ Device: "Samsung Galaxy S23"
   - ✅ Description: "Black phone with purple case"
   - ✅ Location: Full address from map
   - ✅ Time: "Just now"
   - ✅ Reporter: Your name
   - ✅ Contact: "test@example.com" ← **NOT "Not specified"**
   - ✅ **Photos section** with clickable images
   - ✅ **Documents section** with "View" buttons

---

### **STEP 5: Test "I Found This!"**

1. **Click "I found this!"** button
2. **Should show:**
   - ✅ Device summary at top with REAL data
   - ✅ Contact form to reach owner
   - ✅ All fields populated correctly

---

### **STEP 6: Test Community Rewards**

1. **Go to:** `http://localhost:8080/community-rewards`
2. **Should show:**
   - ✅ Page loads (not "Page Not Found")
   - ✅ Rewards dashboard
   - ✅ Connected to Lost & Found achievements

---

## 🔧 Troubleshooting

### **If Photos Still Don't Show:**

**Check console for:**
```
📤 Uploading to Supabase Storage: ...
```

**If you DON'T see this:**
- Storage upload failed
- Check Supabase Storage bucket exists
- Check RLS policies allow uploads

**If you see:**
```
Upload error: { message: "Bucket not found" }
```
- Run `create-storage-bucket.sql` again
- Or create bucket manually in Supabase Dashboard

---

### **If Contact Shows "Not specified":**

**In console, expand this object:**
```
📋 Raw data from API: {
  contact_preferences: ???  ← What does this show?
}
```

**Possible values:**
- `null` → Field not in database
- `{}` → Empty object
- `{ method: "email@example.com" }` → Correct!

---

## ✅ Expected Final Result

### **For a NEWLY submitted report:**

**View Details Page:**
- ✅ Full device information
- ✅ Your contact email/phone displayed
- ✅ 2-3 photos in a grid, all clickable
- ✅ Documents with "View" buttons that work
- ✅ Time shows "Just now"
- ✅ Location shows exact address

**Community Board:**
- ✅ Shows 3 total reports
- ✅ Quick Stats: Lost (3), Found (0)
- ✅ Filter tabs work correctly

**Community Rewards:**
- ✅ Page loads without errors
- ✅ Shows reward tracking
- ✅ Connected to Lost & Found achievements

---

## 🎉 Success Criteria

You'll know it's working when:
1. ✅ Console shows Supabase Storage URLs (not blob URLs)
2. ✅ Photos load and are clickable
3. ✅ Documents have working "View" buttons
4. ✅ Contact shows your actual email
5. ✅ All 3 detail pages show real data
6. ✅ Community Rewards page loads

---

**Submit one NEW test report and verify all the above!** 🚀
