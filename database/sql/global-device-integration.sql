-- GLOBAL DEVICE IDENTIFICATION INTEGRATION
-- Integrates enhanced device identification across the entire STOLEN app

BEGIN;

-- 1. ENHANCE LOST_FOUND_REPORTS TABLE WITH COMPREHENSIVE IDENTIFICATION
ALTER TABLE lost_found_reports 
ADD COLUMN IF NOT EXISTS device_imei_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_mac_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_wifi_mac VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_bluetooth_mac VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_udid VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_android_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS identification_confidence INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS device_identifier_type VARCHAR(50) DEFAULT 'serial_only',
ADD COLUMN IF NOT EXISTS duplicate_check_hash VARCHAR(255);

-- 2. ENHANCE COMMUNITY_TIPS TABLE
ALTER TABLE community_tips 
ADD COLUMN IF NOT EXISTS device_serial_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_imei_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_mac_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS identification_confidence INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS device_identifier_type VARCHAR(50) DEFAULT 'serial_only';

-- 3. ENHANCE DEVICE_MATCHES TABLE
ALTER TABLE device_matches 
ADD COLUMN IF NOT EXISTS match_confidence INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS match_type VARCHAR(50) DEFAULT 'serial_match', -- 'serial_match', 'imei_match', 'mac_match', 'comprehensive_match'
ADD COLUMN IF NOT EXISTS identification_quality JSONB;

