-- Reward Payment Tracking System
-- This script creates tables and functions for tracking reward payments

BEGIN;

-- 1. Create reward_payments table
CREATE TABLE IF NOT EXISTS reward_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES lost_found_reports(id) ON DELETE CASCADE,
    finder_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    payment_method VARCHAR(50) NOT NULL, -- 'bank_transfer', 'mobile_money', 'crypto', 'cash'
    payment_details JSONB NOT NULL, -- Payment-specific information
    transaction_id VARCHAR(255), -- External payment reference
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_proof TEXT, -- Receipt, screenshot, or transaction hash
    admin_notes TEXT,
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create payment_notifications table
CREATE TABLE IF NOT EXISTS payment_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES reward_payments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'payment_sent', 'payment_received', 'payment_failed'
    message TEXT NOT NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    in_app_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    method_type VARCHAR(50) NOT NULL, -- 'bank_account', 'mobile_money', 'crypto_wallet', 'cash_pickup'
    method_details JSONB NOT NULL, -- Account details, wallet addresses, etc.
    is_verified BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reward_payments_report_id ON reward_payments(report_id);
CREATE INDEX IF NOT EXISTS idx_reward_payments_finder_id ON reward_payments(finder_user_id);
CREATE INDEX IF NOT EXISTS idx_reward_payments_status ON reward_payments(status);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_user_id ON payment_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- 5. Create function to process reward payment
CREATE OR REPLACE FUNCTION process_reward_payment(
    p_report_id UUID,
    p_finder_user_id UUID,
    p_amount DECIMAL(10,2),
    p_payment_method VARCHAR(50),
    p_payment_details JSONB,
    p_admin_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_payment_id UUID;
    v_owner_user_id UUID;
    v_result JSON;
BEGIN
    -- Get owner user ID
    SELECT user_id INTO v_owner_user_id
    FROM lost_found_reports
    WHERE id = p_report_id;
    
    IF v_owner_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Report not found');
    END IF;
    
    -- Create payment record
    INSERT INTO reward_payments (
        report_id,
        finder_user_id,
        owner_user_id,
        amount,
        payment_method,
        payment_details,
        processed_by,
        status
    ) VALUES (
        p_report_id,
        p_finder_user_id,
        v_owner_user_id,
        p_amount,
        p_payment_method,
        p_payment_details,
        p_admin_user_id,
        'processing'
    ) RETURNING id INTO v_payment_id;
    
    -- Create notifications
    INSERT INTO payment_notifications (payment_id, user_id, notification_type, message)
    VALUES 
        (v_payment_id, p_finder_user_id, 'payment_sent', 
         'Your reward of R' || p_amount || ' has been sent via ' || p_payment_method),
        (v_payment_id, v_owner_user_id, 'payment_sent', 
         'Reward payment of R' || p_amount || ' has been processed for your device recovery');
    
    -- Update report status
    UPDATE lost_found_reports 
    SET status = 'reward_paid',
        updated_at = NOW()
    WHERE id = p_report_id;
    
    RETURN json_build_object(
        'success', true,
        'payment_id', v_payment_id,
        'message', 'Reward payment processed successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to confirm payment received
CREATE OR REPLACE FUNCTION confirm_payment_received(
    p_payment_id UUID,
    p_transaction_id VARCHAR(255),
    p_payment_proof TEXT
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Update payment status
    UPDATE reward_payments 
    SET status = 'completed',
        transaction_id = p_transaction_id,
        payment_proof = p_payment_proof,
        processed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_payment_id;
    
    -- Create confirmation notification
    INSERT INTO payment_notifications (payment_id, user_id, notification_type, message)
    SELECT 
        p_payment_id,
        finder_user_id,
        'payment_received',
        'Payment confirmed received - Transaction ID: ' || p_transaction_id
    FROM reward_payments
    WHERE id = p_payment_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Payment confirmation recorded'
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to get payment history
CREATE OR REPLACE FUNCTION get_payment_history(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'payment_id', rp.id,
            'report_id', rp.report_id,
            'amount', rp.amount,
            'currency', rp.currency,
            'payment_method', rp.payment_method,
            'status', rp.status,
            'transaction_id', rp.transaction_id,
            'payment_proof', rp.payment_proof,
            'created_at', rp.created_at,
            'processed_at', rp.processed_at,
            'device_info', json_build_object(
                'device_model', lfr.device_model,
                'device_category', lfr.device_category,
                'location', lfr.location_address
            )
        )
    ) INTO v_result
    FROM reward_payments rp
    JOIN lost_found_reports lfr ON rp.report_id = lfr.id
    WHERE rp.finder_user_id = p_user_id
    ORDER BY rp.created_at DESC;
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 8. Enable RLS
ALTER TABLE reward_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies
CREATE POLICY "Users can view their own payments" ON reward_payments
    FOR SELECT USING (finder_user_id = auth.uid() OR owner_user_id = auth.uid());

CREATE POLICY "Admins can manage all payments" ON reward_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own notifications" ON payment_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own payment methods" ON payment_methods
    FOR ALL USING (user_id = auth.uid());

-- 10. Insert sample payment methods for testing
INSERT INTO payment_methods (user_id, method_type, method_details, is_verified, is_primary)
SELECT 
    id,
    'bank_transfer',
    json_build_object(
        'bank_name', 'Standard Bank',
        'account_number', '1234567890',
        'branch_code', '051001'
    ),
    true,
    true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM payment_methods WHERE user_id IS NOT NULL)
LIMIT 5;

COMMIT;
