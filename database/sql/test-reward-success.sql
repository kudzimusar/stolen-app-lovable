-- SOPHISTICATED REWARD SUCCESS TESTING SYSTEM
-- Advanced testing with comprehensive error handling, logging, and validation

BEGIN;

-- Create comprehensive testing log table
CREATE TEMP TABLE reward_test_log (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_phase VARCHAR(50),
    test_status VARCHAR(20),
    records_affected INTEGER,
    execution_time TIMESTAMP DEFAULT NOW(),
    error_message TEXT,
    test_results JSONB
);

-- Function to log test operations
CREATE OR REPLACE FUNCTION log_reward_test(
    p_test_name VARCHAR(100),
    p_test_phase VARCHAR(50),
    p_test_status VARCHAR(20),
    p_records_affected INTEGER DEFAULT 0,
    p_error_message TEXT DEFAULT NULL,
    p_test_results JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO reward_test_log (test_name, test_phase, test_status, records_affected, error_message, test_results)
    VALUES (p_test_name, p_test_phase, p_test_status, p_records_affected, p_error_message, p_test_results);
END;
$$ LANGUAGE plpgsql;

-- 1. COMPREHENSIVE SYSTEM PREREQUISITES CHECK
DO $$
DECLARE
    v_reward_payments_exists BOOLEAN;
    v_payment_notifications_exists BOOLEAN;
    v_payment_methods_exists BOOLEAN;
    v_reunited_devices_count INTEGER;
    v_users_count INTEGER;
    v_test_results JSONB;
BEGIN
    -- Check if reward payment system tables exist
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reward_payments') INTO v_reward_payments_exists;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_notifications') INTO v_payment_notifications_exists;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_methods') INTO v_payment_methods_exists;
    
    -- Count reunited devices and users
    SELECT COUNT(*) INTO v_reunited_devices_count FROM lost_found_reports WHERE status = 'reunited';
    SELECT COUNT(*) INTO v_users_count FROM auth.users;
    
    v_test_results := json_build_object(
        'reward_payments_table', v_reward_payments_exists,
        'payment_notifications_table', v_payment_notifications_exists,
        'payment_methods_table', v_payment_methods_exists,
        'reunited_devices_count', v_reunited_devices_count,
        'users_count', v_users_count
    );
    
    PERFORM log_reward_test('system_prerequisites', 'check', 'success', 0, NULL, v_test_results);
    
    IF NOT v_reward_payments_exists THEN
        RAISE NOTICE 'WARNING: Reward payments table does not exist. Run reward-payment-system.sql first.';
    END IF;
    
    RAISE NOTICE 'System Check: % reunited devices, % users, Payment tables: %', 
        v_reunited_devices_count, v_users_count, v_reward_payments_exists;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_reward_test('system_prerequisites', 'check', 'error', 0, SQLERRM, NULL);
        RAISE NOTICE 'Error checking system prerequisites: %', SQLERRM;
END $$;

-- 2. SOPHISTICATED REUNITED DEVICES ANALYSIS
DO $$
DECLARE
    v_reunited_count INTEGER;
    v_reward_eligible_count INTEGER;
    v_high_value_rewards_count INTEGER;
    v_test_results JSONB;