-- 4. CREATE GLOBAL DEVICE SEARCH FUNCTION
CREATE OR REPLACE FUNCTION global_device_search(
    p_search_term TEXT,
    p_search_type VARCHAR(50) DEFAULT 'all' -- 'all', 'serial', 'imei', 'mac', 'model'
)
RETURNS TABLE (
    result_type VARCHAR(50),
    result_id UUID,
    device_model TEXT,
    device_category TEXT,
    serial_number TEXT,
    imei_number TEXT,
    mac_address TEXT,
    identifier_type TEXT,
    confidence_score INTEGER,
    match_type TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    -- Search in lost_found_reports
    RETURN QUERY
    SELECT 
        'lost_found_report'::VARCHAR(50) as result_type,
        lfr.id,
        lfr.device_model,
        lfr.device_category,
        lfr.serial_number,
        lfr.device_imei_number,
        lfr.device_mac_address,
        lfr.device_identifier_type,
        lfr.identification_confidence,
        CASE 
            WHEN p_search_type = 'serial' OR (p_search_type = 'all' AND lfr.serial_number ILIKE '%' || p_search_term || '%') THEN 'serial_match'
            WHEN p_search_type = 'imei' OR (p_search_type = 'all' AND lfr.device_imei_number ILIKE '%' || p_search_term || '%') THEN 'imei_match'
            WHEN p_search_type = 'mac' OR (p_search_type = 'all' AND lfr.device_mac_address ILIKE '%' || p_search_term || '%') THEN 'mac_match'
            WHEN p_search_type = 'model' OR (p_search_type = 'all' AND lfr.device_model ILIKE '%' || p_search_term || '%') THEN 'model_match'
            ELSE 'other_match'
        END as match_type,
        lfr.created_at
    FROM lost_found_reports lfr
    WHERE 
        (p_search_type = 'all' AND (
            lfr.serial_number ILIKE '%' || p_search_term || '%' OR
            lfr.device_imei_number ILIKE '%' || p_search_term || '%' OR
            lfr.device_mac_address ILIKE '%' || p_search_term || '%' OR
            lfr.device_model ILIKE '%' || p_search_term || '%'
        )) OR
        (p_search_type = 'serial' AND lfr.serial_number ILIKE '%' || p_search_term || '%') OR
        (p_search_type = 'imei' AND lfr.device_imei_number ILIKE '%' || p_search_term || '%') OR
        (p_search_type = 'mac' AND lfr.device_mac_address ILIKE '%' || p_search_term || '%') OR
        (p_search_type = 'model' AND lfr.device_model ILIKE '%' || p_search_term || '%')
    
    UNION ALL
    
    -- Search in community_tips
    SELECT 
        'community_tip'::VARCHAR(50) as result_type,
        ct.id,
        ct.device_model,
        ct.device_category,
        ct.device_serial_number,
        ct.device_imei_number,
        ct.device_mac_address,
        ct.device_identifier_type,
        ct.identification_confidence,
        CASE 
            WHEN p_search_type = 'serial' OR (p_search_type = 'all' AND ct.device_serial_number ILIKE '%' || p_search_term || '%') THEN 'serial_match'
            WHEN p_search_type = 'imei' OR (p_search_type = 'all' AND ct.device_imei_number ILIKE '%' || p_search_term || '%') THEN 'imei_match'
            WHEN p_search_type = 'mac' OR (p_search_type = 'all' AND ct.device_mac_address ILIKE '%' || p_search_term || '%') THEN 'mac_match'
            WHEN p_search_type = 'model' OR (p_search_type = 'all' AND ct.device_model ILIKE '%' || p_search_term || '%') THEN 'model_match'
            ELSE 'other_match'
        END as match_type,
        ct.created_at
    FROM community_tips ct
    WHERE 
        (p_search_type = 'all' AND (
            ct.device_serial_number ILIKE '%' || p_search_term || '%' OR
            ct.device_imei_number ILIKE '%' || p_search_term || '%' OR
            ct.device_mac_address ILIKE '%' || p_search_term || '%' OR
            ct.device_model ILIKE '%' || p_search_term || '%'
        )) OR
        (p_search_type = 'serial' AND ct.device_serial_number ILIKE '%' || p_search_term || '%') OR
        (p_search_type = 'imei' AND ct.device_imei_number ILIKE '%' || p_search_term || '%') OR
        (p_search_type = 'mac' AND ct.device_mac_address ILIKE '%' || p_search_term || '%') OR
        (p_search_type = 'model' AND ct.device_model ILIKE '%' || p_search_term || '%')
    
    ORDER BY 
        confidence_score DESC,
        created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. CREATE DEVICE MATCHING FUNCTION
CREATE OR REPLACE FUNCTION find_device_matches(
    p_serial_number TEXT,
    p_imei_number TEXT DEFAULT NULL,
    p_mac_address TEXT DEFAULT NULL,
    p_device_model TEXT DEFAULT NULL
)
RETURNS TABLE (
    match_id UUID,
    match_type VARCHAR(50),
    match_confidence INTEGER,
    device_model TEXT,
    device_category TEXT,
    report_type TEXT,
    status TEXT,
    created_at TIMESTAMP
) AS $$
DECLARE
    v_duplicate_hash TEXT;
BEGIN
    -- Create duplicate check hash
    v_duplicate_hash := hash_serial_number(
        COALESCE(p_serial_number, '') || 
        COALESCE(p_imei_number, '') || 
        COALESCE(p_mac_address, '')
    );
    
    RETURN QUERY
    SELECT 
        lfr.id,
        CASE 
            WHEN lfr.serial_number = p_serial_number AND lfr.device_imei_number = p_imei_number AND lfr.device_mac_address = p_mac_address THEN 'comprehensive_match'
            WHEN lfr.serial_number = p_serial_number AND lfr.device_imei_number = p_imei_number THEN 'serial_imei_match'
            WHEN lfr.serial_number = p_serial_number AND lfr.device_mac_address = p_mac_address THEN 'serial_mac_match'
            WHEN lfr.serial_number = p_serial_number THEN 'serial_match'
            WHEN lfr.device_imei_number = p_imei_number THEN 'imei_match'
            WHEN lfr.device_mac_address = p_mac_address THEN 'mac_match'
            WHEN lfr.device_model = p_device_model THEN 'model_match'
            ELSE 'partial_match'
        END as match_type,
        CASE 
            WHEN lfr.serial_number = p_serial_number AND lfr.device_imei_number = p_imei_number AND lfr.device_mac_address = p_mac_address THEN 100
            WHEN lfr.serial_number = p_serial_number AND lfr.device_imei_number = p_imei_number THEN 90
            WHEN lfr.serial_number = p_serial_number AND lfr.device_mac_address = p_mac_address THEN 85
            WHEN lfr.serial_number = p_serial_number THEN 80
            WHEN lfr.device_imei_number = p_imei_number THEN 75
            WHEN lfr.device_mac_address = p_mac_address THEN 70
            WHEN lfr.device_model = p_device_model THEN 50
            ELSE 30
        END as match_confidence,
        lfr.device_model,
        lfr.device_category,
        lfr.report_type,
        lfr.status,
        lfr.created_at
    FROM lost_found_reports lfr
    WHERE 
        lfr.serial_number = p_serial_number OR
        lfr.device_imei_number = p_imei_number OR
        lfr.device_mac_address = p_mac_address OR
        lfr.device_model = p_device_model
    ORDER BY match_confidence DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. UPDATE EXISTING RECORDS WITH ENHANCED IDENTIFICATION
DO $$
DECLARE
    v_record RECORD;
    v_identification_result JSON;
    v_updated_count INTEGER := 0;
BEGIN
    -- Update lost_found_reports with enhanced identification
    FOR v_record IN
        SELECT id, serial_number, device_model, device_category
        FROM lost_found_reports
        WHERE device_identifier_type IS NULL OR device_identifier_type = 'serial_only'
    LOOP
        -- Process identification
        v_identification_result := process_device_identification(
            v_record.serial_number,
            NULL, -- IMEI will be added when available
            NULL, -- MAC will be added when available
            v_record.device_model,
            v_record.device_category
        );
        
        -- Update record
        UPDATE lost_found_reports 
        SET 
            device_identifier_type = v_identification_result->>'identifier_type',
            identification_confidence = (v_identification_result->>'confidence_score')::INTEGER,
            duplicate_check_hash = v_identification_result->>'duplicate_hash',
            updated_at = NOW()
        WHERE id = v_record.id;
        
        v_updated_count := v_updated_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Enhanced identification applied to % lost_found_reports', v_updated_count;
END $$;

-- 7. CREATE COMPREHENSIVE DEVICE STATISTICS FUNCTION
CREATE OR REPLACE FUNCTION get_device_statistics()
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    v_result := json_build_object(
        'total_devices', (SELECT COUNT(*) FROM lost_found_reports),
        'devices_with_serial', (SELECT COUNT(*) FROM lost_found_reports WHERE serial_number IS NOT NULL),
        'devices_with_imei', (SELECT COUNT(*) FROM lost_found_reports WHERE device_imei_number IS NOT NULL),
        'devices_with_mac', (SELECT COUNT(*) FROM lost_found_reports WHERE device_mac_address IS NOT NULL),
        'comprehensive_identification', (SELECT COUNT(*) FROM lost_found_reports WHERE device_identifier_type = 'comprehensive'),
        'serial_imei_identification', (SELECT COUNT(*) FROM lost_found_reports WHERE device_identifier_type = 'serial_imei'),
        'serial_only_identification', (SELECT COUNT(*) FROM lost_found_reports WHERE device_identifier_type = 'serial_only'),
        'average_confidence', (SELECT ROUND(AVG(identification_confidence), 2) FROM lost_found_reports),
        'high_confidence_devices', (SELECT COUNT(*) FROM lost_found_reports WHERE identification_confidence >= 80),
        'device_categories', (
            SELECT json_object_agg(device_category, category_count)
            FROM (
                SELECT device_category, COUNT(*) as category_count
                FROM lost_found_reports
                GROUP BY device_category
                ORDER BY category_count DESC
            ) category_stats
        )
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 8. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_lost_found_reports_serial ON lost_found_reports(serial_number);
CREATE INDEX IF NOT EXISTS idx_lost_found_reports_imei ON lost_found_reports(device_imei_number);
CREATE INDEX IF NOT EXISTS idx_lost_found_reports_mac ON lost_found_reports(device_mac_address);
CREATE INDEX IF NOT EXISTS idx_lost_found_reports_identifier_type ON lost_found_reports(device_identifier_type);
CREATE INDEX IF NOT EXISTS idx_lost_found_reports_confidence ON lost_found_reports(identification_confidence);
CREATE INDEX IF NOT EXISTS idx_lost_found_reports_duplicate_hash ON lost_found_reports(duplicate_check_hash);
CREATE INDEX IF NOT EXISTS idx_community_tips_serial ON community_tips(device_serial_number);
CREATE INDEX IF NOT EXISTS idx_community_tips_imei ON community_tips(device_imei_number);
CREATE INDEX IF NOT EXISTS idx_community_tips_mac ON community_tips(device_mac_address);

-- 9. FINAL VERIFICATION
SELECT 
    'Global Device Identification Integration Complete' as status,
    'Enhanced device identification now integrated across entire STOLEN app' as message,
    NOW() as completion_time;

-- Show integration statistics
SELECT 
    'Integration Statistics' as analysis_type,
    'Lost & Found Reports' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN device_imei_number IS NOT NULL THEN 1 END) as with_imei,
    COUNT(CASE WHEN device_mac_address IS NOT NULL THEN 1 END) as with_mac,
    COUNT(CASE WHEN device_identifier_type = 'comprehensive' THEN 1 END) as comprehensive_id,
    ROUND(AVG(identification_confidence), 2) as avg_confidence
FROM lost_found_reports

UNION ALL

SELECT 
    'Integration Statistics',
    'Community Tips',
    COUNT(*),
    COUNT(CASE WHEN device_imei_number IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN device_mac_address IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN device_identifier_type = 'comprehensive' THEN 1 END),
    ROUND(AVG(identification_confidence), 2)
FROM community_tips;

COMMIT;
