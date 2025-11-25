-- ================================================================
-- PHASE 1: COMPLETE NOTIFICATION SYSTEM DATABASE DEPLOYMENT
-- ================================================================
-- This script extends the existing user_notifications table and creates
-- supporting infrastructure for all 18 notification features.
--
-- Safe to run multiple times (idempotent)
-- Preserves existing Lost & Found notifications
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: EXTEND user_notifications TABLE
-- ================================================================
-- Add 5 new columns to support feature categorization

DO $$
BEGIN
    -- Add feature_category column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' 
        AND column_name = 'feature_category'
    ) THEN
        ALTER TABLE user_notifications 
        ADD COLUMN feature_category VARCHAR(30) DEFAULT 'lost_found';
        RAISE NOTICE '✅ Added feature_category column';
    ELSE
        RAISE NOTICE '⏭️  feature_category column already exists';
    END IF;

    -- Add feature_data column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' 
        AND column_name = 'feature_data'
    ) THEN
        ALTER TABLE user_notifications 
        ADD COLUMN feature_data JSONB DEFAULT '{}';
        RAISE NOTICE '✅ Added feature_data column';
    ELSE
        RAISE NOTICE '⏭️  feature_data column already exists';
    END IF;

    -- Add priority_level column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' 
        AND column_name = 'priority_level'
    ) THEN
        ALTER TABLE user_notifications 
        ADD COLUMN priority_level INTEGER DEFAULT 5 
        CHECK (priority_level >= 1 AND priority_level <= 10);
        RAISE NOTICE '✅ Added priority_level column';
    ELSE
        RAISE NOTICE '⏭️  priority_level column already exists';
    END IF;

    -- Add action_link column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' 
        AND column_name = 'action_link'
    ) THEN
        ALTER TABLE user_notifications 
        ADD COLUMN action_link VARCHAR(500);
        RAISE NOTICE '✅ Added action_link column';
    ELSE
        RAISE NOTICE '⏭️  action_link column already exists';
    END IF;

    -- Add expires_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' 
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE user_notifications 
        ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✅ Added expires_at column';
    ELSE
        RAISE NOTICE '⏭️  expires_at column already exists';
    END IF;
END $$;

-- ================================================================
-- STEP 2: CREATE PERFORMANCE INDEXES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_user_notifications_feature 
    ON user_notifications(feature_category);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_feature 
    ON user_notifications(user_id, feature_category);

CREATE INDEX IF NOT EXISTS idx_user_notifications_priority 
    ON user_notifications(priority_level);

CREATE INDEX IF NOT EXISTS idx_user_notifications_expires 
    ON user_notifications(expires_at) WHERE expires_at IS NOT NULL;

-- ================================================================
-- STEP 3: CREATE SUPPORTING TABLES (Destructive Recreation)
-- ================================================================
-- Drop and recreate to ensure clean schema

DROP TABLE IF EXISTS notification_delivery_logs CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;

-- Create notification_preferences table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature_category VARCHAR(30) NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    frequency VARCHAR(20) DEFAULT 'immediate' 
        CHECK (frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    filters JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_category)
);

