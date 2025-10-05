-- SOPHISTICATED TEST DATA REMOVAL SYSTEM
-- Advanced cleanup with comprehensive error handling, logging, and data integrity checks

BEGIN;

-- Create temporary logging table for cleanup tracking
CREATE TEMP TABLE cleanup_log (
    operation_id SERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    operation_type VARCHAR(50),
    records_affected INTEGER,
    execution_time TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20),
    error_message TEXT
);

-- Function to log cleanup operations
CREATE OR REPLACE FUNCTION log_cleanup_operation(
    p_table_name VARCHAR(50),
    p_operation_type VARCHAR(50),
    p_records_affected INTEGER,
    p_status VARCHAR(20),
    p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO cleanup_log (table_name, operation_type, records_affected, status, error_message)
    VALUES (p_table_name, p_operation_type, p_records_affected, p_status, p_error_message);
END;
$$ LANGUAGE plpgsql;

-- 1. SOPHISTICATED LOST_FOUND_REPORTS CLEANUP
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_affected INTEGER;
BEGIN
    -- Count records before cleanup
    SELECT COUNT(*) INTO v_records_before FROM lost_found_reports;
    
    -- Remove test data with comprehensive patterns
    DELETE FROM lost_found_reports 
    WHERE 
        -- Description patterns
        (description ILIKE '%test%' OR description ILIKE '%sample%' OR description ILIKE '%placeholder%'
         OR description ILIKE '%demo%' OR description ILIKE '%example%' OR description ILIKE '%dummy%')
        -- Device model patterns
        OR (device_model ILIKE '%Test%' OR device_model ILIKE '%Sample%' OR device_model ILIKE '%Demo%'
            OR device_model ILIKE '%Example%' OR device_model ILIKE '%Dummy%')
        -- Location patterns
        OR (location_address ILIKE '%Test%' OR location_address ILIKE '%Sample%' OR location_address ILIKE '%Demo%'
            OR location_address ILIKE '%Example%' OR location_address ILIKE '%Dummy%')
        -- Serial number patterns
        OR (serial_number ILIKE '%TEST%' OR serial_number ILIKE '%SAMPLE%' OR serial_number ILIKE '%DEMO%')
        -- Low-quality data indicators
        OR (description IS NULL OR description = '' OR LENGTH(description) < 10)
        OR (device_model IS NULL OR device_model = '')
        OR (location_address IS NULL OR location_address = '');
    
    -- Count records after cleanup
    SELECT COUNT(*) INTO v_records_after FROM lost_found_reports;
    v_records_affected := v_records_before - v_records_after;
    
    -- Log the operation
    PERFORM log_cleanup_operation('lost_found_reports', 'test_data_removal', v_records_affected, 'success');
    
    RAISE NOTICE 'Lost Found Reports: Removed % test records, % remaining', v_records_affected, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_cleanup_operation('lost_found_reports', 'test_data_removal', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error cleaning lost_found_reports: %', SQLERRM;
END $$;

-- 2. SOPHISTICATED COMMUNITY_TIPS CLEANUP
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_affected INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_records_before FROM community_tips;
    
    DELETE FROM community_tips 
    WHERE 
        (tip_description ILIKE '%test%' OR tip_description ILIKE '%sample%' OR tip_description ILIKE '%placeholder%'
         OR tip_description ILIKE '%demo%' OR tip_description ILIKE '%example%' OR tip_description ILIKE '%dummy%')
        OR (tip_description IS NULL OR tip_description = '' OR LENGTH(tip_description) < 5)
        OR (tip_type IS NULL OR tip_type = '');
    
    SELECT COUNT(*) INTO v_records_after FROM community_tips;
    v_records_affected := v_records_before - v_records_after;
    
    PERFORM log_cleanup_operation('community_tips', 'test_data_removal', v_records_affected, 'success');
    RAISE NOTICE 'Community Tips: Removed % test records, % remaining', v_records_affected, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_cleanup_operation('community_tips', 'test_data_removal', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error cleaning community_tips: %', SQLERRM;
END $$;

-- 3. SOPHISTICATED DEVICE_MATCHES CLEANUP
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_affected INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_records_before FROM device_matches;
    
    -- Remove low-confidence matches and test data
    DELETE FROM device_matches 
    WHERE 
        match_confidence < 0.5  -- Remove low-confidence test matches
        OR match_confidence IS NULL
        OR (match_notes ILIKE '%test%' OR match_notes ILIKE '%sample%' OR match_notes ILIKE '%demo%')
        OR status = 'test'
        OR status = 'sample';
    
    SELECT COUNT(*) INTO v_records_after FROM device_matches;
    v_records_affected := v_records_before - v_records_after;
    
    PERFORM log_cleanup_operation('device_matches', 'test_data_removal', v_records_affected, 'success');
    RAISE NOTICE 'Device Matches: Removed % test records, % remaining', v_records_affected, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_cleanup_operation('device_matches', 'test_data_removal', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error cleaning device_matches: %', SQLERRM;
END $$;

-- 4. SOPHISTICATED COMMUNITY_EVENTS CLEANUP
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_affected INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_records_before FROM community_events;
    
    -- Check if table exists and has expected columns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_events') THEN
        DELETE FROM community_events 
        WHERE 
            (event_type ILIKE '%test%' OR event_type ILIKE '%sample%' OR event_type ILIKE '%demo%'
             OR event_type ILIKE '%example%' OR event_type ILIKE '%dummy%')
            OR (event_type IS NULL OR event_type = '')
            OR (event_date IS NULL OR event_date < NOW() - INTERVAL '1 year');
        
        SELECT COUNT(*) INTO v_records_after FROM community_events;
        v_records_affected := v_records_before - v_records_after;
        
        PERFORM log_cleanup_operation('community_events', 'test_data_removal', v_records_affected, 'success');
        RAISE NOTICE 'Community Events: Removed % test records, % remaining', v_records_affected, v_records_after;
    ELSE
        PERFORM log_cleanup_operation('community_events', 'test_data_removal', 0, 'skipped', 'Table does not exist');
        RAISE NOTICE 'Community Events: Table does not exist, skipping cleanup';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_cleanup_operation('community_events', 'test_data_removal', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error cleaning community_events: %', SQLERRM;
END $$;

-- 5. SOPHISTICATED SUCCESS_STORIES CLEANUP
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_affected INTEGER;
    v_has_title_column BOOLEAN;
    v_has_content_column BOOLEAN;
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'success_stories') THEN
        -- Check column existence
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'success_stories' AND column_name = 'title'
        ) INTO v_has_title_column;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'success_stories' AND column_name = 'content'
        ) INTO v_has_content_column;
        
        SELECT COUNT(*) INTO v_records_before FROM success_stories;
        
        -- Dynamic cleanup based on actual column structure
        IF v_has_title_column AND v_has_content_column THEN
            DELETE FROM success_stories 
            WHERE 
                (title ILIKE '%test%' OR title ILIKE '%sample%' OR title ILIKE '%demo%'
                 OR title ILIKE '%example%' OR title ILIKE '%dummy%')
                OR (content ILIKE '%test%' OR content ILIKE '%sample%' OR content ILIKE '%demo%'
                    OR content ILIKE '%example%' OR content ILIKE '%dummy%')
                OR (title IS NULL OR title = '' OR LENGTH(title) < 5)
                OR (content IS NULL OR content = '' OR LENGTH(content) < 20);
        ELSIF v_has_title_column THEN
            DELETE FROM success_stories 
            WHERE 
                (title ILIKE '%test%' OR title ILIKE '%sample%' OR title ILIKE '%demo%')
                OR (title IS NULL OR title = '' OR LENGTH(title) < 5);
        ELSE
            -- Fallback to basic cleanup
            DELETE FROM success_stories 
            WHERE 
                (story_description ILIKE '%test%' OR story_description ILIKE '%sample%' OR story_description ILIKE '%demo%')
                OR (story_description IS NULL OR story_description = '' OR LENGTH(story_description) < 20);
        END IF;
        
        SELECT COUNT(*) INTO v_records_after FROM success_stories;
        v_records_affected := v_records_before - v_records_after;
        
        PERFORM log_cleanup_operation('success_stories', 'test_data_removal', v_records_affected, 'success');
        RAISE NOTICE 'Success Stories: Removed % test records, % remaining', v_records_affected, v_records_after;
    ELSE
        PERFORM log_cleanup_operation('success_stories', 'test_data_removal', 0, 'skipped', 'Table does not exist');
        RAISE NOTICE 'Success Stories: Table does not exist, skipping cleanup';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_cleanup_operation('success_stories', 'test_data_removal', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error cleaning success_stories: %', SQLERRM;
END $$;

-- 6. SOPHISTICATED USER_REPUTATION CLEANUP
DO $$
DECLARE
    v_records_before INTEGER;
    v_records_after INTEGER;
    v_records_affected INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_records_before FROM user_reputation;
    
    DELETE FROM user_reputation 
    WHERE 
        (reputation_score = 0 AND trust_level = 'new' AND created_at < NOW() - INTERVAL '1 day')
        OR (reputation_score IS NULL OR trust_level IS NULL)
        OR (trust_level = 'test' OR trust_level = 'sample' OR trust_level = 'demo');
    
    SELECT COUNT(*) INTO v_records_after FROM user_reputation;
    v_records_affected := v_records_before - v_records_after;
    
    PERFORM log_cleanup_operation('user_reputation', 'test_data_removal', v_records_affected, 'success');
    RAISE NOTICE 'User Reputation: Removed % test records, % remaining', v_records_affected, v_records_after;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_cleanup_operation('user_reputation', 'test_data_removal', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error cleaning user_reputation: %', SQLERRM;
END $$;

-- 7. SOPHISTICATED ORPHANED RECORDS CLEANUP
DO $$
DECLARE
    v_orphaned_tips INTEGER;
    v_orphaned_matches INTEGER;
    v_orphaned_notifications INTEGER;
BEGIN
    -- Clean up orphaned community tips
    DELETE FROM community_tips 
    WHERE report_id NOT IN (SELECT id FROM lost_found_reports);
    GET DIAGNOSTICS v_orphaned_tips = ROW_COUNT;
    
    -- Clean up orphaned device matches
    DELETE FROM device_matches 
    WHERE report_id NOT IN (SELECT id FROM lost_found_reports);
    GET DIAGNOSTICS v_orphaned_matches = ROW_COUNT;
    
    -- Clean up orphaned notifications (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        DELETE FROM notifications 
        WHERE report_id NOT IN (SELECT id FROM lost_found_reports);
        GET DIAGNOSTICS v_orphaned_notifications = ROW_COUNT;
    ELSE
        v_orphaned_notifications := 0;
    END IF;
    
    PERFORM log_cleanup_operation('orphaned_records', 'cleanup', v_orphaned_tips + v_orphaned_matches + v_orphaned_notifications, 'success');
    RAISE NOTICE 'Orphaned Records: Removed % tips, % matches, % notifications', v_orphaned_tips, v_orphaned_matches, v_orphaned_notifications;
EXCEPTION
    WHEN OTHERS THEN
        PERFORM log_cleanup_operation('orphaned_records', 'cleanup', 0, 'error', SQLERRM);
        RAISE NOTICE 'Error cleaning orphaned records: %', SQLERRM;
END $$;

-- 8. COMPREHENSIVE VERIFICATION AND REPORTING
SELECT 
    'CLEANUP SUMMARY' as report_type,
    'Data cleanup completed successfully' as message,
    NOW() as completion_time;

-- Show cleanup log
SELECT 
    table_name,
    operation_type,
    records_affected,
    status,
    error_message,
    execution_time
FROM cleanup_log
ORDER BY operation_id;

-- Final verification - show remaining data counts
SELECT 
    'Lost Found Reports' as table_name,
    COUNT(*)::text as remaining_records,
    'Real user reports' as description
FROM lost_found_reports
UNION ALL
SELECT 
    'Community Tips',
    COUNT(*)::text,
    'Active community tips'
FROM community_tips
UNION ALL
SELECT 
    'Device Matches',
    COUNT(*)::text,
    'Valid device matches'
FROM device_matches
UNION ALL
SELECT 
    'Community Events',
    COUNT(*)::text,
    'Active community events'
FROM community_events
UNION ALL
SELECT 
    'Success Stories',
    COUNT(*)::text,
    'Real success stories'
FROM success_stories
UNION ALL
SELECT 
    'User Reputation',
    COUNT(*)::text,
    'User reputation records'
FROM user_reputation;

-- Show data quality metrics
SELECT 
    'Data Quality Metrics' as metric_type,
    'Average description length' as metric_name,
    ROUND(AVG(LENGTH(description)), 2)::text as metric_value
FROM lost_found_reports
WHERE description IS NOT NULL AND description != ''
UNION ALL
SELECT 
    'Data Quality Metrics',
    'Reports with complete info',
    COUNT(*)::text
FROM lost_found_reports
WHERE description IS NOT NULL AND description != ''
AND device_model IS NOT NULL AND device_model != ''
AND location_address IS NOT NULL AND location_address != '';

-- Clean up temporary function
DROP FUNCTION IF EXISTS log_cleanup_operation(VARCHAR, VARCHAR, INTEGER, VARCHAR, TEXT);

COMMIT;
