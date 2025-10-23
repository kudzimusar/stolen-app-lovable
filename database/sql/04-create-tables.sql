-- STEP 4: CREATE NEW TABLES
-- Run this to create the additional notification tables

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature_category VARCHAR(30) NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    frequency VARCHAR(20) DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    filters JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_category)
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_category VARCHAR(30) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feature_category, notification_type)
);

-- Create notification delivery logs table
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

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_category ON notification_preferences(feature_category);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_notification ON notification_delivery_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_channel ON notification_delivery_logs(channel);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_status ON notification_delivery_logs(status);

-- Verify tables were created
SELECT 
    table_name,
    '✅ Created' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notification_preferences', 'email_templates', 'notification_delivery_logs')
ORDER BY table_name;