-- Create email_templates table
CREATE TABLE email_templates (
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

-- Create notification_delivery_logs table
CREATE TABLE notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES user_notifications(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL 
        CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    status VARCHAR(20) NOT NULL 
        CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    provider_response JSONB,
    error_message TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX idx_notification_preferences_user 
    ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_category 
    ON notification_preferences(feature_category);
CREATE INDEX idx_email_templates_category 
    ON email_templates(feature_category);
CREATE INDEX idx_email_templates_type 
    ON email_templates(notification_type);
CREATE INDEX idx_delivery_logs_notification 
    ON notification_delivery_logs(notification_id);
CREATE INDEX idx_delivery_logs_channel 
    ON notification_delivery_logs(channel);
CREATE INDEX idx_delivery_logs_status 
    ON notification_delivery_logs(status);

-- ================================================================
-- STEP 4: POPULATE EMAIL TEMPLATES
-- ================================================================
-- Insert comprehensive email templates for all 18 features

INSERT INTO email_templates (feature_category, notification_type, template_name, subject_template, html_template, text_template)
VALUES 
    -- Lost & Found
    ('lost_found', 'device_found', 'Device Found Notification', 
     'Your {{device_name}} has been found!', 
     '<h1>Great news!</h1><p>Your {{device_name}} has been found.</p>', 
     'Your {{device_name}} has been found.'),
    ('lost_found', 'contact_response', 'Contact Response', 
     'Response to your lost device report', 
     '<h1>Response Received</h1><p>Someone responded to your lost device report.</p>', 
     'Response received for your lost device.'),
    
    -- Device Management
    ('device_management', 'device_registered', 'Device Registration', 
     'Device {{device_name}} Registered', 
     '<h1>Device Registered</h1><p>{{device_name}} ({{serial_number}}) registered successfully.</p>', 
     'Device registered successfully.'),
    ('device_management', 'device_verified', 'Device Verification', 
     'Device Verified Successfully', 
     '<h1>Verification Complete</h1><p>Your device is now verified.</p>', 
     'Device verified.'),
    ('device_management', 'transfer_initiated', 'Device Transfer', 
     'Device Transfer Initiated', 
     '<h1>Transfer Started</h1><p>Your device transfer has been initiated.</p>', 
     'Device transfer started.'),
    ('device_management', 'warranty_expiring', 'Warranty Expiry', 
     'Warranty Expiring Soon', 
     '<h1>Warranty Alert</h1><p>Your device warranty expires soon.</p>', 
     'Warranty expiring soon.'),
    
    -- Marketplace
    ('marketplace', 'listing_created', 'Listing Created', 
     'Your {{item_name}} is Live', 
     '<h1>Listing Live</h1><p>{{item_name}} is now live on marketplace.</p>', 
     'Listing created successfully.'),
    ('marketplace', 'bid_received', 'New Bid', 
     'New Bid: R{{bid_amount}}', 
     '<h1>New Bid!</h1><p>R{{bid_amount}} bid on {{item_name}}.</p>', 
     'New bid received.'),
    ('marketplace', 'item_sold', 'Item Sold', 
     'Your {{item_name}} has been sold!', 
     '<h1>Item Sold!</h1><p>{{item_name}} has been sold for R{{price}}.</p>', 
     'Item sold successfully.'),
    ('marketplace', 'price_drop', 'Price Drop Alert', 
     'Price dropped on {{item_name}}', 
     '<h1>Price Drop!</h1><p>{{item_name}} price dropped to R{{new_price}}.</p>', 
     'Price drop alert.'),
    
    -- Insurance
    ('insurance', 'claim_submitted', 'Claim Submitted', 
     'Claim #{{claim_number}} Submitted', 
     '<h1>Claim Submitted</h1><p>Your claim is under review.</p>', 
     'Claim submitted successfully.'),
    ('insurance', 'claim_approved', 'Claim Approved', 
     'Claim Approved - R{{amount}}', 
     '<h1>Claim Approved!</h1><p>R{{amount}} approved.</p>', 
     'Claim approved.'),
    ('insurance', 'claim_rejected', 'Claim Rejected', 
     'Claim #{{claim_number}} Rejected', 
     '<h1>Claim Rejected</h1><p>Your claim has been rejected.</p>', 
     'Claim rejected.'),
    ('insurance', 'fraud_alert', 'Fraud Alert', 
     'Fraud Alert Detected', 
     '<h1>Fraud Alert</h1><p>Suspicious activity detected on your account.</p>', 
     'Fraud alert.'),
    
    -- Payment
    ('payment', 'payment_received', 'Payment Received', 
     'R{{amount}} Received', 
     '<h1>Payment Received</h1><p>R{{amount}} from {{sender}}.</p>', 
     'Payment received.'),
    ('payment', 'payment_sent', 'Payment Sent', 
     'R{{amount}} Sent', 
     '<h1>Payment Sent</h1><p>R{{amount}} to {{recipient}}.</p>', 
     'Payment sent.'),
    ('payment', 'transaction_failed', 'Transaction Failed', 
     'Transaction Failed', 
     '<h1>Transaction Failed</h1><p>Your transaction could not be completed.</p>', 
     'Transaction failed.'),
    ('payment', 'low_balance', 'Low Balance Alert', 
     'Low Account Balance', 
     '<h1>Low Balance</h1><p>Your account balance is low.</p>', 
     'Low balance alert.'),
    
    -- Security
    ('security', 'security_alert', 'Security Alert', 
     'Security Alert', 
     '<h1>Security Alert</h1><p>{{alert_message}}</p>', 
     'Security alert.'),
    ('security', 'login_attempt', 'Login Attempt', 
     'New Login Detected', 
     '<h1>Login Alert</h1><p>New login from {{location}}.</p>', 
     'Login attempt detected.'),
    ('security', 'password_changed', 'Password Changed', 
     'Password Successfully Changed', 
     '<h1>Password Changed</h1><p>Your password has been updated.</p>', 
     'Password changed.'),
    ('security', 'device_compromised', 'Device Compromised', 
     'Device Security Alert', 
     '<h1>Device Compromised</h1><p>Your device may be compromised.</p>', 
     'Device compromised.'),
    
    -- Repair Services
    ('repair_services', 'booking_confirmed', 'Repair Booked', 
     'Repair Booking Confirmed', 
     '<h1>Booking Confirmed</h1><p>Repair appointment scheduled.</p>', 
     'Repair booked.'),
    ('repair_services', 'repair_completed', 'Repair Complete', 
     'Repair Completed', 
     '<h1>Repair Complete</h1><p>Your device is ready for pickup.</p>', 
     'Repair completed.'),
    ('repair_services', 'parts_arrived', 'Parts Arrived', 
     'Repair Parts Arrived', 
     '<h1>Parts Arrived</h1><p>Your repair parts have arrived.</p>', 
     'Parts arrived.'),
    ('repair_services', 'ready_for_pickup', 'Ready for Pickup', 
     'Device Ready for Pickup', 
     '<h1>Ready for Pickup</h1><p>Your device is ready for collection.</p>', 
     'Ready for pickup.'),
    
    -- Admin
    ('admin', 'new_user_registration', 'New User Registration', 
     'New User Registered', 
     '<h1>New User</h1><p>A new user has registered.</p>', 
     'New user registered.'),
    ('admin', 'suspicious_activity', 'Suspicious Activity', 
     'Suspicious Activity Detected', 
     '<h1>Suspicious Activity</h1><p>Suspicious activity detected.</p>', 
     'Suspicious activity.'),
    ('admin', 'system_error', 'System Error', 
     'System Error Occurred', 
     '<h1>System Error</h1><p>A system error has occurred.</p>', 
     'System error.'),
    ('admin', 'high_value_transaction', 'High Value Transaction', 
     'High Value Transaction Alert', 
     '<h1>High Value Transaction</h1><p>A high value transaction occurred.</p>', 
     'High value transaction.'),
    
    -- Community
    ('community', 'new_tip', 'New Tip Received', 
     'New Tip on Your Report', 
     '<h1>New Tip</h1><p>Someone added a tip to your report.</p>', 
     'New tip received.'),
    ('community', 'reputation_level', 'Reputation Level Up', 
     'You Leveled Up!', 
     '<h1>Level Up!</h1><p>Your reputation level increased.</p>', 
     'Reputation level increased.'),
    ('community', 'badge_unlocked', 'Badge Unlocked', 
     'New Badge Earned', 
     '<h1>Badge Unlocked!</h1><p>You earned a new badge.</p>', 
     'Badge unlocked.'),
    ('community', 'referral_reward', 'Referral Reward', 
     'Referral Reward Earned', 
     '<h1>Referral Reward</h1><p>You earned a referral reward.</p>', 
     'Referral reward earned.'),
    
    -- Hot Deals
    ('hot_deals', 'deal_alert', 'Deal Alert', 
     'New Hot Deal Available', 
     '<h1>Hot Deal!</h1><p>A new hot deal is available.</p>', 
     'Hot deal available.'),
    ('hot_deals', 'price_drop', 'Price Drop', 
     'Price Dropped on Deal', 
     '<h1>Price Drop!</h1><p>The price dropped on a deal you follow.</p>', 
     'Price drop alert.'),
    ('hot_deals', 'deal_ending', 'Deal Ending', 
     'Deal Ending Soon', 
     '<h1>Deal Ending</h1><p>A deal you follow is ending soon.</p>', 
     'Deal ending soon.'),
    ('hot_deals', 'bid_placed', 'Bid Placed', 
     'Your Bid Was Placed', 
     '<h1>Bid Placed</h1><p>Your bid was successfully placed.</p>', 
     'Bid placed.'),
    
    -- Law Enforcement
    ('law_enforcement', 'device_match', 'Device Match', 
     'Device Match Found', 
     '<h1>Device Match</h1><p>A device match has been found.</p>', 
     'Device match found.'),
    ('law_enforcement', 'case_update', 'Case Update', 
     'Case Status Updated', 
     '<h1>Case Update</h1><p>Your case status has been updated.</p>', 
     'Case updated.'),
    ('law_enforcement', 'recovery_alert', 'Recovery Alert', 
     'Device Recovery Alert', 
     '<h1>Recovery Alert</h1><p>A device recovery alert was triggered.</p>', 
     'Recovery alert.'),
    ('law_enforcement', 'investigation_update', 'Investigation Update', 
     'Investigation Status Update', 
     '<h1>Investigation Update</h1><p>Your investigation has been updated.</p>', 
     'Investigation updated.'),
    
    -- NGO
    ('ngo', 'donation_received', 'Donation Received', 
     'Donation Received', 
     '<h1>Donation Received</h1><p>A donation has been received.</p>', 
     'Donation received.'),
    ('ngo', 'impact_update', 'Impact Update', 
     'Impact Report Available', 
     '<h1>Impact Update</h1><p>A new impact report is available.</p>', 
     'Impact report available.'),
    ('ngo', 'program_update', 'Program Update', 
     'Program Status Update', 
     '<h1>Program Update</h1><p>A program status has been updated.</p>', 
     'Program updated.'),
    ('ngo', 'volunteer_opportunity', 'Volunteer Opportunity', 
     'New Volunteer Opportunity', 
     '<h1>Volunteer Opportunity</h1><p>A new volunteer opportunity is available.</p>', 
     'Volunteer opportunity available.'),
    
    -- Retailer
    ('retailer', 'bulk_registration', 'Bulk Registration', 
     'Bulk Device Registration', 
     '<h1>Bulk Registration</h1><p>Your bulk device registration is complete.</p>', 
     'Bulk registration complete.'),
    ('retailer', 'inventory_alert', 'Inventory Alert', 
     'Inventory Level Alert', 
     '<h1>Inventory Alert</h1><p>Your inventory level requires attention.</p>', 
     'Inventory alert.'),
    ('retailer', 'certificate_issued', 'Certificate Issued', 
     'Device Certificate Issued', 
     '<h1>Certificate Issued</h1><p>A device certificate has been issued.</p>', 
     'Certificate issued.'),
    ('retailer', 'sales_update', 'Sales Update', 
     'Sales Report Available', 
     '<h1>Sales Update</h1><p>A new sales report is available.</p>', 
     'Sales report available.'),
    
    -- Repair Shop
    ('repair_shop', 'new_booking', 'New Booking', 
     'New Repair Booking Received', 
     '<h1>New Booking</h1><p>A new repair booking has been received.</p>', 
     'New booking received.'),
    ('repair_shop', 'repair_completed', 'Repair Completed', 
     'Repair Completed', 
     '<h1>Repair Complete</h1><p>A repair has been completed.</p>', 
     'Repair completed.'),
    ('repair_shop', 'customer_feedback', 'Customer Feedback', 
     'New Customer Feedback', 
     '<h1>Customer Feedback</h1><p>New customer feedback received.</p>', 
     'Customer feedback received.'),
    ('repair_shop', 'parts_ordered', 'Parts Ordered', 
     'Repair Parts Ordered', 
     '<h1>Parts Ordered</h1><p>Repair parts have been ordered.</p>', 
     'Parts ordered.'),
    
    -- User Profile
    ('user_profile', 'profile_updated', 'Profile Updated', 
     'Profile Successfully Updated', 
     '<h1>Profile Updated</h1><p>Your profile has been updated.</p>', 
     'Profile updated.'),
    ('user_profile', 'account_changes', 'Account Changes', 
     'Account Settings Changed', 
     '<h1>Account Changes</h1><p>Your account settings have been changed.</p>', 
     'Account settings changed.'),
    ('user_profile', 'preference_updated', 'Preference Updated', 
     'Preferences Updated', 
     '<h1>Preferences Updated</h1><p>Your preferences have been updated.</p>', 
     'Preferences updated.'),
    ('user_profile', 'verification_complete', 'Verification Complete', 
     'Account Verification Complete', 
     '<h1>Verification Complete</h1><p>Your account verification is complete.</p>', 
     'Verification complete.'),
    
    -- Support
    ('support', 'ticket_created', 'Ticket Created', 
     'Support Ticket Created', 
     '<h1>Ticket Created</h1><p>Your support ticket has been created.</p>', 
     'Support ticket created.'),
    ('support', 'ticket_updated', 'Ticket Updated', 
     'Support Ticket Updated', 
     '<h1>Ticket Updated</h1><p>Your support ticket has been updated.</p>', 
     'Support ticket updated.'),
    ('support', 'ticket_resolved', 'Ticket Resolved', 
     'Support Ticket Resolved', 
     '<h1>Ticket Resolved</h1><p>Your support ticket has been resolved.</p>', 
     'Support ticket resolved.'),
    ('support', 'help_response', 'Help Response', 
     'Response to Your Help Request', 
     '<h1>Help Response</h1><p>You received a response to your help request.</p>', 
     'Help response received.')
ON CONFLICT (feature_category, notification_type) DO NOTHING;

-- ================================================================
-- STEP 5: SET UP SECURITY POLICIES
-- ================================================================

-- Enable Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notification_preferences
DROP POLICY IF EXISTS "Users manage own preferences" ON notification_preferences;
CREATE POLICY "Users manage own preferences" ON notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for email_templates (read-only for authenticated users)
DROP POLICY IF EXISTS "Users view templates" ON email_templates;
CREATE POLICY "Users view templates" ON email_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for notification_delivery_logs
DROP POLICY IF EXISTS "Users view own delivery logs" ON notification_delivery_logs;
CREATE POLICY "Users view own delivery logs" ON notification_delivery_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_notifications 
            WHERE user_notifications.id = notification_delivery_logs.notification_id
            AND user_notifications.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT SELECT ON email_templates TO authenticated;
GRANT SELECT ON notification_delivery_logs TO authenticated;

COMMIT;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Run these after deployment to verify everything worked

-- Verify columns were added
SELECT 'Columns Added' as check_type, COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at');

-- Verify tables were created
SELECT 'Tables Created' as check_type, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notification_preferences', 'email_templates', 'notification_delivery_logs');

-- Verify email templates were populated
SELECT 'Email Templates' as check_type, feature_category, COUNT(*) as template_count
FROM email_templates
GROUP BY feature_category
ORDER BY feature_category;

-- Verify RLS is enabled
SELECT 'RLS Enabled' as check_type, tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('notification_preferences', 'email_templates', 'notification_delivery_logs')
AND schemaname = 'public';
