-- ULTRA-SAFE NOTIFICATION SYSTEM SETUP
-- This script eliminates the "column does not exist" error by using a different approach

-- STEP 1: Add columns to user_notifications (with explicit commit)
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS feature_category VARCHAR(30) DEFAULT 'lost_found',
ADD COLUMN IF NOT EXISTS feature_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10),
ADD COLUMN IF NOT EXISTS action_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Verify columns were created
SELECT 'Columns added successfully' as status,
       column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at')
ORDER BY column_name;