BEGIN
    -- Count reunited devices
    SELECT COUNT(*) INTO v_reunited_count FROM lost_found_reports WHERE status = 'reunited';
    
    -- Count devices eligible for rewards
    SELECT COUNT(*) INTO v_reward_eligible_count 
    FROM lost_found_reports 
    WHERE status = 'reunited' AND reward_amount > 0;
    
    -- Count high-value rewards
    SELECT COUNT(*) INTO v_high_value_rewards_count 
    FROM lost_found_reports 
    WHERE status = 'reunited' AND reward_amount >= 1000;
    
    v_test_results := json_build_object(
        'total_reunited', v_reunited_count,
        'reward_eligible', v_reward_eligible_count,
        'high_value_rewards', v_high_value_rewards_count,
        'average_reward', CASE 
            WHEN v_reward_eligible_count > 0 THEN 
                (SELECT ROUND(AVG(reward_amount), 2) FROM lost_found_reports WHERE status = 'reunited' AND reward_amount > 0)
            ELSE 0 
        END
    );
    
    PERFORM log_reward_test('reunited_devices_analysis', 'analysis', 'success', v_reunited_count, NULL, v_test_results);
    
    RAISE NOTICE 'Reunited Devices Analysis: % total, % eligible for rewards, % high-value (R1000+)', 
        v_reunited_count, v_reward_eligible_count, v_high_value_rewards_count;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_reward_test('reunited_devices_analysis', 'analysis', 'error', 0, SQLERRM, NULL);
        RAISE NOTICE 'Error analyzing reunited devices: %', SQLERRM;
END $$;

-- 3. ADVANCED REWARD PAYMENT SIMULATION
DO $$
DECLARE
    v_report_id UUID;
    v_finder_id UUID;
    v_owner_id UUID;
    v_reward_amount DECIMAL(10,2);
    v_payment_id UUID;
    v_simulation_results JSONB;
    v_payment_methods TEXT[];
    v_selected_method TEXT;
    v_transaction_id VARCHAR(255);
BEGIN
    -- Get a reunited device with reward
    SELECT id, user_id, reward_amount
    INTO v_report_id, v_owner_id, v_reward_amount
    FROM lost_found_reports 
    WHERE status = 'reunited' 
    AND reward_amount > 0
    ORDER BY reward_amount DESC
    LIMIT 1;
    
    IF v_report_id IS NOT NULL THEN
        -- Get a finder user (preferably different from owner)
        SELECT id INTO v_finder_id
        FROM auth.users 
        WHERE id != v_owner_id
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF v_finder_id IS NOT NULL THEN
            -- Simulate different payment methods
            v_payment_methods := ARRAY['bank_transfer', 'mobile_money', 'crypto', 'cash_pickup'];
            v_selected_method := v_payment_methods[floor(random() * array_length(v_payment_methods, 1)) + 1];
            
            -- Create payment record with sophisticated details
            INSERT INTO reward_payments (
                report_id,
                finder_user_id,
                owner_user_id,
                amount,
                currency,
                payment_method,
                payment_details,
                status,
                processed_by
            ) VALUES (
                v_report_id,
                v_finder_id,
                v_owner_id,
                v_reward_amount,
                'ZAR',
                v_selected_method,
                CASE v_selected_method
                    WHEN 'bank_transfer' THEN json_build_object(
                        'bank_name', 'Standard Bank',
                        'account_number', '1234567890',
                        'branch_code', '051001',
                        'account_holder', 'Test Finder'
                    )
                    WHEN 'mobile_money' THEN json_build_object(
                        'provider', 'M-Pesa',
                        'phone_number', '+27821234567',
                        'account_name', 'Test Finder'
                    )
                    WHEN 'crypto' THEN json_build_object(
                        'wallet_address', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                        'cryptocurrency', 'Bitcoin',
                        'network', 'Bitcoin'
                    )
                    ELSE json_build_object(
                        'pickup_location', 'Cape Town CBD',
                        'contact_person', 'Test Finder',
                        'phone_number', '+27821234567'
                    )
                END,
                'processing',
                v_owner_id
            ) RETURNING id INTO v_payment_id;
            
            -- Generate transaction ID
            v_transaction_id := 'TXN-' || extract(epoch from now())::bigint || '-' || substring(v_payment_id::text, 1, 8);
            
            -- Simulate payment confirmation
            UPDATE reward_payments 
            SET 
                status = 'completed',
                transaction_id = v_transaction_id,
                payment_proof = 'Simulated payment confirmation - ' || v_selected_method || ' transaction completed',
                processed_at = NOW()
            WHERE id = v_payment_id;
            
            -- Create notifications
            INSERT INTO payment_notifications (payment_id, user_id, notification_type, message, email_sent, in_app_sent)
            VALUES 
                (v_payment_id, v_finder_id, 'payment_received', 
                 'Your reward of R' || v_reward_amount || ' has been sent via ' || v_selected_method, 
                 true, true),
                (v_payment_id, v_owner_id, 'payment_sent', 
                 'Reward payment of R' || v_reward_amount || ' has been processed for your device recovery', 
                 true, true);
            
            v_simulation_results := json_build_object(
                'payment_id', v_payment_id,
                'report_id', v_report_id,
                'finder_id', v_finder_id,
                'owner_id', v_owner_id,
                'amount', v_reward_amount,
                'payment_method', v_selected_method,
                'transaction_id', v_transaction_id,
                'status', 'completed'
            );
            
            PERFORM log_reward_test('reward_payment_simulation', 'simulation', 'success', 1, NULL, v_simulation_results);
            RAISE NOTICE 'Reward Payment Simulation: Created payment % for R% via %', v_payment_id, v_reward_amount, v_selected_method;
        ELSE
            PERFORM log_reward_test('reward_payment_simulation', 'simulation', 'skipped', 0, 'No finder user available', NULL);
            RAISE NOTICE 'No finder user found for reward simulation';
        END IF;
    ELSE
        PERFORM log_reward_test('reward_payment_simulation', 'simulation', 'skipped', 0, 'No reunited devices with rewards', NULL);
        RAISE NOTICE 'No reunited devices with rewards found for simulation';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_reward_test('reward_payment_simulation', 'simulation', 'error', 0, SQLERRM, NULL);
        RAISE NOTICE 'Error in reward payment simulation: %', SQLERRM;
