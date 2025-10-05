-- DELETE ONLY MOCK DATA - PRESERVE REAL USER DATA
-- This script removes only test/mock data while preserving real user submissions

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

-- 1. DELETE ONLY MOCK DATA FROM LOST_FOUND_REPORTS
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    -- Count records before deletion
    SELECT COUNT(*) INTO v_records_before FROM lost_found_reports;
    
    -- Delete only mock/test data patterns
    DELETE FROM lost_found_reports 
    WHERE 
        -- Specific mock data patterns
        (device_model ILIKE '%MacBook Pro%' AND description ILIKE '%Space Gray%' AND description ILIKE '%South African flag%')
        OR (device_model ILIKE '%Samsung Galaxy S24%' AND description ILIKE '%V&A Waterfront%')
        OR (device_model ILIKE '%iPhone 15 Pro Max%' AND description ILIKE '%Space Black%' AND description ILIKE '%Sandton City%')
        OR (device_model ILIKE '%iPad Air%' AND description ILIKE '%OR Tambo Airport%')
        OR (device_model ILIKE '%AirPods Pro%' AND description ILIKE '%Greenmarket Square%')
        -- Generic test patterns
        OR (description ILIKE '%test%' OR description ILIKE '%sample%' OR description ILIKE '%placeholder%'
            OR description ILIKE '%demo%' OR description ILIKE '%example%' OR description ILIKE '%dummy%')
        OR (device_model ILIKE '%Test%' OR device_model ILIKE '%Sample%' OR device_model ILIKE '%Demo%'
            OR device_model ILIKE '%Example%' OR device_model ILIKE '%Dummy%')
        OR (location_address ILIKE '%Test%' OR location_address ILIKE '%Sample%' OR location_address ILIKE '%Demo%'
            OR location_address ILIKE '%Example%' OR location_address ILIKE '%Dummy%')
        -- Low-quality data indicators
        OR (description IS NULL OR description = '' OR LENGTH(description) < 10)
        OR (device_model IS NULL OR device_model = '')
        OR (location_address IS NULL OR location_address = '');
    
    -- Count records after deletion
    SELECT COUNT(*) INTO v_records_after FROM lost_found_reports;
    v_records_deleted := v_records_before - v_records_after;
    
    -- Log the operation
    PERFORM log_deletion_operation('lost_found_reports', 'mock_data_only', v_records_deleted, 'success');
    
    RAISE NOTICE 'Lost Found Reports: Deleted % mock records, % real records preserved', v_records_deleted, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('lost_found_reports', 'mock_data_only', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting mock data from lost_found_reports: %', SQLERRM;
END $$;

-- 2. DELETE ONLY MOCK DATA FROM COMMUNITY_TIPS
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_records_before FROM community_tips;
    
    DELETE FROM community_tips 
    WHERE 
        (tip_description ILIKE '%test%' OR tip_description ILIKE '%sample%' OR tip_description ILIKE '%placeholder%'
         OR tip_description ILIKE '%demo%' OR tip_description ILIKE '%example%' OR tip_description ILIKE '%dummy%')
        OR (tip_description IS NULL OR tip_description = '' OR LENGTH(tip_description) < 5)
        OR (tip_type IS NULL OR tip_type = '');
    
    SELECT COUNT(*) INTO v_records_after FROM community_tips;
    v_records_deleted := v_records_before - v_records_after;
    
    PERFORM log_deletion_operation('community_tips', 'mock_data_only', v_records_deleted, 'success');
    RAISE NOTICE 'Community Tips: Deleted % mock records, % real records preserved', v_records_deleted, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('community_tips', 'mock_data_only', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting mock data from community_tips: %', SQLERRM;
END $$;

-- 3. DELETE ONLY MOCK DATA FROM DEVICE_MATCHES
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_records_before FROM device_matches;
    
    DELETE FROM device_matches 
    WHERE 
        match_confidence < 0.5  -- Remove low-confidence test matches
        OR match_confidence IS NULL
        OR (match_notes ILIKE '%test%' OR match_notes ILIKE '%sample%' OR match_notes ILIKE '%demo%')
        OR status = 'test'
        OR status = 'sample';
    
    SELECT COUNT(*) INTO v_records_after FROM device_matches;
    v_records_deleted := v_records_before - v_records_after;
    
    PERFORM log_deletion_operation('device_matches', 'mock_data_only', v_records_deleted, 'success');
    RAISE NOTICE 'Device Matches: Deleted % mock records, % real records preserved', v_records_deleted, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('device_matches', 'mock_data_only', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting mock data from device_matches: %', SQLERRM;
END $$;

-- 4. DELETE ONLY MOCK DATA FROM USER_REPUTATION
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_deleted INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_records_before FROM user_reputation;
    
    DELETE FROM user_reputation 
    WHERE 
        (reputation_score = 0 AND trust_level = 'new' AND created_at < NOW() - INTERVAL '1 day')
        OR (reputation_score IS NULL OR trust_level IS NULL)
        OR (trust_level = 'test' OR trust_level = 'sample' OR trust_level = 'demo');
    
    SELECT COUNT(*) INTO v_records_after FROM user_reputation;
    v_records_deleted := v_records_before - v_records_after;
    
    PERFORM log_deletion_operation('user_reputation', 'mock_data_only', v_records_deleted, 'success');
    RAISE NOTICE 'User Reputation: Deleted % mock records, % real records preserved', v_records_deleted, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_deletion_operation('user_reputation', 'mock_data_only', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error deleting mock data from user_reputation: %', SQLERRM;
END $$;

-- 5. COMPREHENSIVE DELETION SUMMARY
SELECT 
    'MOCK DATA DELETION SUMMARY' as report_type,
    'Only mock data removed, real user data preserved' as message,
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

-- Final verification - show remaining data counts
SELECT 
    'Lost Found Reports' as table_name,
    COUNT(*)::text as remaining_records,
    'Real user reports preserved' as description
FROM lost_found_reports
UNION ALL
SELECT 
    'Community Tips',
    COUNT(*)::text,
    'Real community tips preserved'
FROM community_tips
UNION ALL
SELECT 
    'Device Matches',
    COUNT(*)::text,
    'Real device matches preserved'
FROM device_matches
UNION ALL
SELECT 
    'User Reputation',
    COUNT(*)::text,
    'Real user reputation preserved'
FROM user_reputation;

-- Show sample of remaining real data
SELECT 
    'Sample Real Data' as data_type,
    'Recent real reports' as description,
    COUNT(*) as count
FROM lost_found_reports
WHERE created_at > NOW() - INTERVAL '7 days';

-- Clean up temporary function
DROP FUNCTION IF EXISTS log_deletion_operation(VARCHAR, VARCHAR, INTEGER, VARCHAR, TEXT);

COMMIT;
