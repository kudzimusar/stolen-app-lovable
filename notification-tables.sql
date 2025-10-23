-- Universal Notifications System Database Schema
-- This creates the unified notification system for all app features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Universal notifications table (extends user_notifications)
CREATE TABLE IF NOT EXISTS public.universal_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'device', 'marketplace', 'insurance', 'repair', 'payment', 
        'security', 'admin', 'lost_found', 'community', 'transfer'
    )),
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Delivery channels
    email_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    push_sent BOOLEAN DEFAULT FALSE,
    in_app_shown BOOLEAN DEFAULT FALSE,
    
    -- Delivery tracking
    email_sent_at TIMESTAMP WITH TIME ZONE,
    sms_sent_at TIMESTAMP WITH TIME ZONE,
    push_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    read_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    action_taken_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority & Scheduling
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences per category
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'device', 'marketplace', 'insurance', 'repair', 'payment', 
        'security', 'admin', 'lost_found', 'community', 'transfer'
    )),
    
    -- Channel preferences
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    
    -- Frequency
    frequency VARCHAR(20) DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    -- Filters
    filters JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, category)
);

-- Email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(30) NOT NULL,
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification delivery logs for analytics
CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES public.universal_notifications(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    provider_response JSONB DEFAULT '{}',
    error_message TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_universal_notifications_user_id ON public.universal_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_universal_notifications_category ON public.universal_notifications(category);
CREATE INDEX IF NOT EXISTS idx_universal_notifications_type ON public.universal_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_universal_notifications_created_at ON public.universal_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_universal_notifications_read_at ON public.universal_notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_universal_notifications_scheduled ON public.universal_notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_category ON public.notification_preferences(user_id, category);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates(category);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_notification_id ON public.notification_delivery_logs(notification_id);

-- Create RLS policies
ALTER TABLE public.universal_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.universal_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.universal_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON public.notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Delivery logs are read-only for users
CREATE POLICY "Users can view own delivery logs" ON public.notification_delivery_logs
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.universal_notifications WHERE id = notification_id));

-- Create function to update notification timestamps
CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_universal_notifications_updated_at
    BEFORE UPDATE ON public.universal_notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notification_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notification_updated_at();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON public.email_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notification_updated_at();

-- Insert default email templates
INSERT INTO public.email_templates (template_name, category, subject_template, html_template, variables) VALUES
-- Device Management Templates
('device_registered', 'device', '✅ Device Registered - {{device_name}}', 
'<h2>Device Successfully Registered</h2><p>Your {{device_name}} has been registered in the STOLEN database.</p>', 
'["device_name", "registration_date", "qr_code_url"]'),

('device_verified', 'device', '🔍 Device Verified - {{device_name}}', 
'<h2>Device Verification Complete</h2><p>Your {{device_name}} has been verified and added to the registry.</p>', 
'["device_name", "verification_date", "certificate_url"]'),

-- Marketplace Templates
('listing_created', 'marketplace', '📱 Listing Created - {{device_name}}', 
'<h2>Your Device is Now Listed</h2><p>Your {{device_name}} is now live on the marketplace.</p>', 
'["device_name", "listing_price", "listing_url"]'),

('price_drop', 'marketplace', '💰 Price Drop Alert - {{device_name}}', 
'<h2>Price Drop Alert</h2><p>The {{device_name}} you''re watching dropped to {{new_price}}.</p>', 
'["device_name", "old_price", "new_price", "listing_url"]'),

-- Insurance Templates
('claim_submitted', 'insurance', '📋 Claim Submitted - {{claim_id}}', 
'<h2>Insurance Claim Submitted</h2><p>Your claim {{claim_id}} has been submitted and is under review.</p>', 
'["claim_id", "claim_type", "submission_date"]'),

('claim_approved', 'insurance', '✅ Claim Approved - {{claim_id}}', 
'<h2>Claim Approved</h2><p>Your claim {{claim_id}} has been approved. Payout: {{amount}}.</p>', 
'["claim_id", "amount", "payout_date"]'),

-- Payment Templates
('payment_received', 'payment', '💳 Payment Received - {{amount}}', 
'<h2>Payment Received</h2><p>You received {{amount}} in your STOLEN wallet.</p>', 
'["amount", "transaction_id", "sender_name"]'),

('payment_sent', 'payment', '💸 Payment Sent - {{amount}}', 
'<h2>Payment Sent</h2><p>You sent {{amount}} to {{recipient_name}}.</p>', 
'["amount", "transaction_id", "recipient_name"]'),

-- Repair Templates
('repair_booked', 'repair', '🔧 Repair Booked - {{device_name}}', 
'<h2>Repair Appointment Booked</h2><p>Your {{device_name}} repair is scheduled for {{appointment_date}}.</p>', 
'["device_name", "appointment_date", "repair_shop_name"]'),

('repair_completed', 'repair', '✅ Repair Complete - {{device_name}}', 
'<h2>Repair Completed</h2><p>Your {{device_name}} repair is complete and ready for pickup.</p>', 
'["device_name", "completion_date", "repair_shop_name", "pickup_location"]'),

-- Security Templates
('security_alert', 'security', '⚠️ Security Alert', 
'<h2>Security Alert</h2><p>{{alert_message}}</p>', 
'["alert_message", "alert_type", "action_required"]'),

('login_new_device', 'security', '🔐 New Device Login', 
'<h2>New Device Login Detected</h2><p>A login was detected from a new device.</p>', 
'["device_info", "location", "login_time"]')

ON CONFLICT (template_name) DO NOTHING;
