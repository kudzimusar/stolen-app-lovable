-- =====================================================================
-- DIAGNOSTIC CHECK - Run this FIRST to see what's wrong
-- =====================================================================

-- Check 1: Does the table exist?
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'lost_found_reports'
        )
        THEN '✅ Table EXISTS'
        ELSE '❌ Table DOES NOT EXIST'
    END as table_status;

-- Check 2: List ALL existing columns
SELECT 
    '=== EXISTING COLUMNS ===' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'lost_found_reports'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check 3: List ALL missing columns
SELECT 
    '=== MISSING COLUMNS ===' as status;

SELECT 
    expected_column
FROM (
    VALUES 
        ('id'),
        ('user_id'),
        ('report_type'),
        ('device_category'),
        ('device_model'),
        ('serial_number'),
        ('description'),
        ('location_lat'),
        ('location_lng'),
        ('location_address'),
        ('incident_date'),
        ('reward_amount'),
        ('contact_preferences'),
        ('privacy_settings'),
        ('verification_status'),
        ('community_score'),
        ('photos'),
        ('documents'),
        ('created_at'),
        ('updated_at')
) AS expected(expected_column)
WHERE NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'lost_found_reports'
    AND table_schema = 'public'
    AND column_name = expected.expected_column
);

-- Check 4: Summary
SELECT 
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'lost_found_reports' AND table_schema = 'public') as columns_exist,
    20 as columns_needed,
    20 - (SELECT COUNT(*) FROM information_schema.columns 
          WHERE table_name = 'lost_found_reports' AND table_schema = 'public') as columns_missing;

-- Check 5: Critical location columns status
SELECT 
    '=== LOCATION COLUMNS CHECK ===' as status;

SELECT 
    column_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'lost_found_reports' 
            AND table_schema = 'public'
            AND column_name = c.column_name
        )
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES ('location_lat'), ('location_lng'), ('location_address')
) AS c(column_name);
