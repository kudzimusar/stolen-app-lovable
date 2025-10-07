-- ============================================================================
-- ADD MISSING COLUMNS AND FIX ADMIN FUNCTIONS
-- ============================================================================
-- This script checks for missing columns and adds them, then fixes the functions
-- to use the correct column names
-- ============================================================================

-- 1. CHECK CURRENT COLUMNS IN lost_found_reports
-- ============================================================================
SELECT 
    'Current lost_found_reports Columns' as check_type,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'lost_found_reports'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. ADD MISSING CRITICAL COLUMNS TO lost_found_reports
-- ============================================================================
-- Add device_imei_number if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'device_imei_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports 
        ADD COLUMN device_imei_number TEXT;
        RAISE NOTICE 'Added column: device_imei_number';
    ELSE
        RAISE NOTICE 'Column device_imei_number already exists';
    END IF;
END $$;

-- Add device_serial_number if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'device_serial_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports 
        ADD COLUMN device_serial_number TEXT;
        RAISE NOTICE 'Added column: device_serial_number';
    ELSE
        RAISE NOTICE 'Column device_serial_number already exists';
    END IF;
END $$;

-- Add device_brand if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'device_brand'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports 
        ADD COLUMN device_brand TEXT;
        RAISE NOTICE 'Added column: device_brand';
    ELSE
        RAISE NOTICE 'Column device_brand already exists';
    END IF;
END $$;

-- Add serial_number if it doesn't exist (alternative naming)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'serial_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports 
        ADD COLUMN serial_number TEXT;
        RAISE NOTICE 'Added column: serial_number';
    ELSE
        RAISE NOTICE 'Column serial_number already exists';
    END IF;
END $$;

-- Add imei_number if it doesn't exist (alternative naming)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'imei_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports 
        ADD COLUMN imei_number TEXT;
        RAISE NOTICE 'Added column: imei_number';
    ELSE
        RAISE NOTICE 'Column imei_number already exists';
    END IF;
END $$;

-- Add reporter_contact if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'reporter_contact'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports 
        ADD COLUMN reporter_contact TEXT;
        RAISE NOTICE 'Added column: reporter_contact';
    ELSE
        RAISE NOTICE 'Column reporter_contact already exists';
    END IF;
END $$;

-- 3. CREATE INDEXES FOR NEW COLUMNS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_lost_found_reports_device_imei 
ON lost_found_reports(device_imei_number) 
WHERE device_imei_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lost_found_reports_device_serial 
ON lost_found_reports(device_serial_number) 
WHERE device_serial_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lost_found_reports_serial 
ON lost_found_reports(serial_number) 
WHERE serial_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lost_found_reports_imei 
ON lost_found_reports(imei_number) 
WHERE imei_number IS NOT NULL;

-- 4. UPDATE EXISTING DATA (if needed)
-- ============================================================================
-- Copy data from old columns to new columns if they exist
DO $$
BEGIN
    -- Copy imei_number to device_imei_number if device_imei_number is empty
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_reports' AND column_name = 'imei_number') 
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_reports' AND column_name = 'device_imei_number') THEN
        UPDATE lost_found_reports 
        SET device_imei_number = imei_number 
        WHERE device_imei_number IS NULL AND imei_number IS NOT NULL;
        RAISE NOTICE 'Copied imei_number to device_imei_number';
    END IF;
    
    -- Copy serial_number to device_serial_number if device_serial_number is empty
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_reports' AND column_name = 'serial_number') 
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_reports' AND column_name = 'device_serial_number') THEN
        UPDATE lost_found_reports 
        SET device_serial_number = serial_number 
        WHERE device_serial_number IS NULL AND serial_number IS NOT NULL;
        RAISE NOTICE 'Copied serial_number to device_serial_number';
    END IF;
END $$;

-- 5. CREATE HELPER FUNCTION TO GET COLUMN VALUE WITH FALLBACK
-- ============================================================================
-- This function will try multiple column names and return the first non-null value
CREATE OR REPLACE FUNCTION get_device_identifier(
    p_table_name TEXT,
    p_row_id UUID,
    p_identifier_type TEXT  -- 'imei' or 'serial'
)
RETURNS TEXT AS $$
DECLARE
    v_result TEXT;