END $$;

-- 4. COMPREHENSIVE PAYMENT TRACKING ANALYSIS
DO $$
DECLARE
    v_total_payments INTEGER;
    v_completed_payments INTEGER;
    v_processing_payments INTEGER;
    v_failed_payments INTEGER;
    v_total_amount DECIMAL(12,2);
    v_payment_methods_stats JSONB;
    v_analysis_results JSONB;
BEGIN
    -- Count payment statistics
    SELECT COUNT(*) INTO v_total_payments FROM reward_payments;
    SELECT COUNT(*) INTO v_completed_payments FROM reward_payments WHERE status = 'completed';
    SELECT COUNT(*) INTO v_processing_payments FROM reward_payments WHERE status = 'processing';
    SELECT COUNT(*) INTO v_failed_payments FROM reward_payments WHERE status = 'failed';
    
    -- Calculate total amount
    SELECT COALESCE(SUM(amount), 0) INTO v_total_amount FROM reward_payments WHERE status = 'completed';
    
    -- Analyze payment methods
    SELECT json_object_agg(payment_method, method_count) INTO v_payment_methods_stats
    FROM (
        SELECT payment_method, COUNT(*) as method_count
        FROM reward_payments
        GROUP BY payment_method
    ) method_stats;
    
    v_analysis_results := json_build_object(
        'total_payments', v_total_payments,
        'completed_payments', v_completed_payments,
        'processing_payments', v_processing_payments,
        'failed_payments', v_failed_payments,
        'total_amount_paid', v_total_amount,
        'payment_methods_breakdown', v_payment_methods_stats,
        'success_rate', CASE 
            WHEN v_total_payments > 0 THEN ROUND((v_completed_payments::DECIMAL / v_total_payments) * 100, 2)
            ELSE 0 
        END
    );
    
    PERFORM log_reward_test('payment_tracking_analysis', 'analysis', 'success', v_total_payments, NULL, v_analysis_results);
    
    RAISE NOTICE 'Payment Analysis: % total, % completed (R%), % processing, % failed', 
        v_total_payments, v_completed_payments, v_total_amount, v_processing_payments, v_failed_payments;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_reward_test('payment_tracking_analysis', 'analysis', 'error', 0, SQLERRM, NULL);
        RAISE NOTICE 'Error in payment tracking analysis: %', SQLERRM;
