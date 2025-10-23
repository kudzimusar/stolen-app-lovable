-- INDEXES ONLY SETUP - Run this AFTER columns exist
-- This script ONLY creates indexes, no column operations

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_feature ON user_notifications(feature_category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_feature ON user_notifications(user_id, feature_category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON user_notifications(priority_level);
CREATE INDEX IF NOT EXISTS idx_user_notifications_expires ON user_notifications(expires_at);

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'user_notifications' 
AND indexname LIKE 'idx_user_notifications_%';
