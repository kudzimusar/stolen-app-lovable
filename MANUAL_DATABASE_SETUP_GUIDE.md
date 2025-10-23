# 🔧 Manual Database Setup Guide

## ⚠️ **IMPORTANT: Run ONE command at a time in Supabase SQL Editor**

This prevents "column does not exist" errors by ensuring each column is created before being used.

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Open Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### **Step 2: Add Columns One by One**

**Run each command separately and wait for it to complete before moving to the next:**

#### **Command 1: Add feature_category column**
```sql
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS feature_category VARCHAR(30) DEFAULT 'lost_found';
```
✅ **Expected Result**: "Success. No rows returned"

#### **Command 2: Add feature_data column**
```sql
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS feature_data JSONB DEFAULT '{}';
```
✅ **Expected Result**: "Success. No rows returned"

#### **Command 3: Add priority_level column**
```sql
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10);
```
✅ **Expected Result**: "Success. No rows returned"

#### **Command 4: Add action_link column**
```sql
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS action_link VARCHAR(500);
```
✅ **Expected Result**: "Success. No rows returned"

#### **Command 5: Add expires_at column**
```sql
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
```
✅ **Expected Result**: "Success. No rows returned"

### **Step 3: Verify Columns Were Created**

**Run this verification query:**
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at')
ORDER BY column_name;
```

✅ **Expected Result**: You should see 5 rows with the new columns listed.

### **Step 4: Create Indexes**

**Run each index creation command separately:**

#### **Command 6: Create feature index**
```sql
CREATE INDEX IF NOT EXISTS idx_user_notifications_feature ON user_notifications(feature_category);
```

#### **Command 7: Create user+feature index**
```sql
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_feature ON user_notifications(user_id, feature_category);
```

#### **Command 8: Create priority index**
```sql
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON user_notifications(priority_level);
```

#### **Command 9: Create expires index**
```sql
CREATE INDEX IF NOT EXISTS idx_user_notifications_expires ON user_notifications(expires_at);
```

### **Step 5: Update Existing Data**

**Only run this AFTER all columns exist:**
```sql
UPDATE user_notifications 
SET feature_category = 'lost_found' 
WHERE feature_category IS NULL OR feature_category = 'lost_found';
```

### **Step 6: Verify the Update**

**Run this to check the update worked:**
```sql
SELECT feature_category, COUNT(*) as count
FROM user_notifications 
GROUP BY feature_category;
```

✅ **Expected Result**: You should see rows with `feature_category = 'lost_found'` and their counts.

---

## 🚨 **Troubleshooting**

### **If you get "column does not exist" error:**

1. **Check if the column was actually created:**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'user_notifications' 
   AND column_name = 'feature_category';
   ```

2. **If the column doesn't exist, run the ALTER TABLE command again:**
   ```sql
   ALTER TABLE user_notifications 
   ADD COLUMN IF NOT EXISTS feature_category VARCHAR(30) DEFAULT 'lost_found';
   ```

3. **If you get a constraint error, the column might exist but with different constraints:**
   ```sql
   -- Check existing constraints
   SELECT column_name, data_type, column_default, is_nullable
   FROM information_schema.columns 
   WHERE table_name = 'user_notifications' 
   AND column_name = 'feature_category';
   ```

### **If you get "relation does not exist" error:**

The `user_notifications` table might not exist. Check:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_notifications';
```

If the table doesn't exist, you need to create it first or check if it has a different name.

---

## ✅ **Success Verification**

After completing all steps, run this final verification:

```sql
-- Check all new columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at');

-- Check indexes were created
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'user_notifications' 
AND indexname LIKE 'idx_user_notifications_%';

-- Check data was updated
SELECT feature_category, COUNT(*) as count
FROM user_notifications 
GROUP BY feature_category;
```

**Expected Results:**
- ✅ 5 columns should be listed
- ✅ 4 indexes should be listed  
- ✅ Data should show `feature_category = 'lost_found'` with counts

---

## 🎯 **Next Steps After Database Setup**

Once the database columns are successfully added:

1. **Deploy the Edge Function**: `supabase functions deploy send-unified-notification`
2. **Set Environment Variables**: In Supabase Dashboard → Settings → Edge Functions
3. **Test the System**: Use the notification components in your app
4. **Create Additional Tables**: Run the notification preferences and email templates setup

---

## 📞 **Need Help?**

If you encounter any issues:

1. **Copy the exact error message**
2. **Note which step you were on**
3. **Check the verification queries to see what's missing**
4. **Run the troubleshooting queries to diagnose the issue**

The key is to **run one command at a time** and **verify each step** before moving to the next!