END $$;

-- 5. NOTIFICATION SYSTEM VALIDATION
DO $$
DECLARE
    v_notifications_count INTEGER;
    v_email_notifications INTEGER;
    v_sms_notifications INTEGER;
    v_in_app_notifications INTEGER;
    v_notification_types JSONB;
    v_validation_results JSONB;
BEGIN
    -- Count notification statistics
    SELECT COUNT(*) INTO v_notifications_count FROM payment_notifications;
    SELECT COUNT(*) INTO v_email_notifications FROM payment_notifications WHERE email_sent = true;
    SELECT COUNT(*) INTO v_sms_notifications FROM payment_notifications WHERE sms_sent = true;
    SELECT COUNT(*) INTO v_in_app_notifications FROM payment_notifications WHERE in_app_sent = true;
    
    -- Analyze notification types
    SELECT json_object_agg(notification_type, type_count) INTO v_notification_types
    FROM (
        SELECT notification_type, COUNT(*) as type_count
        FROM payment_notifications
        GROUP BY notification_type
    ) type_stats;
    
    v_validation_results := json_build_object(
        'total_notifications', v_notifications_count,
        'email_notifications', v_email_notifications,
        'sms_notifications', v_sms_notifications,
        'in_app_notifications', v_in_app_notifications,
        'notification_types', v_notification_types,
        'delivery_rate', CASE 
            WHEN v_notifications_count > 0 THEN ROUND(((v_email_notifications + v_sms_notifications + v_in_app_notifications)::DECIMAL / v_notifications_count) * 100, 2)
            ELSE 0 
        END
    );
    
    PERFORM log_reward_test('notification_validation', 'validation', 'success', v_notifications_count, NULL, v_validation_results);
    
    RAISE NOTICE 'Notification Validation: % total, % email, % SMS, % in-app', 
        v_notifications_count, v_email_notifications, v_sms_notifications, v_in_app_notifications;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_reward_test('notification_validation', 'validation', 'error', 0, SQLERRM, NULL);
        RAISE NOTICE 'Error in notification validation: %', SQLERRM;
END $$;

-- 6. COMPREHENSIVE TEST RESULTS REPORTING
SELECT 
    'REWARD TESTING SUMMARY' as report_type,
    'Advanced reward system testing completed' as message,
    NOW() as completion_time;

-- Show detailed test log
SELECT 
    test_name,
    test_phase,
    test_status,
    records_affected,
    error_message,
    test_results,
    execution_time
FROM reward_test_log
ORDER BY test_id;

-- Final comprehensive statistics
SELECT 
    'Final Statistics' as metric_type,
    'Total Payments' as metric_name,
    COALESCE(COUNT(*)::text, '0') as metric_value
FROM reward_payments
UNION ALL
SELECT 
    'Final Statistics',
    'Completed Payments',
    COALESCE(COUNT(*)::text, '0')
FROM reward_payments 
WHERE status = 'completed'
UNION ALL
SELECT 
    'Final Statistics',
    'Total Amount Paid',
    'R' || COALESCE(SUM(amount), 0)::text
FROM reward_payments 
WHERE status = 'completed'
UNION ALL
SELECT 
    'Final Statistics',
    'Total Notifications',
    COALESCE(COUNT(*)::text, '0')
FROM payment_notifications
UNION ALL
SELECT 
    'Final Statistics',
    'Success Rate',
    COALESCE(ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2)::text, '0') || '%'
FROM reward_payments;

-- Clean up temporary function
DROP FUNCTION IF EXISTS log_reward_test(VARCHAR, VARCHAR, VARCHAR, INTEGER, TEXT, JSONB);

COMMIT;
