-- Test SQL Fixes
-- This script tests the critical security fixes

-- 1. Test if hash_serial_number function works
SELECT 
    'Testing hash_serial_number function' as test_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'hash_serial_number' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN hash_serial_number('TEST123456789'::text)
        ELSE 'Function not created yet'
    END as hashed_serial;

-- 2. Test if show_partial_serial function works
SELECT 
    'Testing show_partial_serial function' as test_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'show_partial_serial' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN show_partial_serial('TEST123456789'::text, NULL::uuid)
        ELSE 'Function not created yet'
    END as partial_serial;

-- 3. Check if admin_roles table has description column
SELECT 
    'Admin roles table structure' as test_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'admin_roles' 
AND column_name = 'description'
AND table_schema = 'public';

-- 4. Check if lost_found_reports has claimant columns
SELECT 
    'Lost found reports claimant columns' as test_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'lost_found_reports' 
AND column_name IN ('claimant_id', 'claimant_name', 'claimant_email', 'ownership_proof')
AND table_schema = 'public'
ORDER BY column_name;

-- 5. Check if ownership_verification table exists
SELECT 
    'Ownership verification table' as test_type,
    COUNT(*) as table_exists
FROM information_schema.tables 
WHERE table_name = 'ownership_verification' 
AND table_schema = 'public';

-- 6. Test serial number hashing on existing data
SELECT 
    'Serial number hashing test' as test_type,
    id,
    device_model,
    serial_number,
    CASE 
        WHEN serial_number LIKE '%***%' THEN 'Already hashed/partial'
        WHEN LENGTH(serial_number) > 10 THEN 'Needs hashing'
        ELSE 'Short serial'
    END as serial_status
FROM lost_found_reports 
WHERE serial_number IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
