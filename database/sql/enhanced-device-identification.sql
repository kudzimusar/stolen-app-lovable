-- ENHANCED DEVICE IDENTIFICATION SYSTEM
-- Comprehensive handling of BOTH serial numbers AND IMEI numbers for all device types

BEGIN;

-- 1. ENHANCE LEGAL DEVICE RECORDS TABLE WITH COMPREHENSIVE IDENTIFICATION
ALTER TABLE legal_device_records 
ADD COLUMN IF NOT EXISTS device_serial_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_imei_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_mac_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_wifi_mac VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_bluetooth_mac VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_udid VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_android_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_identifier_type VARCHAR(50) DEFAULT 'mixed', -- 'serial_only', 'imei_only', 'mixed', 'mac_only'
ADD COLUMN IF NOT EXISTS identification_confidence INTEGER DEFAULT 0, -- 0-100 confidence score
ADD COLUMN IF NOT EXISTS duplicate_check_hash VARCHAR(255);

-- 2. CREATE COMPREHENSIVE DEVICE IDENTIFICATION FUNCTION
CREATE OR REPLACE FUNCTION process_device_identification(
    p_serial_number TEXT,
    p_imei_number TEXT DEFAULT NULL,
    p_mac_address TEXT DEFAULT NULL,
    p_device_model TEXT DEFAULT NULL,
    p_device_category TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_serial_hash TEXT;
    v_imei_hash TEXT;
    v_mac_hash TEXT;
    v_identifier_type VARCHAR(50);
    v_confidence_score INTEGER := 0;
    v_duplicate_hash TEXT;
    v_result JSON;
BEGIN
    -- Process serial number (always present)
    IF p_serial_number IS NOT NULL AND p_serial_number != '' THEN
        v_serial_hash := hash_serial_number(p_serial_number);
        v_confidence_score := v_confidence_score + 30;
    END IF;
    
    -- Process IMEI number (for mobile devices)
    IF p_imei_number IS NOT NULL AND p_imei_number != '' THEN
        -- Validate IMEI format (15 digits for most devices)
        IF LENGTH(p_imei_number) = 15 AND p_imei_number ~ '^[0-9]+$' THEN
            v_imei_hash := hash_serial_number(p_imei_number);
            v_confidence_score := v_confidence_score + 40;
        ELSIF LENGTH(p_imei_number) >= 10 AND p_imei_number ~ '^[0-9]+$' THEN
            -- Some devices have shorter IMEI-like identifiers
            v_imei_hash := hash_serial_number(p_imei_number);
            v_confidence_score := v_confidence_score + 25;
        END IF;
    END IF;
    
    -- Process MAC address (for network devices)
    IF p_mac_address IS NOT NULL AND p_mac_address != '' THEN
        -- Validate MAC format (XX:XX:XX:XX:XX:XX or XXXXXXXXXXXX)
        IF p_mac_address ~ '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$' OR 
           p_mac_address ~ '^[0-9A-Fa-f]{12}$' THEN
            v_mac_hash := hash_serial_number(UPPER(REPLACE(REPLACE(p_mac_address, ':', ''), '-', '')));
            v_confidence_score := v_confidence_score + 20;
        END IF;
    END IF;
    
    -- Determine identifier type based on available data
    IF v_serial_hash IS NOT NULL AND v_imei_hash IS NOT NULL AND v_mac_hash IS NOT NULL THEN
        v_identifier_type := 'comprehensive';
        v_confidence_score := v_confidence_score + 10;
    ELSIF v_serial_hash IS NOT NULL AND v_imei_hash IS NOT NULL THEN
        v_identifier_type := 'serial_imei';
        v_confidence_score := v_confidence_score + 5;
    ELSIF v_serial_hash IS NOT NULL AND v_mac_hash IS NOT NULL THEN
        v_identifier_type := 'serial_mac';
        v_confidence_score := v_confidence_score + 5;
    ELSIF v_imei_hash IS NOT NULL THEN
        v_identifier_type := 'imei_only';
    ELSIF v_serial_hash IS NOT NULL THEN
        v_identifier_type := 'serial_only';
    ELSIF v_mac_hash IS NOT NULL THEN
        v_identifier_type := 'mac_only';
    ELSE
        v_identifier_type := 'none';
        v_confidence_score := 0;
    END IF;
    
    -- Create duplicate check hash from all available identifiers
    v_duplicate_hash := hash_serial_number(
        COALESCE(p_serial_number, '') || 
        COALESCE(p_imei_number, '') || 
        COALESCE(p_mac_address, '')
    );
    
    -- Cap confidence score at 100
    v_confidence_score := LEAST(v_confidence_score, 100);
    
    v_result := json_build_object(
        'serial_hash', v_serial_hash,
        'imei_hash', v_imei_hash,
        'mac_hash', v_mac_hash,
        'identifier_type', v_identifier_type,
        'confidence_score', v_confidence_score,
        'duplicate_hash', v_duplicate_hash,
        'has_serial', v_serial_hash IS NOT NULL,
        'has_imei', v_imei_hash IS NOT NULL,
        'has_mac', v_mac_hash IS NOT NULL
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 3. ENHANCED LEGAL RECORD CREATION FUNCTION WITH COMPREHENSIVE IDENTIFICATION
CREATE OR REPLACE FUNCTION create_legal_record_from_report_enhanced()
RETURNS TRIGGER AS $$
DECLARE
    v_identification_result JSON;
    v_user_display_name TEXT;
    v_user_email TEXT;
    v_legal_record_id UUID;
    v_risk_score INTEGER := 0;
    v_fraud_indicators JSONB := '{}';
    v_verification_status VARCHAR(50) := 'pending';
    v_verification_notes TEXT := '';
    v_imei_column_exists BOOLEAN;
    v_mac_column_exists BOOLEAN;
    v_imei_value TEXT;
    v_mac_value TEXT;
BEGIN
    -- Check for IMEI column existence
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'imei_number'
        AND table_schema = 'public'
    ) INTO v_imei_column_exists;
    
    -- Check for MAC address column existence
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'mac_address'
        AND table_schema = 'public'
    ) INTO v_mac_column_exists;
    
    -- Extract IMEI if column exists
    IF v_imei_column_exists THEN
        BEGIN
            EXECUTE format('SELECT imei_number FROM lost_found_reports WHERE id = %L', NEW.id) INTO v_imei_value;
        EXCEPTION
            WHEN OTHERS THEN
                v_imei_value := NULL;
        END;
    END IF;
    
    -- Extract MAC if column exists
    IF v_mac_column_exists THEN
        BEGIN
            EXECUTE format('SELECT mac_address FROM lost_found_reports WHERE id = %L', NEW.id) INTO v_mac_value;
        EXCEPTION
            WHEN OTHERS THEN
                v_mac_value := NULL;
        END;
    END IF;
    
    -- Process comprehensive device identification
    v_identification_result := process_device_identification(
        NEW.serial_number,
        v_imei_value,
        v_mac_value,
        NEW.device_model,
        NEW.device_category
    );
    
    -- Extract user information
    SELECT 
        COALESCE(
            raw_user_meta_data->>'display_name',
            raw_user_meta_data->>'full_name',
            raw_user_meta_data->>'name',
            email,
            'Anonymous User'
        ),
        COALESCE(
            email,
            raw_user_meta_data->>'email',
            'not.provided@stolen.com'
        )
    INTO v_user_display_name, v_user_email
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    -- Advanced risk assessment based on identification confidence
    v_risk_score := (v_identification_result->>'confidence_score')::INTEGER;
    
    -- Additional risk factors
    IF EXISTS (
        SELECT 1 FROM lost_found_reports 
        WHERE user_id = NEW.user_id 
        AND created_at > NOW() - INTERVAL '24 hours'
        AND id != NEW.id
    ) THEN
        v_risk_score := v_risk_score + 30;
        v_fraud_indicators := v_fraud_indicators || jsonb_build_object(
            'multiple_reports_24h', true,
            'risk_factor', 'high_frequency_reporting'
        );
    END IF;
    
    -- Device-specific risk factors
    IF NEW.device_category IN ('laptop', 'tablet', 'smartphone') THEN
        v_risk_score := v_risk_score + 20;
        v_fraud_indicators := v_fraud_indicators || jsonb_build_object(
            'high_value_device', true,
            'device_category', NEW.device_category
        );
    END IF;
    
    -- Found items require higher verification
    IF NEW.report_type = 'found' THEN
        v_risk_score := v_risk_score + 15;
        v_fraud_indicators := v_fraud_indicators || jsonb_build_object(
            'found_item', true,
            'verification_required', true
        );
        v_verification_status := 'pending';
        v_verification_notes := 'Found item requires additional verification';
    END IF;
    
    -- Create comprehensive legal record
    INSERT INTO legal_device_records (
        report_id,
        device_serial_hash,
        device_imei_hash,
        device_serial_number,
        device_imei_number,
        device_mac_address,
        device_identifier_type,
        identification_confidence,
        duplicate_check_hash,
        device_model,
        device_category,
        report_type,
        reporter_id,
        reporter_name,
        reporter_contact,
        incident_date,
        incident_location,
        incident_description,
        legal_status,
        risk_score,
        fraud_indicators,
        verification_status,
        verification_notes,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        v_identification_result->>'serial_hash',
        v_identification_result->>'imei_hash',
        NEW.serial_number,
        v_imei_value,
        v_mac_value,
        v_identification_result->>'identifier_type',
        (v_identification_result->>'confidence_score')::INTEGER,
        v_identification_result->>'duplicate_hash',
        COALESCE(NEW.device_model, 'Unknown Device'),
        COALESCE(NEW.device_category, 'Unknown Category'),
        NEW.report_type,
        NEW.user_id,
        v_user_display_name,
        v_user_email,
        COALESCE(NEW.incident_date, NEW.created_at, NOW()),
        COALESCE(NEW.location_address, 'Location Not Specified'),
        COALESCE(NEW.description, 'No description provided'),
        'active',
        v_risk_score,
        v_fraud_indicators,
        v_verification_status,
        v_verification_notes,
        NOW(),
        NOW()
    ) RETURNING id INTO v_legal_record_id;
    
    -- Security audit logging
    INSERT INTO security_audit_log (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        risk_level
    ) VALUES (
        NEW.user_id,
        'legal_record_created_enhanced',
        'legal_device_record',
        v_legal_record_id,
        jsonb_build_object(
            'report_id', NEW.id,
            'device_model', NEW.device_model,
            'report_type', NEW.report_type,
            'identification_result', v_identification_result,
            'risk_score', v_risk_score,
            'fraud_indicators', v_fraud_indicators,
            'verification_status', v_verification_status
        ),
        CASE 
            WHEN v_risk_score >= 70 THEN 'high'
            WHEN v_risk_score >= 40 THEN 'medium'
            ELSE 'low'
        END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE DUPLICATE DETECTION FUNCTION
CREATE OR REPLACE FUNCTION detect_duplicate_devices()
RETURNS JSON AS $$
DECLARE
    v_duplicate_record RECORD;
    v_duplicates_found INTEGER := 0;
    v_result JSON;
BEGIN
    -- Find potential duplicates based on duplicate check hash
    FOR v_duplicate_record IN
        SELECT 
            duplicate_check_hash,
            COUNT(*) as duplicate_count,
            array_agg(id) as legal_record_ids,
            array_agg(device_model) as device_models,
            array_agg(report_type) as report_types
        FROM legal_device_records
        WHERE duplicate_check_hash IS NOT NULL
        GROUP BY duplicate_check_hash
        HAVING COUNT(*) > 1
    LOOP
        v_duplicates_found := v_duplicates_found + 1;
        
        -- Log duplicate detection
        INSERT INTO security_audit_log (
            action,
            resource_type,
            details,
            risk_level
        ) VALUES (
            'duplicate_device_detected',
            'legal_device_record',
            NULL,
            jsonb_build_object(
                'duplicate_hash', v_duplicate_record.duplicate_check_hash,
                'duplicate_count', v_duplicate_record.duplicate_count,
                'legal_record_ids', v_duplicate_record.legal_record_ids,
                'device_models', v_duplicate_record.device_models,
                'report_types', v_duplicate_record.report_types
            ),
            'high'
        );
    END LOOP;
    
    v_result := json_build_object(
        'success', true,
        'duplicates_found', v_duplicates_found,
        'message', 'Duplicate detection completed'
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 5. UPDATE EXISTING RECORDS WITH ENHANCED IDENTIFICATION
DO $$
DECLARE
    v_record RECORD;
    v_identification_result JSON;
    v_imei_column_exists BOOLEAN;
    v_mac_column_exists BOOLEAN;
    v_imei_value TEXT;
    v_mac_value TEXT;
    v_updated_count INTEGER := 0;
BEGIN
    -- Check column existence
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'imei_number'
        AND table_schema = 'public'
    ) INTO v_imei_column_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'mac_address'
        AND table_schema = 'public'
    ) INTO v_mac_column_exists;
    
    -- Update existing legal records
    FOR v_record IN
        SELECT ldr.id, ldr.report_id, lfr.serial_number, lfr.device_model, lfr.device_category
        FROM legal_device_records ldr
        JOIN lost_found_reports lfr ON ldr.report_id = lfr.id
        WHERE ldr.device_serial_number IS NULL
    LOOP
        -- Extract IMEI and MAC if columns exist
        v_imei_value := NULL;
        v_mac_value := NULL;
        
        IF v_imei_column_exists THEN
            BEGIN
                EXECUTE format('SELECT imei_number FROM lost_found_reports WHERE id = %L', v_record.report_id) INTO v_imei_value;
            EXCEPTION
                WHEN OTHERS THEN
                    v_imei_value := NULL;
            END;
        END IF;
        
        IF v_mac_column_exists THEN
            BEGIN
                EXECUTE format('SELECT mac_address FROM lost_found_reports WHERE id = %L', v_record.report_id) INTO v_mac_value;
            EXCEPTION
                WHEN OTHERS THEN
                    v_mac_value := NULL;
            END;
        END IF;
        
        -- Process identification
        v_identification_result := process_device_identification(
            v_record.serial_number,
            v_imei_value,
            v_mac_value,
            v_record.device_model,
            v_record.device_category
        );
        
        -- Update record
        UPDATE legal_device_records 
        SET 
            device_serial_number = v_record.serial_number,
            device_imei_number = v_imei_value,
            device_mac_address = v_mac_value,
            device_identifier_type = v_identification_result->>'identifier_type',
            identification_confidence = (v_identification_result->>'confidence_score')::INTEGER,
            duplicate_check_hash = v_identification_result->>'duplicate_hash',
            updated_at = NOW()
        WHERE id = v_record.id;
        
        v_updated_count := v_updated_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Enhanced identification applied to % existing records', v_updated_count;
