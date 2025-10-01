-- Check user_notifications table structure and data
-- Run this in Supabase SQL Editor

-- 1. Check table columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_notifications'
ORDER BY ordinal_position;

-- 2. Check actual notification data (correct column names)
SELECT 
  id,
  user_id,
  notification_type,
  preferences,
  is_read,
  created_at
FROM user_notifications
ORDER BY created_at DESC
LIMIT 10;

-- 3. Count unread notifications by user
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE is_read = false) as unread_count,
  COUNT(*) FILTER (WHERE is_read = true) as read_count,
  COUNT(*) as total_count
FROM user_notifications
GROUP BY user_id;

-- 4. Check if is_read is boolean or text
SELECT 
  id,
  is_read,
  pg_typeof(is_read) as data_type,
  CASE 
    WHEN is_read = true THEN 'Boolean TRUE'
    WHEN is_read = false THEN 'Boolean FALSE'
    WHEN is_read::text = 'true' THEN 'String "true"'
    WHEN is_read::text = 'false' THEN 'String "false"'
    ELSE 'Unknown type'
  END as type_check
FROM user_notifications
LIMIT 5;
