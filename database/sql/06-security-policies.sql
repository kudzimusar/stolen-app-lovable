-- STEP 6: SET UP SECURITY POLICIES
-- Run this to enable RLS and create security policies

-- Enable Row Level Security on all new tables
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notification_preferences
CREATE POLICY "Users manage own preferences" ON notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for email_templates
CREATE POLICY "Users view templates" ON email_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for notification_delivery_logs
CREATE POLICY "Users view own delivery logs" ON notification_delivery_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_notifications 
            WHERE user_notifications.id = notification_delivery_logs.notification_id 
            AND user_notifications.user_id = auth.uid()
        )
    );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT SELECT ON email_templates TO authenticated;
GRANT SELECT ON notification_delivery_logs TO authenticated;

-- Verify RLS is enabled and policies exist
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    '✅ RLS Enabled' as status
FROM pg_tables 
WHERE tablename IN ('notification_preferences', 'email_templates', 'notification_delivery_logs')
AND schemaname = 'public';

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    '✅ Policy Created' as status
FROM pg_policies 
WHERE tablename IN ('notification_preferences', 'email_templates', 'notification_delivery_logs')
ORDER BY tablename, policyname;



