-- Check what's actually in the database
-- This script will show all current data in the lost_found_reports table

BEGIN;

-- 1. Check all reports in the database
SELECT 
    'Current Database Content' as report_type,
    'All reports in lost_found_reports table' as description,
    NOW() as check_time;

-- 2. Show all reports with details
SELECT 
    id,
    report_type,
    device_model,
    device_category,
    description,
    location_address,
    status,
    verification_status,
    reward_amount,
    user_id,
    created_at,
    updated_at
FROM lost_found_reports
ORDER BY created_at DESC;

-- 3. Count reports by type
SELECT 
    'Report Counts' as metric_type,
    report_type,
    COUNT(*) as count
FROM lost_found_reports
GROUP BY report_type;

-- 4. Check for specific devices mentioned in the image
SELECT 
    'Specific Device Check' as check_type,
    'MacBook Pro reports' as device_type,
    COUNT(*) as count
FROM lost_found_reports
WHERE device_model ILIKE '%MacBook%' 
   OR description ILIKE '%MacBook%'
   OR description ILIKE '%Space Gray%'
   OR description ILIKE '%South African flag%';

SELECT 
    'Specific Device Check' as check_type,
    'Samsung Galaxy S24 reports' as device_type,
    COUNT(*) as count
FROM lost_found_reports
WHERE device_model ILIKE '%Samsung%' 
   OR device_model ILIKE '%Galaxy%'
   OR description ILIKE '%Samsung%'
   OR description ILIKE '%Galaxy%';

-- 5. Check user information
SELECT 
    'User Information' as info_type,
    u.id,
    u.email,
    u.display_name,
    u.created_at
FROM auth.users u
WHERE u.email ILIKE '%musarurwa%' 
   OR u.display_name ILIKE '%Musarurwa%'
   OR u.display_name ILIKE '%Shadreck%';

-- 6. Check if there are any reports by specific users
SELECT 
    'Reports by User' as info_type,
    lfr.user_id,
    u.email,
    u.display_name,
    COUNT(*) as report_count
FROM lost_found_reports lfr
LEFT JOIN auth.users u ON lfr.user_id = u.id
GROUP BY lfr.user_id, u.email, u.display_name
ORDER BY report_count DESC;

COMMIT;
