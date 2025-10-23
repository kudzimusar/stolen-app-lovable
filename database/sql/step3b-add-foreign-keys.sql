-- STEP 3B: Add foreign key constraints (run AFTER all tables are created)
-- This script adds the foreign key constraint to notification_delivery_logs

-- Add foreign key constraint to notification_delivery_logs
ALTER TABLE notification_delivery_logs 
ADD CONSTRAINT fk_delivery_logs_notification 
FOREIGN KEY (notification_id) REFERENCES user_notifications(id) ON DELETE CASCADE;

-- Add unique constraints
ALTER TABLE notification_preferences 
ADD CONSTRAINT unique_user_feature UNIQUE (user_id, feature_category);

ALTER TABLE email_templates 
ADD CONSTRAINT unique_feature_notification UNIQUE (feature_category, notification_type);

-- Verify constraints were added
SELECT 'Foreign key constraints added successfully' as status,
       constraint_name,
       table_name
FROM information_schema.table_constraints 
WHERE table_name IN ('notification_preferences', 'email_templates', 'notification_delivery_logs')
AND constraint_type IN ('FOREIGN KEY', 'UNIQUE')
ORDER BY table_name, constraint_name;
