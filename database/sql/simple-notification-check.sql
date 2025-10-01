-- Simple notification diagnostic - works even if columns missing
-- Run this in Supabase SQL Editor

-- 1. Check if user_notifications table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_notifications'
ORDER BY ordinal_position;

-- 2. Count total notifications
SELECT 
  COUNT(*) as total_notifications,
  COUNT(DISTINCT user_id) as unique_users
FROM user_notifications;

-- 3. Check if is_read column exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_notifications' AND column_name = 'is_read'
    ) THEN '✅ is_read column EXISTS'
    ELSE '❌ is_read column MISSING'
  END as is_read_status;

-- 4. Show sample notification data (if any)
SELECT 
  id,
  user_id,
  notification_type,
  preferences,
  created_at
FROM user_notifications
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check if we can update is_read (if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_notifications' AND column_name = 'is_read'
  ) THEN
    RAISE NOTICE '✅ is_read column exists - notifications can be marked as read';
  ELSE
    RAISE NOTICE '❌ is_read column missing - this is why count does not update!';
    RAISE NOTICE '💡 Run add-is-read-column.sql to fix this issue';
  END IF;
END $$;
