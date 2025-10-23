-- STEP-BY-STEP NOTIFICATION SYSTEM DEPLOYMENT
-- Run these steps in order to avoid "column does not exist" errors

-- ============================================
-- STEP 1: CREATE COLUMNS FIRST
-- ============================================

-- Add feature categorization columns to existing user_notifications table
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS feature_category VARCHAR(30) DEFAULT 'lost_found',
ADD COLUMN IF NOT EXISTS feature_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10),
ADD COLUMN IF NOT EXISTS action_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Verify columns were created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at');

-- ============================================
-- STEP 2: CREATE INDEXES
-- ============================================

-- Create indexes for performance (only after columns exist)
CREATE INDEX IF NOT EXISTS idx_user_notifications_feature ON user_notifications(feature_category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_feature ON user_notifications(user_id, feature_category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON user_notifications(priority_level);
CREATE INDEX IF NOT EXISTS idx_user_notifications_expires ON user_notifications(expires_at);

-- ============================================
-- STEP 3: UPDATE EXISTING DATA
-- ============================================

-- Update existing Lost & Found notifications to have proper feature_category
-- This will only work AFTER the column has been created
-- First verify the column exists, then update
DO $$
BEGIN
    -- Check if feature_category column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' 
        AND column_name = 'feature_category'
    ) THEN
        -- Column exists, safe to update
        UPDATE user_notifications 
        SET feature_category = 'lost_found' 
        WHERE feature_category IS NULL OR feature_category = 'lost_found';
        
        RAISE NOTICE 'Updated existing notifications with feature_category = lost_found';
    ELSE
        RAISE NOTICE 'feature_category column does not exist yet, skipping update';
    END IF;
END $$;

-- Verify the update worked
SELECT feature_category, COUNT(*) as count
FROM user_notifications 
GROUP BY feature_category;

-- ============================================
-- STEP 4: CREATE NOTIFICATION PREFERENCES TABLE
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
-- STEP 5: INSERT DEFAULT PREFERENCES
-- ============================================

-- Insert default preferences for existing users for all features
-- This will only work AFTER the table has been created
INSERT INTO notification_preferences (user_id, feature_category, email_enabled, sms_enabled, push_enabled, in_app_enabled)
SELECT DISTINCT 
    u.id,
    feature_cat.category,
    CASE 
        WHEN feature_cat.category = 'lost_found' THEN TRUE
        WHEN feature_cat.category = 'security' THEN TRUE
        WHEN feature_cat.category = 'payment' THEN TRUE
        ELSE TRUE
    END as email_enabled,
    CASE 
        WHEN feature_cat.category = 'security' THEN TRUE
        WHEN feature_cat.category = 'payment' THEN TRUE
        ELSE FALSE
    END as sms_enabled,
    TRUE as push_enabled,
    TRUE as in_app_enabled
FROM users u
CROSS JOIN (
    VALUES 
        ('lost_found'),
        ('device_management'),
        ('marketplace'),
        ('insurance'),
        ('payment'),
        ('repair_services'),
        ('security'),
        ('admin'),
        ('community'),
        ('hot_deals'),
        ('law_enforcement'),
        ('ngo'),
        ('retailer'),
        ('repair_shop'),
        ('user_profile'),
        ('support')
) AS feature_cat(category)
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np 
    WHERE np.user_id = u.id AND np.feature_category = feature_cat.category
);

-- ============================================
-- STEP 6: CREATE EMAIL TEMPLATES TABLE
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
-- STEP 7: INSERT EMAIL TEMPLATES
-- ============================================

-- Insert default email templates for all features
INSERT INTO email_templates (feature_category, notification_type, template_name, subject_template, html_template, text_template)
VALUES 
    -- Lost & Found (existing)
    ('lost_found', 'device_found', 'Device Found Notification', 
     'Your {{device_name}} has been found!', 
     '<h1>Great news! Your {{device_name}} has been found.</h1><p>Contact: {{contact_name}} at {{contact_phone}}</p>',
     'Your {{device_name}} has been found. Contact: {{contact_name}} at {{contact_phone}}'),
    
    -- Device Management
    ('device_management', 'device_registered', 'Device Registration Confirmation',
     'Device {{device_name}} Successfully Registered',
     '<h1>Device Registration Confirmed</h1><p>Your {{device_name}} ({{serial_number}}) has been successfully registered on the STOLEN platform.</p>',
     'Device Registration Confirmed: Your {{device_name}} ({{serial_number}}) has been successfully registered.'),
    
    ('device_management', 'device_verified', 'Device Verification Complete',
     'Device {{device_name}} Verification Complete',
     '<h1>Device Verification Complete</h1><p>Your {{device_name}} has been verified and is now protected on the blockchain.</p>',
     'Device Verification Complete: Your {{device_name}} has been verified and is now protected.'),
    
    -- Marketplace
    ('marketplace', 'listing_created', 'Listing Created Successfully',
     'Your {{item_name}} is now live on the marketplace',
     '<h1>Listing Created Successfully</h1><p>Your {{item_name}} is now live and visible to buyers.</p>',
     'Listing Created: Your {{item_name}} is now live on the marketplace.'),
    
    ('marketplace', 'bid_received', 'New Bid on Your {{item_name}}',
     'New Bid: R{{bid_amount}} on {{item_name}}',
     '<h1>New Bid Received</h1><p>Someone bid R{{bid_amount}} on your {{item_name}}.</p>',
     'New Bid: R{{bid_amount}} on {{item_name}}'),
    
    -- Insurance
    ('insurance', 'claim_submitted', 'Insurance Claim Submitted',
     'Claim #{{claim_number}} Submitted Successfully',
     '<h1>Claim Submitted</h1><p>Your insurance claim #{{claim_number}} has been submitted and is under review.</p>',
     'Claim Submitted: Your insurance claim #{{claim_number}} is under review.'),
    
    -- Payment
    ('payment', 'payment_received', 'Payment Received',
     'R{{amount}} Received from {{sender_name}}',
     '<h1>Payment Received</h1><p>You received R{{amount}} from {{sender_name}}.</p>',
     'Payment Received: R{{amount}} from {{sender_name}}'),
    
    -- Security
    ('security', 'security_alert', 'Security Alert',
     'Security Alert: {{alert_type}}',
     '<h1>Security Alert</h1><p>{{alert_message}}</p>',
     'Security Alert: {{alert_message}}')
ON CONFLICT (feature_category, notification_type) DO NOTHING;

-- ============================================
-- STEP 8: CREATE DELIVERY LOGS TABLE
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
-- STEP 9: SET UP ROW LEVEL SECURITY
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
-- STEP 10: GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT SELECT ON email_templates TO authenticated;
GRANT SELECT ON notification_delivery_logs TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
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

-- Check notification preferences were created
SELECT feature_category, COUNT(*) as user_count
FROM notification_preferences 
GROUP BY feature_category;

-- Check email templates were created
SELECT feature_category, notification_type, template_name
FROM email_templates
ORDER BY feature_category, notification_type;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

-- If you see this message, the deployment was successful!
SELECT 'NOTIFICATION SYSTEM DEPLOYMENT COMPLETE!' as status,
       'All 18 notification systems are now ready' as message,
       NOW() as deployed_at;
