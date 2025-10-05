-- ============================================================================
-- DIAGNOSE CLAIM DEVICE ISSUE
-- ============================================================================
-- This script will help identify why the claim device page is looping
-- ============================================================================

-- 1. Check if the specific record exists in lost_found_reports
SELECT 
    'Record Existence Check' as test_type,
    id,
    report_type,
    device_model,
    device_category,
    description,
    location_address,
    reward_amount,
    verification_status,
    created_at,
    updated_at
FROM lost_found_reports 
WHERE id = '188bd2a6-86cf-4016-a0a0-63e81dbbede4';

-- 2. Check if the table exists and has any data
SELECT 
    'Table Check' as test_type,
    COUNT(*) as total_records,
    COUNT(CASE WHEN report_type = 'lost' THEN 1 END) as lost_records,
    COUNT(CASE WHEN report_type = 'found' THEN 1 END) as found_records
FROM lost_found_reports;

-- 3. Check recent records to see if there are any similar IDs
SELECT 
    'Recent Records Check' as test_type,
    id,
    report_type,
    device_model,
    device_category,
    created_at
FROM lost_found_reports 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check if there are any RLS policies blocking access
SELECT 
    'RLS Policy Check' as test_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'lost_found_reports';

-- 5. Check if the table structure is correct
SELECT 
    'Table Structure Check' as test_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'lost_found_reports'
ORDER BY ordinal_position;

-- 6. Test a simple query to see if the table is accessible
SELECT 
    'Accessibility Test' as test_type,
    'TABLE_ACCESSIBLE' as status,
    COUNT(*) as record_count
FROM lost_found_reports;
