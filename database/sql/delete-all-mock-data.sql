-- DELETE ALL MOCK DATA RECORDS
-- This script removes all remaining mock/test data from the database

BEGIN;

-- Create logging for deletion tracking
CREATE TEMP TABLE deletion_log (
    operation_id SERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    deletion_type VARCHAR(50),
    records_deleted INTEGER,
    execution_time TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20),
    error_message TEXT
);

-- Function to log deletion operations
CREATE OR REPLACE FUNCTION log_deletion_operation(
    p_table_name VARCHAR(50),
    p_deletion_type VARCHAR(50),
    p_records_deleted INTEGER,
    p_status VARCHAR(20),
    p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO deletion_log (table_name, deletion_type, records_deleted, status, error_message)
    VALUES (p_table_name, p_deletion_type, p_records_deleted, p_status, p_error_message);
END;
$$ LANGUAGE plpgsql;

-- 1. DELETE ALL LOST_FOUND_REPORTS (Complete cleanup)
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    -- Count records before deletion
    SELECT COUNT(*) INTO v_records_before FROM lost_found_reports;
    
    -- Delete ALL records from lost_found_reports
    DELETE FROM lost_found_reports;
    
    -- Count records after deletion
    SELECT COUNT(*) INTO v_records_after FROM lost_found_reports;
    v_records_deleted := v_records_before - v_records_after;
    
    -- Log the operation
    PERFORM log_deletion_operation('lost_found_reports', 'complete_cleanup', v_records_deleted, 'success');
    
    RAISE NOTICE 'Lost Found Reports: Deleted % records, % remaining', v_records_deleted, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('lost_found_reports', 'complete_cleanup', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting lost_found_reports: %', SQLERRM;
END $$;

-- 2. DELETE ALL COMMUNITY_TIPS
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_records_before FROM community_tips;
    
    DELETE FROM community_tips;
    
    SELECT COUNT(*) INTO v_records_after FROM community_tips;
    v_records_deleted := v_records_before - v_records_after;
    
    PERFORM log_deletion_operation('community_tips', 'complete_cleanup', v_records_deleted, 'success');
    RAISE NOTICE 'Community Tips: Deleted % records, % remaining', v_records_deleted, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('community_tips', 'complete_cleanup', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting community_tips: %', SQLERRM;
END $$;

-- 3. DELETE ALL DEVICE_MATCHES
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_records_before FROM device_matches;
    
    DELETE FROM device_matches;
    
    SELECT COUNT(*) INTO v_records_after FROM device_matches;
    v_records_deleted := v_records_before - v_records_after;
    
    PERFORM log_deletion_operation('device_matches', 'complete_cleanup', v_records_deleted, 'success');
    RAISE NOTICE 'Device Matches: Deleted % records, % remaining', v_records_deleted, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('device_matches', 'complete_cleanup', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting device_matches: %', SQLERRM;
END $$;

-- 4. DELETE ALL COMMUNITY_EVENTS
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_events') THEN
        SELECT COUNT(*) INTO v_records_before FROM community_events;
        
        DELETE FROM community_events;
        
        SELECT COUNT(*) INTO v_records_after FROM community_events;
        v_records_deleted := v_records_before - v_records_after;
        
        PERFORM log_deletion_operation('community_events', 'complete_cleanup', v_records_deleted, 'success');
        RAISE NOTICE 'Community Events: Deleted % records, % remaining', v_records_deleted, v_records_after;
    ELSE
        PERFORM log_deletion_operation('community_events', 'complete_cleanup', 0, 'skipped', 'Table does not exist');
        RAISE NOTICE 'Community Events: Table does not exist, skipping deletion';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('community_events', 'complete_cleanup', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting community_events: %', SQLERRM;
END $$;

-- 5. DELETE ALL SUCCESS_STORIES
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'success_stories') THEN
        SELECT COUNT(*) INTO v_records_before FROM success_stories;
        
        DELETE FROM success_stories;
        
        SELECT COUNT(*) INTO v_records_after FROM success_stories;
        v_records_deleted := v_records_before - v_records_after;
        
        PERFORM log_deletion_operation('success_stories', 'complete_cleanup', v_records_deleted, 'success');
        RAISE NOTICE 'Success Stories: Deleted % records, % remaining', v_records_deleted, v_records_after;
    ELSE
        PERFORM log_deletion_operation('success_stories', 'complete_cleanup', 0, 'skipped', 'Table does not exist');
        RAISE NOTICE 'Success Stories: Table does not exist, skipping deletion';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('success_stories', 'complete_cleanup', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting success_stories: %', SQLERRM;
END $$;

-- 6. DELETE ALL USER_REPUTATION
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_records_before FROM user_reputation;
    
    DELETE FROM user_reputation;
    
    SELECT COUNT(*) INTO v_records_after FROM user_reputation;
    v_records_deleted := v_records_before - v_records_after;
    
    PERFORM log_deletion_operation('user_reputation', 'complete_cleanup', v_records_deleted, 'success');
    RAISE NOTICE 'User Reputation: Deleted % records, % remaining', v_records_deleted, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('user_reputation', 'complete_cleanup', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting user_reputation: %', SQLERRM;
END $$;

-- 7. DELETE ALL NOTIFICATIONS
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        SELECT COUNT(*) INTO v_records_before FROM notifications;
        
        DELETE FROM notifications;
        
        SELECT COUNT(*) INTO v_records_after FROM notifications;
        v_records_deleted := v_records_before - v_records_after;
        
        PERFORM log_deletion_operation('notifications', 'complete_cleanup', v_records_deleted, 'success');
        RAISE NOTICE 'Notifications: Deleted % records, % remaining', v_records_deleted, v_records_after;
    ELSE
        PERFORM log_deletion_operation('notifications', 'complete_cleanup', 0, 'skipped', 'Table does not exist');
        RAISE NOTICE 'Notifications: Table does not exist, skipping deletion';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('notifications', 'complete_cleanup', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting notifications: %', SQLERRM;
END $$;

-- 8. DELETE ALL REWARD_PAYMENTS
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reward_payments') THEN
        SELECT COUNT(*) INTO v_records_before FROM reward_payments;
        
        DELETE FROM reward_payments;
        
        SELECT COUNT(*) INTO v_records_after FROM reward_payments;
        v_records_deleted := v_records_before - v_records_after;
        
        PERFORM log_deletion_operation('reward_payments', 'complete_cleanup', v_records_deleted, 'success');
        RAISE NOTICE 'Reward Payments: Deleted % records, % remaining', v_records_deleted, v_records_after;
    ELSE
        PERFORM log_deletion_operation('reward_payments', 'complete_cleanup', 0, 'skipped', 'Table does not exist');
        RAISE NOTICE 'Reward Payments: Table does not exist, skipping deletion';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('reward_payments', 'complete_cleanup', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting reward_payments: %', SQLERRM;
END $$;

-- 9. DELETE ALL PAYMENT_NOTIFICATIONS
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_notifications') THEN
        SELECT COUNT(*) INTO v_records_before FROM payment_notifications;
        
        DELETE FROM payment_notifications;
        
        SELECT COUNT(*) INTO v_records_after FROM payment_notifications;
        v_records_deleted := v_records_before - v_records_after;
        
        PERFORM log_deletion_operation('payment_notifications', 'complete_cleanup', v_records_deleted, 'success');
        RAISE NOTICE 'Payment Notifications: Deleted % records, % remaining', v_records_deleted, v_records_after;
    ELSE
        PERFORM log_deletion_operation('payment_notifications', 'complete_cleanup', 0, 'skipped', 'Table does not exist');
        RAISE NOTICE 'Payment Notifications: Table does not exist, skipping deletion';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('payment_notifications', 'complete_cleanup', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting payment_notifications: %', SQLERRM;
END $$;

-- 10. COMPREHENSIVE DELETION SUMMARY
SELECT 
    'DELETION SUMMARY' as report_type,
    'All mock data records deleted successfully' as message,
    NOW() as completion_time;

-- Show deletion log
SELECT 
    table_name,
    deletion_type,
    records_deleted,
    status,
    error_message,
    execution_time
FROM deletion_log
ORDER BY operation_id;

-- Final verification - show remaining data counts (should all be 0)
-- Only check tables that exist
SELECT 
    'Lost Found Reports' as table_name,
    COUNT(*)::text as remaining_records,
    'Should be 0' as description
FROM lost_found_reports
UNION ALL
SELECT 
    'Community Tips',
    COUNT(*)::text,
    'Should be 0'
FROM community_tips
UNION ALL
SELECT 
    'Device Matches',
    COUNT(*)::text,
    'Should be 0'
FROM device_matches
UNION ALL
SELECT 
    'User Reputation',
    COUNT(*)::text,
    'Should be 0'
FROM user_reputation;

-- Check optional tables only if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_events') THEN
        EXECUTE 'SELECT ''Community Events'' as table_name, COUNT(*)::text as remaining_records, ''Should be 0'' as description FROM community_events';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'success_stories') THEN
        EXECUTE 'SELECT ''Success Stories'' as table_name, COUNT(*)::text as remaining_records, ''Should be 0'' as description FROM success_stories';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        EXECUTE 'SELECT ''Notifications'' as table_name, COUNT(*)::text as remaining_records, ''Should be 0'' as description FROM notifications';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reward_payments') THEN
        EXECUTE 'SELECT ''Reward Payments'' as table_name, COUNT(*)::text as remaining_records, ''Should be 0'' as description FROM reward_payments';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_notifications') THEN
        EXECUTE 'SELECT ''Payment Notifications'' as table_name, COUNT(*)::text as remaining_records, ''Should be 0'' as description FROM payment_notifications';
    END IF;
END $$;

-- Clean up temporary function
DROP FUNCTION IF EXISTS log_deletion_operation(VARCHAR, VARCHAR, INTEGER, VARCHAR, TEXT);

COMMIT;