END $$;

-- 6. CREATE COMPREHENSIVE DEVICE SEARCH FUNCTION
CREATE OR REPLACE FUNCTION search_device_comprehensive(
    p_search_term TEXT
)
RETURNS TABLE (
    legal_record_id UUID,
    report_id UUID,
    device_model TEXT,
    device_category TEXT,
    report_type TEXT,
    serial_number TEXT,
    imei_number TEXT,
    mac_address TEXT,
    identifier_type TEXT,
    confidence_score INTEGER,
    match_type TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ldr.id,
        ldr.report_id,
        ldr.device_model,
        ldr.device_category,
        ldr.report_type,
        ldr.device_serial_number,
        ldr.device_imei_number,
        ldr.device_mac_address,
        ldr.device_identifier_type,
        ldr.identification_confidence,
        CASE 
            WHEN ldr.device_serial_number ILIKE '%' || p_search_term || '%' THEN 'serial_match'
            WHEN ldr.device_imei_number ILIKE '%' || p_search_term || '%' THEN 'imei_match'
            WHEN ldr.device_mac_address ILIKE '%' || p_search_term || '%' THEN 'mac_match'
            WHEN ldr.device_model ILIKE '%' || p_search_term || '%' THEN 'model_match'
            ELSE 'other_match'
        END as match_type,
        ldr.created_at
    FROM legal_device_records ldr
    WHERE 
        ldr.device_serial_number ILIKE '%' || p_search_term || '%' OR
        ldr.device_imei_number ILIKE '%' || p_search_term || '%' OR
        ldr.device_mac_address ILIKE '%' || p_search_term || '%' OR
        ldr.device_model ILIKE '%' || p_search_term || '%'
    ORDER BY 
        ldr.identification_confidence DESC,
        ldr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. FINAL VERIFICATION
SELECT 
    'Enhanced Device Identification System Complete' as status,
    'Comprehensive serial number, IMEI, and MAC address handling implemented' as message,
    NOW() as completion_time;

-- Show identification statistics
SELECT 
    'Device Identification Statistics' as analysis_type,
    device_identifier_type,
    COUNT(*) as record_count,
    AVG(identification_confidence) as avg_confidence,
    MIN(identification_confidence) as min_confidence,
    MAX(identification_confidence) as max_confidence
FROM legal_device_records
GROUP BY device_identifier_type
ORDER BY record_count DESC;

COMMIT;
