-- SAFE COLUMN ADDITION - Run ONE command at a time in Supabase SQL Editor
-- This ensures columns are created before being used

-- ============================================
-- STEP 1: Add columns one by one (run each separately)
-- ============================================

-- Command 1: Add feature_category column
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS feature_category VARCHAR(30) DEFAULT 'lost_found';

-- Command 2: Add feature_data column  
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS feature_data JSONB DEFAULT '{}';

-- Command 3: Add priority_level column
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10);

-- Command 4: Add action_link column
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS action_link VARCHAR(500);

-- Command 5: Add expires_at column
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- STEP 2: Verify columns were created (run this to check)
-- ============================================

-- Verification query - run this to confirm all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at')
ORDER BY column_name;

-- ============================================
-- STEP 3: Create indexes (only after columns exist)
-- ============================================

-- Command 6: Create feature index
CREATE INDEX IF NOT EXISTS idx_user_notifications_feature ON user_notifications(feature_category);

-- Command 7: Create user+feature index
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_feature ON user_notifications(user_id, feature_category);

-- Command 8: Create priority index
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON user_notifications(priority_level);

-- Command 9: Create expires index
CREATE INDEX IF NOT EXISTS idx_user_notifications_expires ON user_notifications(expires_at);

-- ============================================
-- STEP 4: Update existing data (only after columns exist)
-- ============================================

-- Command 10: Update existing Lost & Found notifications
UPDATE user_notifications 
SET feature_category = 'lost_found' 
WHERE feature_category IS NULL OR feature_category = 'lost_found';

-- ============================================
-- STEP 5: Verify the update worked
-- ============================================

-- Verification query - run this to check the update
SELECT feature_category, COUNT(*) as count
FROM user_notifications 
GROUP BY feature_category;
