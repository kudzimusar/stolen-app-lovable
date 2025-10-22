-- ================================================================
-- STAKEHOLDER SYSTEM VERIFICATION SCRIPT (SUPABASE COMPATIBLE)
-- Run this in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- 1. CHECK STAKEHOLDER TABLES
-- ================================================================

SELECT 
    '1. STAKEHOLDER TABLES' as check_category,
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

-- ================================================================
-- 2. CHECK STAKEHOLDER VIEW
-- ================================================================

SELECT 
    '2. STAKEHOLDER VIEW' as check_category,
    table_name as view_name,
    '✅ EXISTS' as status
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'admin_stakeholders_view'
UNION ALL
SELECT 
    '2. STAKEHOLDER VIEW' as check_category,
    'admin_stakeholders_view' as view_name,
    '❌ MISSING' as status
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'admin_stakeholders_view'
);

-- ================================================================
-- 3. CHECK DATABASE FUNCTIONS
-- ================================================================

SELECT 
    '3. DATABASE FUNCTIONS' as check_category,
    routine_name as function_name,
    '✅ EXISTS' as status
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

-- ================================================================
-- 4. CHECK ROW LEVEL SECURITY (RLS)
-- ================================================================

SELECT 
    '4. RLS STATUS' as check_category,
    tablename as table_name,
    CASE 
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos', 'stakeholder_audit_log')
ORDER BY tablename;

-- ================================================================
-- 5. CHECK INDEXES
-- ================================================================

SELECT 
    '5. INDEXES' as check_category,
    tablename as table_name,
    indexname as index_name,
    '✅ EXISTS' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos', 'stakeholder_audit_log')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ================================================================
-- 6. CHECK AUDIT TRIGGERS
-- ================================================================

SELECT 
    '6. AUDIT TRIGGERS' as check_category,
    event_object_table as table_name,
    trigger_name,
    '✅ EXISTS' as status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos')
AND trigger_name LIKE 'trigger_%_audit'
ORDER BY event_object_table;

-- ================================================================
-- 7. CHECK DATA COUNTS
-- ================================================================

SELECT 
    '7. DATA COUNTS' as check_category,
    'retailers' as table_name,
    COUNT(*) as record_count
FROM retailers
UNION ALL
SELECT 
    '7. DATA COUNTS' as check_category,
    'repair_shops' as table_name,
    COUNT(*) as record_count
FROM repair_shops
UNION ALL
SELECT 
    '7. DATA COUNTS' as check_category,
    'law_enforcement' as table_name,
    COUNT(*) as record_count
FROM law_enforcement
UNION ALL
SELECT 
    '7. DATA COUNTS' as check_category,
    'insurance_partners' as table_name,
    COUNT(*) as record_count
FROM insurance_partners
UNION ALL
SELECT 
    '7. DATA COUNTS' as check_category,
    'ngos' as table_name,
    COUNT(*) as record_count
FROM ngos
UNION ALL
SELECT 
    '7. DATA COUNTS' as check_category,
    'stakeholder_audit_log' as table_name,
    COUNT(*) as record_count
FROM stakeholder_audit_log;

-- ================================================================
-- 8. CHECK ADMIN USERS
-- ================================================================

SELECT 
    '8. ADMIN USERS' as check_category,
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

-- ================================================================
-- 9. FINAL SUMMARY
-- ================================================================

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
    '9. FINAL SUMMARY' as check_category,
    CONCAT('Tables: ', tables_count, '/6') as tables,
    CONCAT('Views: ', view_count, '/1') as views,
    CONCAT('Functions: ', functions_count, '/6') as functions,
    CONCAT('RLS: ', rls_enabled_count, '/6') as rls_policies,
    CONCAT('Triggers: ', triggers_count, '/5') as triggers,
    CONCAT('Admins: ', active_admins_count, ' active') as admins,
    CASE 
        WHEN tables_count = 6 AND view_count = 1 AND functions_count = 6 
             AND rls_enabled_count = 6 AND triggers_count = 5 
        THEN '✅ ALL COMPONENTS READY'
        ELSE '⚠️ MISSING COMPONENTS - Check results above'
    END as overall_status
FROM verification_summary;

-- ================================================================
-- INSTRUCTIONS
-- ================================================================

/*
VERIFICATION COMPLETE!

INTERPRETING RESULTS:
- Look for ✅ (components exist) or ❌ (components missing)
- Check the FINAL SUMMARY row for overall status

IF COMPONENTS ARE MISSING:
1. Tables/View/Functions missing:
   → Run: database/sql/stakeholder-management-system.sql
   → Run: database/sql/admin-stakeholders-view.sql

2. RLS disabled:
   → Re-run: database/sql/stakeholder-management-system.sql

3. Triggers missing:
   → Re-run: database/sql/stakeholder-management-system.sql

4. No active admins:
   → Add admin user with:
   INSERT INTO admin_users (user_id, permissions, is_active)
   VALUES ('YOUR_USER_ID', '["admin:full"]'::jsonb, true);

NEXT STEPS:
1. If all components exist, test edge functions:
   → Run in terminal: node scripts/verify-edge-functions.js

2. If edge functions work, test API connections:
   → Run in terminal: node scripts/test-stakeholder-api.js

3. Manual browser test:
   → Open: http://localhost:8080/admin/dashboard
   → Click: Stakeholders tab
*/

