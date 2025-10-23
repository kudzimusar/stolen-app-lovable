-- ULTRA SAFE NOTIFICATION SYSTEM SETUP
-- This script runs each step individually to avoid any column errors
-- Copy and paste each section separately into Supabase SQL Editor

-- ============================================
-- STEP 1: ADD COLUMNS (Run this first)
-- ============================================

-- Add feature categorization columns to existing user_notifications table
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS feature_category VARCHAR(30) DEFAULT 'lost_found',
ADD COLUMN IF NOT EXISTS feature_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10),
ADD COLUMN IF NOT EXISTS action_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- STEP 2: VERIFY COLUMNS WERE CREATED (Run this to check)
-- ============================================

-- Check if all columns were created successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at')
ORDER BY column_name;

-- ============================================
-- STEP 3: CREATE INDEXES (Run this after columns exist)
-- ============================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_feature ON user_notifications(feature_category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_feature ON user_notifications(user_id, feature_category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON user_notifications(priority_level);
CREATE INDEX IF NOT EXISTS idx_user_notifications_expires ON user_notifications(expires_at);

-- ============================================
-- STEP 4: CREATE NOTIFICATION PREFERENCES TABLE (Run this)
-- ============================================

-- Create notification preferences table for user settings
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature_category VARCHAR(30) NOT NULL,
    
    -- Channel preferences
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    
    -- Frequency settings
    frequency VARCHAR(20) DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    -- Feature-specific filters
    filters JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, feature_category)
);

-- Create indexes for notification preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_category ON notification_preferences(feature_category);

-- ============================================
-- STEP 5: CREATE EMAIL TEMPLATES TABLE (Run this)
-- ============================================

-- Create email templates table for feature-specific templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_category VARCHAR(30) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    
    -- Template metadata
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(feature_category, notification_type)
);

-- ============================================
-- STEP 6: CREATE DELIVERY LOGS TABLE (Run this)
-- ============================================

-- Create notification delivery logs for tracking
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES user_notifications(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    provider_response JSONB,
    error_message TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for delivery logs
CREATE INDEX IF NOT EXISTS idx_delivery_logs_notification ON notification_delivery_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_channel ON notification_delivery_logs(channel);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_status ON notification_delivery_logs(status);

-- ============================================
-- STEP 7: SET UP ROW LEVEL SECURITY (Run this)
-- ============================================

-- Add RLS policies for security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" ON notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for email_templates (admin only)
CREATE POLICY "Authenticated users can view email templates" ON email_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS policies for notification_delivery_logs (admin only)
CREATE POLICY "Authenticated users can view delivery logs" ON notification_delivery_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- STEP 8: GRANT PERMISSIONS (Run this)
-- ============================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT SELECT ON email_templates TO authenticated;
GRANT SELECT ON notification_delivery_logs TO authenticated;

-- ============================================
-- STEP 9: FINAL VERIFICATION (Run this to check everything)
-- ============================================

-- Verify all tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_notifications', 'notification_preferences', 'email_templates', 'notification_delivery_logs');

-- Verify all columns were added to user_notifications
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at');

-- Success message
SELECT 'NOTIFICATION SYSTEM INFRASTRUCTURE SETUP COMPLETE!' as status,
       'All tables and columns are now ready' as message,
       NOW() as deployed_at;
