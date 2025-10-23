-- COMPREHENSIVE NOTIFICATION SYSTEM VERIFICATION
-- Run this to verify all components are properly set up

-- SECTION 1: Verify user_notifications table enhancements
SELECT 
    'user_notifications' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    '✅ Column exists' as status
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at')
ORDER BY column_name;

-- SECTION 2: Verify new tables exist
SELECT 
    table_name,
    '✅ Table exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notification_preferences', 'email_templates', 'notification_delivery_logs')
ORDER BY table_name;

-- SECTION 3: Verify indexes are created
SELECT 
    indexname,
    tablename,
    indexdef,
    '✅ Index exists' as status
FROM pg_indexes 
WHERE tablename IN ('user_notifications', 'notification_preferences', 'notification_delivery_logs')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- SECTION 4: Verify email templates are populated
SELECT 
    feature_category,
    COUNT(*) as template_count,
    '✅ Templates loaded' as status
FROM email_templates 
GROUP BY feature_category 
ORDER BY feature_category;

-- SECTION 5: Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables 
WHERE tablename IN ('notification_preferences', 'email_templates', 'notification_delivery_logs')
AND schemaname = 'public'
ORDER BY tablename;

-- SECTION 6: Verify RLS policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    '✅ Policy exists' as status
FROM pg_policies 
WHERE tablename IN ('notification_preferences', 'email_templates', 'notification_delivery_logs')
ORDER BY tablename, policyname;

-- SECTION 7: Summary verification
SELECT 
    'NOTIFICATION SYSTEM SETUP SUMMARY' as section,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'user_notifications' AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at')) as columns_added,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('notification_preferences', 'email_templates', 'notification_delivery_logs')) as tables_created,
    (SELECT COUNT(*) FROM email_templates) as templates_created,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('user_notifications', 'notification_preferences', 'notification_delivery_logs') AND indexname LIKE 'idx_%') as indexes_created,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('notification_preferences', 'email_templates', 'notification_delivery_logs')) as policies_created;

-- SECTION 8: Test data insertion (optional - for testing)
-- Uncomment to test inserting a sample notification
/*
INSERT INTO user_notifications (
    user_id, 
    title, 
    message, 
    feature_category, 
    feature_data, 
    priority_level, 
    action_link
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'Test Notification',
    'This is a test notification for the new system',
    'device_management',
    '{"test": true, "feature": "device_management"}',
    5,
    '/devices'
);

SELECT 'Test notification inserted successfully' as result;
*/