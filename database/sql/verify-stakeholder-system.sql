-- ================================================================
-- STAKEHOLDER SYSTEM VERIFICATION SCRIPT
-- Comprehensive check of all database components
-- ================================================================

-- Set output formatting
\set QUIET on
\pset format wrapped
\pset columns 100

-- ================================================================
-- 1. CHECK STAKEHOLDER TABLES
-- ================================================================

\echo '========================================='
\echo '1. CHECKING STAKEHOLDER TABLES'
\echo '========================================='
\echo ''

SELECT 
    'Stakeholder Tables' as component,
    table_name,
    CASE 
        WHEN table_name IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos', 'stakeholder_audit_log') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos', 'stakeholder_audit_log')
ORDER BY table_name;

-- Count total tables found
SELECT 
    '📊 Summary' as info,
    COUNT(*) as tables_found,
    '6 expected' as expected
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos', 'stakeholder_audit_log');

\echo ''

-- ================================================================
-- 2. CHECK STAKEHOLDER VIEW
-- ================================================================

\echo '========================================='
\echo '2. CHECKING STAKEHOLDER VIEW'
\echo '========================================='
\echo ''

SELECT 
    'Stakeholder View' as component,
    table_name as view_name,
    '✅ EXISTS' as status
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'admin_stakeholders_view'
UNION ALL
SELECT 
    'Stakeholder View' as component,
    'admin_stakeholders_view' as view_name,
    '❌ MISSING' as status
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'admin_stakeholders_view'
);

\echo ''

-- ================================================================
-- 3. CHECK DATABASE FUNCTIONS
-- ================================================================

\echo '========================================='
\echo '3. CHECKING DATABASE FUNCTIONS'
\echo '========================================='
\echo ''

SELECT 
    'Database Functions' as component,
    routine_name as function_name,
    CASE 
        WHEN routine_name IN (
            'get_admin_stakeholder_stats',
            'list_stakeholders',
            'get_stakeholder_details',
            'get_stakeholder_type',
            'get_stakeholder_id',
            'update_stakeholder_status'
        ) THEN '✅ EXISTS'
        ELSE '❌ UNEXPECTED'
    END as status,
    routine_type as type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'get_admin_stakeholder_stats',
    'list_stakeholders',
    'get_stakeholder_details',
    'get_stakeholder_type',
    'get_stakeholder_id',
    'update_stakeholder_status'
)
ORDER BY routine_name;

-- Count functions found
SELECT 
    '📊 Summary' as info,
    COUNT(*) as functions_found,
    '6 expected' as expected
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'get_admin_stakeholder_stats',
    'list_stakeholders',
    'get_stakeholder_details',
    'get_stakeholder_type',
    'get_stakeholder_id',
    'update_stakeholder_status'
);

\echo ''

-- ================================================================
-- 4. CHECK ROW LEVEL SECURITY (RLS)
-- ================================================================

\echo '========================================='
\echo '4. CHECKING ROW LEVEL SECURITY'
\echo '========================================='
\echo ''

SELECT 
    'RLS Status' as component,
    tablename as table_name,
    CASE 
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos', 'stakeholder_audit_log')
ORDER BY tablename;

\echo ''

-- ================================================================
-- 5. CHECK INDEXES
-- ================================================================

\echo '========================================='
\echo '5. CHECKING INDEXES'
\echo '========================================='
\echo ''

SELECT 
    'Indexes' as component,
    tablename as table_name,
    indexname as index_name,
    '✅ EXISTS' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos', 'stakeholder_audit_log')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Count indexes
SELECT 
    '📊 Summary' as info,
    COUNT(*) as indexes_found,
    'Multiple expected' as expected
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos', 'stakeholder_audit_log')
AND indexname LIKE 'idx_%';

\echo ''

-- ================================================================
-- 6. CHECK TRIGGERS
-- ================================================================

\echo '========================================='
\echo '6. CHECKING AUDIT TRIGGERS'
\echo '========================================='
\echo ''

SELECT 
    'Audit Triggers' as component,
    event_object_table as table_name,
    trigger_name,
    CASE 
        WHEN trigger_name LIKE 'trigger_%_audit' THEN '✅ EXISTS'
        ELSE '❓ CHECK'
    END as status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos')
AND trigger_name LIKE 'trigger_%_audit'
ORDER BY event_object_table;

-- Count triggers
SELECT 
    '📊 Summary' as info,
    COUNT(*) as triggers_found,
    '5 expected (one per stakeholder table)' as expected
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos')
AND trigger_name LIKE 'trigger_%_audit';

\echo ''

-- ================================================================
-- 7. CHECK DATA COUNTS
-- ================================================================

\echo '========================================='
\echo '7. CHECKING DATA COUNTS'
\echo '========================================='
\echo ''

-- Retailers
SELECT 
    '📊 Data Counts' as info,
    'retailers' as table_name,
    COUNT(*) as record_count
FROM retailers
UNION ALL
-- Repair Shops
SELECT 
    '📊 Data Counts' as info,
    'repair_shops' as table_name,
    COUNT(*) as record_count
