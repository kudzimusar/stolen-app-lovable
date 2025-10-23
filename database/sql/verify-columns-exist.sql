-- VERIFICATION SCRIPT
-- Run this to check what columns actually exist

-- Check if all required columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at')
ORDER BY column_name;

-- Check current data in feature_category
SELECT feature_category, COUNT(*) as count
FROM user_notifications 
GROUP BY feature_category;

-- Check if indexes exist
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'user_notifications' 
AND indexname LIKE 'idx_user_notifications_%';
