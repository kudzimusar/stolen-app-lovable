-- STEP 2: Create indexes (run AFTER columns are confirmed to exist)
-- This script creates all indexes for the notification system

-- Create indexes for user_notifications table
CREATE INDEX IF NOT EXISTS idx_user_notifications_feature ON user_notifications(feature_category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_feature ON user_notifications(user_id, feature_category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON user_notifications(priority_level);
CREATE INDEX IF NOT EXISTS idx_user_notifications_expires ON user_notifications(expires_at);

-- Verify indexes were created
SELECT 'Indexes created successfully' as status,
       indexname, tablename
FROM pg_indexes 
WHERE tablename = 'user_notifications' 
AND indexname LIKE 'idx_user_notifications_%'
ORDER BY indexname;