BEGIN
    IF p_identifier_type = 'imei' THEN
        -- Try device_imei_number first, then imei_number
        EXECUTE format('
            SELECT COALESCE(device_imei_number, imei_number) 
            FROM %I 
            WHERE id = $1
        ', p_table_name) 
        INTO v_result 
        USING p_row_id;
    ELSIF p_identifier_type = 'serial' THEN
        -- Try device_serial_number first, then serial_number
        EXECUTE format('
            SELECT COALESCE(device_serial_number, serial_number) 
            FROM %I 
            WHERE id = $1
        ', p_table_name) 
        INTO v_result 
        USING p_row_id;
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. UPDATE get_pending_claims FUNCTION WITH PROPER COLUMN HANDLING
-- ============================================================================
CREATE OR REPLACE FUNCTION get_pending_claims(
    limit_count INTEGER DEFAULT 10,
    include_metadata BOOLEAN DEFAULT true,
    priority_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
    claim_id UUID,
    report_id UUID,
    claimant_name TEXT,
    claimant_email TEXT,
    claimant_phone TEXT,
    device_serial_provided TEXT,
    claim_type TEXT,
    claim_status TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    device_model TEXT,
    device_category TEXT,
    location_address TEXT,
    reward_amount NUMERIC,
    days_pending INTEGER,
    priority_score INTEGER,
    urgency_level TEXT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id as claim_id,
        dc.report_id,
        dc.claimant_name::TEXT,
        dc.claimant_email::TEXT,
        dc.claimant_phone::TEXT,
        dc.device_serial_provided::TEXT,
        dc.claim_type::TEXT,
        dc.claim_status::TEXT,
        dc.submitted_at,
        lfr.device_model::TEXT,
        lfr.device_category::TEXT,
        lfr.location_address::TEXT,
        lfr.reward_amount,
        EXTRACT(DAY FROM (NOW() - dc.submitted_at))::INTEGER as days_pending,
        -- Advanced priority scoring: reward amount + age + verification status
        (COALESCE(lfr.reward_amount, 0)::INTEGER + 
         EXTRACT(DAY FROM (NOW() - dc.submitted_at))::INTEGER * 2 +
         CASE WHEN lfr.verification_status = 'verified' THEN 10 ELSE 0 END) as priority_score,
        -- Urgency level based on days pending and reward amount
        CASE 
            WHEN EXTRACT(DAY FROM (NOW() - dc.submitted_at)) > 7 OR COALESCE(lfr.reward_amount, 0) > 1000 THEN 'HIGH'
            WHEN EXTRACT(DAY FROM (NOW() - dc.submitted_at)) > 3 OR COALESCE(lfr.reward_amount, 0) > 500 THEN 'MEDIUM'
            ELSE 'LOW'
        END as urgency_level,
        CASE WHEN include_metadata THEN
            jsonb_build_object(
                'claimant_user_id', dc.claimant_user_id,
                'ownership_proof', dc.ownership_proof,
                'claim_description', dc.claim_description,
                'receipt_file_url', dc.receipt_file_url,
                'police_report_file_url', dc.police_report_file_url,
                'additional_files_urls', dc.additional_files_urls,
                'purchase_date', dc.purchase_date,
                'purchase_location', dc.purchase_location,
                'admin_review_notes', dc.admin_review_notes,
                'auto_escalation_date', dc.auto_escalation_date,
                'verification_status', lfr.verification_status,
                'report_type', lfr.report_type,
                'device_brand', COALESCE(lfr.device_brand, 'Unknown'),
                'device_imei_number', COALESCE(lfr.device_imei_number, lfr.imei_number),
                'device_serial_number', COALESCE(lfr.device_serial_number, lfr.serial_number),
                'device_model_full', lfr.device_model,
                'device_category_type', lfr.device_category,
                'location_details', lfr.location_address,
                'report_created_at', lfr.created_at,
                'report_updated_at', lfr.updated_at,
                'reporter_contact', COALESCE(lfr.reporter_contact, 'Not provided')
            )
        ELSE NULL END as metadata
    FROM device_claims dc
    JOIN lost_found_reports lfr ON dc.report_id = lfr.id
    WHERE dc.claim_status = 'pending'
    AND (NOT priority_only OR 
         EXTRACT(DAY FROM (NOW() - dc.submitted_at)) > 3 OR 
         COALESCE(lfr.reward_amount, 0) > 500)
    ORDER BY 
        -- Advanced priority ordering: high reward + old claims + verified devices first
        (COALESCE(lfr.reward_amount, 0)::INTEGER + 
         EXTRACT(DAY FROM (NOW() - dc.submitted_at))::INTEGER * 2 +
         CASE WHEN lfr.verification_status = 'verified' THEN 10 ELSE 0 END) DESC,
        dc.submitted_at ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. VERIFY ALL COLUMNS NOW EXIST
-- ============================================================================
SELECT 
    'Verification: All Critical Columns' as check_type,
    column_name,
    data_type,
    CASE WHEN column_name IN (
        'device_imei_number', 'imei_number', 
        'device_serial_number', 'serial_number',
        'device_brand', 'reporter_contact'
    ) THEN 'CRITICAL COLUMN' ELSE 'STANDARD COLUMN' END as column_importance
FROM information_schema.columns 
WHERE table_name = 'lost_found_reports'
  AND table_schema = 'public'
ORDER BY 
    CASE WHEN column_name IN (
        'device_imei_number', 'imei_number', 
        'device_serial_number', 'serial_number',
        'device_brand', 'reporter_contact'
    ) THEN 1 ELSE 2 END,
    ordinal_position;

-- 8. TEST THE UPDATED FUNCTION
-- ============================================================================
SELECT 'Testing Updated get_pending_claims Function' as test_type;
SELECT * FROM get_pending_claims(5, true, false) as test_results;

-- 9. FINAL STATUS REPORT
-- ============================================================================
SELECT 
    'COLUMN STATUS REPORT' as report_type,
    'device_imei_number' as column_name,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_reports' AND column_name = 'device_imei_number') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'COLUMN STATUS REPORT' as report_type,
    'device_serial_number' as column_name,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_reports' AND column_name = 'device_serial_number') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'COLUMN STATUS REPORT' as report_type,
    'device_brand' as column_name,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_reports' AND column_name = 'device_brand') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'COLUMN STATUS REPORT' as report_type,
    'reporter_contact' as column_name,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_reports' AND column_name = 'reporter_contact') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'COLUMN STATUS REPORT' as report_type,
    'get_pending_claims function' as column_name,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_pending_claims') 
         THEN 'UPDATED' ELSE 'MISSING' END as status;
