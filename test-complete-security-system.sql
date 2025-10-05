-- Comprehensive Security System Test Suite
-- This script tests all components of the deployed security system

BEGIN;

-- 1. Test Security Functions
SELECT 
    '🔐 SECURITY FUNCTIONS TEST' as test_suite,
    'hash_serial_number' as function_name,
    hash_serial_number('TEST123456789') as result,
    CASE 
        WHEN hash_serial_number('TEST123456789') IS NOT NULL 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status;

SELECT 
    '🔐 SECURITY FUNCTIONS TEST' as test_suite,
    'show_partial_serial' as function_name,
    show_partial_serial('TEST123456789', NULL) as result,
    CASE 
        WHEN show_partial_serial('TEST123456789', NULL) LIKE '%***%' 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status;

-- 2. Test Database Schema
SELECT 
    '📊 DATABASE SCHEMA TEST' as test_suite,
    'Added Columns' as component,
    COUNT(*) as count,
    string_agg(column_name, ', ') as columns,
    CASE 
        WHEN COUNT(*) >= 5 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
FROM information_schema.columns 
WHERE table_name = 'lost_found_reports' 
AND column_name IN ('claimant_id', 'claimant_name', 'claimant_email', 'ownership_proof', 'claim_description')
AND table_schema = 'public';

-- 3. Test View System
SELECT 
    '👁️ VIEW SYSTEM TEST' as test_suite,
    'public_lost_found_reports' as view_name,
    COUNT(*) as column_count,
    CASE 
        WHEN COUNT(*) > 0 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
FROM information_schema.columns 
WHERE table_name = 'public_lost_found_reports' 
AND table_schema = 'public';

-- 4. Test Ownership Verification Table
SELECT 
    '🔍 OWNERSHIP VERIFICATION TEST' as test_suite,
    'Table Structure' as component,
    COUNT(*) as column_count,
    CASE 
        WHEN COUNT(*) >= 10 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
FROM information_schema.columns 
WHERE table_name = 'ownership_verification' 
AND table_schema = 'public';

-- 5. Test RLS Policies
SELECT 
    '🛡️ RLS POLICIES TEST' as test_suite,
    'Policy Count' as component,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ') as policies,
    CASE 
        WHEN COUNT(*) >= 4 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
FROM pg_policies 
WHERE tablename = 'ownership_verification'
AND schemaname = 'public';

-- 6. Test Admin System
SELECT 
    '👑 ADMIN SYSTEM TEST' as test_suite,
    'Super Admin Role' as component,
    COUNT(*) as role_count,
    CASE 
        WHEN COUNT(*) > 0 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
FROM admin_roles 
WHERE role_name = 'super_admin';

-- 7. Test Audit System
SELECT 
    '📝 AUDIT SYSTEM TEST' as test_suite,
    'Audit Log Table' as component,
    COUNT(*) as table_exists,
    CASE 
        WHEN COUNT(*) > 0 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
FROM information_schema.tables 
WHERE table_name = 'system_audit_log' 
AND table_schema = 'public';

-- 8. Test Recent Audit Entries
SELECT 
    '📝 AUDIT SYSTEM TEST' as test_suite,
    'Recent Deployments' as component,
    COUNT(*) as deployment_count,
    CASE 
        WHEN COUNT(*) > 0 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
FROM system_audit_log 
WHERE audit_type = 'security_system_deployment'
AND created_at > NOW() - INTERVAL '1 hour';

-- 9. Test Serial Number Security
SELECT 
    '🔒 SERIAL NUMBER SECURITY TEST' as test_suite,
    'Hashed Serials' as component,
    COUNT(*) as hashed_count,
    CASE 
        WHEN COUNT(*) > 0 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
FROM lost_found_reports 
WHERE serial_number IS NOT NULL 
AND (serial_number LIKE '%***%' OR LENGTH(serial_number) = 64);

-- 10. Comprehensive System Health Check
SELECT 
    '🏥 SYSTEM HEALTH CHECK' as test_suite,
    'Overall Status' as component,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM pg_proc 
            WHERE proname IN ('hash_serial_number', 'show_partial_serial')
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) = 2
        AND (
            SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = 'lost_found_reports' 
            AND column_name IN ('claimant_id', 'claimant_name', 'claimant_email', 'ownership_proof', 'claim_description')
            AND table_schema = 'public'
        ) >= 5
        AND (
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_name = 'ownership_verification' 
            AND table_schema = 'public'
        ) = 1
        AND (
            SELECT COUNT(*) FROM pg_policies 
            WHERE tablename = 'ownership_verification'
            AND schemaname = 'public'
        ) >= 4
        THEN '✅ ALL SYSTEMS OPERATIONAL'
        ELSE '❌ SYSTEM ISSUES DETECTED'
    END as status;

COMMIT;
