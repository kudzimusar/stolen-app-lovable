-- MINIMAL SAFE COLUMN ADDITION
-- This script ONLY adds missing columns, no complex operations

-- Add feature categorization columns to existing user_notifications table
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS feature_category VARCHAR(30) DEFAULT 'lost_found',
ADD COLUMN IF NOT EXISTS feature_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10),
ADD COLUMN IF NOT EXISTS action_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_feature ON user_notifications(feature_category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_feature ON user_notifications(user_id, feature_category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON user_notifications(priority_level);
CREATE INDEX IF NOT EXISTS idx_user_notifications_expires ON user_notifications(expires_at);