FROM repair_shops
UNION ALL
-- Law Enforcement
SELECT 
    '📊 Data Counts' as info,
    'law_enforcement' as table_name,
    COUNT(*) as record_count
FROM law_enforcement
UNION ALL
-- Insurance Partners
SELECT 
    '📊 Data Counts' as info,
    'insurance_partners' as table_name,
    COUNT(*) as record_count
FROM insurance_partners
UNION ALL
-- NGOs
SELECT 
    '📊 Data Counts' as info,
    'ngos' as table_name,
    COUNT(*) as record_count
FROM ngos
UNION ALL
-- Audit Log
SELECT 
    '📊 Data Counts' as info,
    'stakeholder_audit_log' as table_name,
    COUNT(*) as record_count
FROM stakeholder_audit_log;

\echo ''

-- ================================================================
-- 8. TEST DATABASE FUNCTIONS
-- ================================================================

\echo '========================================='
\echo '8. TESTING DATABASE FUNCTIONS'
\echo '========================================='
\echo ''

-- Test get_admin_stakeholder_stats
\echo 'Testing get_admin_stakeholder_stats()...'
SELECT 
    '🧪 Function Test' as test,
    'get_admin_stakeholder_stats' as function_name,
    CASE 
        WHEN get_admin_stakeholder_stats() IS NOT NULL THEN '✅ WORKING'
        ELSE '❌ FAILED'
    END as status;

-- Test list_stakeholders (with default params)
\echo 'Testing list_stakeholders()...'
SELECT 
    '🧪 Function Test' as test,
    'list_stakeholders' as function_name,
    CASE 
        WHEN list_stakeholders('all', 'all', '', 10, 0) IS NOT NULL THEN '✅ WORKING'
        ELSE '❌ FAILED'
    END as status;

\echo ''

-- ================================================================
-- 9. CHECK ADMIN USERS
-- ================================================================

\echo '========================================='
\echo '9. CHECKING ADMIN USERS'
\echo '========================================='
\echo ''

SELECT 
    '👤 Admin Users' as info,
    user_id,
    is_active,
    created_at,
    CASE 
        WHEN is_active = true THEN '✅ ACTIVE'
        ELSE '❌ INACTIVE'
    END as status
FROM admin_users
ORDER BY created_at DESC
LIMIT 5;

-- Count active admins
SELECT 
    '📊 Summary' as info,
    COUNT(*) as active_admins
FROM admin_users
WHERE is_active = true;

\echo ''

-- ================================================================
-- 10. FINAL SUMMARY
-- ================================================================

\echo '========================================='
\echo '10. FINAL VERIFICATION SUMMARY'
\echo '========================================='
\echo ''

WITH verification_summary AS (
    SELECT 
        (SELECT COUNT(*) FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos', 'stakeholder_audit_log')) as tables_count,
        (SELECT COUNT(*) FROM information_schema.views 
         WHERE table_schema = 'public' 
         AND table_name = 'admin_stakeholders_view') as view_count,
        (SELECT COUNT(*) FROM information_schema.routines 
         WHERE routine_schema = 'public' 
         AND routine_name IN ('get_admin_stakeholder_stats', 'list_stakeholders', 'get_stakeholder_details', 
                              'get_stakeholder_type', 'get_stakeholder_id', 'update_stakeholder_status')) as functions_count,
        (SELECT COUNT(*) FROM pg_tables 
         WHERE schemaname = 'public' 
         AND tablename IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos', 'stakeholder_audit_log')
         AND rowsecurity = true) as rls_enabled_count,
        (SELECT COUNT(*) FROM information_schema.triggers 
         WHERE event_object_schema = 'public' 
         AND event_object_table IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos')
         AND trigger_name LIKE 'trigger_%_audit') as triggers_count,
        (SELECT COUNT(*) FROM admin_users WHERE is_active = true) as active_admins_count
)
SELECT 
    '✅ STAKEHOLDER SYSTEM VERIFICATION' as summary,
    CONCAT(tables_count, '/6') as tables,
    CONCAT(view_count, '/1') as views,
    CONCAT(functions_count, '/6') as functions,
    CONCAT(rls_enabled_count, '/6') as rls_policies,
    CONCAT(triggers_count, '/5') as triggers,
    CONCAT(active_admins_count, ' active') as admins,
    CASE 
        WHEN tables_count = 6 AND view_count = 1 AND functions_count = 6 
             AND rls_enabled_count = 6 AND triggers_count = 5 
        THEN '✅ ALL COMPONENTS READY'
        ELSE '⚠️  MISSING COMPONENTS'
    END as overall_status
FROM verification_summary;

\echo ''
\echo '========================================='
\echo 'VERIFICATION COMPLETE'
\echo '========================================='
\echo ''
\echo 'Next Steps:'
\echo '1. If components are missing, run: database/sql/stakeholder-management-system.sql'
\echo '2. If view/functions missing, run: database/sql/admin-stakeholders-view.sql'
\echo '3. Check edge functions deployment with: supabase functions list'
\echo '4. Test frontend integration at: /admin/dashboard (Stakeholders tab)'
\echo ''

