-- ============================================================================
-- COMPREHENSIVE ADMIN FUNCTIONS FIX - COMPLEX SOLUTION
-- ============================================================================
-- This script provides a sophisticated solution for the admin dashboard functions
-- that handles multiple table structures, column variations, and edge cases
-- while maintaining the complexity required for the app's scale
-- ============================================================================

-- 1. First, let's diagnose the current database structure
SELECT 
    'Database Structure Analysis' as analysis_type,
    schemaname,
    tablename,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'auth.users', 'admin_users')
ORDER BY table_name, ordinal_position;

-- 2. Check what user-related tables exist and their structure
SELECT 
    'User Tables Analysis' as analysis_type,
    table_name,
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%user%' 
   OR table_schema = 'auth'
ORDER BY table_schema, table_name;

-- 3. Create a comprehensive function to get user statistics
CREATE OR REPLACE FUNCTION get_comprehensive_user_stats()
RETURNS JSON AS $$
DECLARE
    v_total_users INTEGER := 0;
    v_active_users INTEGER := 0;
    v_confirmed_users INTEGER := 0;
    v_admin_users INTEGER := 0;
    v_result JSON;
BEGIN
    -- Get total users from auth.users (always exists)
    SELECT COUNT(*) INTO v_total_users FROM auth.users;
    
    -- Get confirmed users (email_confirmed_at is not null)
    SELECT COUNT(*) INTO v_confirmed_users 
    FROM auth.users 
    WHERE email_confirmed_at IS NOT NULL;
    
    -- Check if we have a custom users table with is_active column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) THEN
        -- Use custom users table with is_active column
        SELECT COUNT(*) INTO v_active_users 
        FROM users 
        WHERE is_active = true;
        
        -- Get total from custom users table
        SELECT COUNT(*) INTO v_total_users FROM users;
    ELSE
        -- Fallback: use email_confirmed_at as active indicator
        v_active_users := v_confirmed_users;
    END IF;
    
    -- Get admin users count
    SELECT COUNT(*) INTO v_admin_users 
    FROM admin_users 
    WHERE is_active = true;
    
    -- Build comprehensive result
    v_result := json_build_object(
        'total_users', v_total_users,
        'active_users', v_active_users,
        'confirmed_users', v_confirmed_users,
        'admin_users', v_admin_users,
        'user_source', CASE 
            WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public')
            THEN 'custom_users_table'
            ELSE 'auth_users_only'
        END,
        'has_is_active_column', EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'is_active'
            AND table_schema = 'public'
        )
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create enhanced admin dashboard stats function with comprehensive error handling
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    v_lost_count INTEGER := 0;
    v_found_count INTEGER := 0;
    v_reunited_count INTEGER := 0;
    v_pending_claims INTEGER := 0;
    v_total_reports INTEGER := 0;
    v_active_users INTEGER := 0;
    v_total_users INTEGER := 0;
    v_admin_users INTEGER := 0;
    v_total_revenue NUMERIC := 0;
    v_user_stats JSON;
    v_result JSON;
    v_error_context TEXT;
BEGIN
    -- Get user statistics using comprehensive function
    BEGIN
        SELECT get_comprehensive_user_stats() INTO v_user_stats;
        v_total_users := (v_user_stats->>'total_users')::INTEGER;
        v_active_users := (v_user_stats->>'active_users')::INTEGER;
        v_admin_users := (v_user_stats->>'admin_users')::INTEGER;
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := 'User stats error: ' || SQLERRM;
            -- Fallback to basic auth.users count
            SELECT COUNT(*) INTO v_total_users FROM auth.users;
            v_active_users := v_total_users;
    END;
    
    -- Get report counts with error handling
    BEGIN
        SELECT COUNT(*) INTO v_lost_count FROM lost_found_reports WHERE report_type = 'lost';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := COALESCE(v_error_context, '') || ' | Lost reports error: ' || SQLERRM;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO v_found_count FROM lost_found_reports WHERE report_type = 'found';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := COALESCE(v_error_context, '') || ' | Found reports error: ' || SQLERRM;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO v_reunited_count FROM lost_found_reports WHERE report_type = 'reunited';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := COALESCE(v_error_context, '') || ' | Reunited reports error: ' || SQLERRM;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO v_total_reports FROM lost_found_reports;
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := COALESCE(v_error_context, '') || ' | Total reports error: ' || SQLERRM;
    END;
    
    -- Get pending claims count with error handling
    BEGIN
        SELECT COUNT(*) INTO v_pending_claims FROM device_claims WHERE claim_status = 'pending';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := COALESCE(v_error_context, '') || ' | Pending claims error: ' || SQLERRM;
    END;
    
    -- Get total revenue with error handling
    BEGIN
        SELECT COALESCE(SUM(reward_amount), 0) INTO v_total_revenue 
        FROM lost_found_reports 
        WHERE reward_amount IS NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := COALESCE(v_error_context, '') || ' | Revenue error: ' || SQLERRM;
    END;
    
    -- Build comprehensive result with error context
    v_result := json_build_object(
        'lost_reports', v_lost_count,
        'found_reports', v_found_count,
        'reunited_reports', v_reunited_count,
        'total_reports', v_total_reports,
        'pending_claims', v_pending_claims,
        'active_users', v_active_users,
        'total_users', v_total_users,
        'admin_users', v_admin_users,
        'total_revenue', v_total_revenue,
        'user_stats', v_user_stats,
        'last_updated', NOW(),
        'error_context', COALESCE(v_error_context, 'No errors'),
        'function_version', '2.0_comprehensive'
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create enhanced pending claims function with comprehensive filtering
CREATE OR REPLACE FUNCTION get_pending_claims(
    limit_count INTEGER DEFAULT 10,
    include_metadata BOOLEAN DEFAULT true
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
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id as claim_id,
        dc.report_id,
        dc.claimant_name,
        dc.claimant_email,
        dc.claimant_phone,
        dc.device_serial_provided,
        dc.claim_type,
        dc.claim_status,
        dc.submitted_at,
        lfr.device_model,
        lfr.device_category,
        lfr.location_address,
        lfr.reward_amount,
        EXTRACT(DAY FROM (NOW() - dc.submitted_at))::INTEGER as days_pending,
        -- Priority score: higher reward = higher priority, older claims = higher priority
        (COALESCE(lfr.reward_amount, 0)::INTEGER + EXTRACT(DAY FROM (NOW() - dc.submitted_at))::INTEGER) as priority_score,
        CASE WHEN include_metadata THEN
            json_build_object(
                'claimant_user_id', dc.claimant_user_id,
                'ownership_proof', dc.ownership_proof,
                'claim_description', dc.claim_description,
                'receipt_file_url', dc.receipt_file_url,
                'police_report_file_url', dc.police_report_file_url,
                'additional_files_urls', dc.additional_files_urls,
                'purchase_date', dc.purchase_date,
                'purchase_location', dc.purchase_location,
                'admin_review_notes', dc.admin_review_notes,
                'auto_escalation_date', dc.auto_escalation_date
            )
        ELSE NULL END as metadata
    FROM device_claims dc
    JOIN lost_found_reports lfr ON dc.report_id = lfr.id
    WHERE dc.claim_status = 'pending'
    ORDER BY 
        -- Priority ordering: high reward + old claims first
        (COALESCE(lfr.reward_amount, 0)::INTEGER + EXTRACT(DAY FROM (NOW() - dc.submitted_at))::INTEGER) DESC,
        dc.submitted_at ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to get comprehensive admin system health
CREATE OR REPLACE FUNCTION get_admin_system_health()
RETURNS JSON AS $$
DECLARE
    v_health_status JSON;
    v_table_health JSON;
    v_function_health JSON;
    v_policy_health JSON;
    v_overall_status TEXT;
    v_issues_count INTEGER := 0;
BEGIN
    -- Check table health
    SELECT json_build_object(
        'device_claims_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'device_claims'),
        'lost_found_reports_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lost_found_reports'),
        'admin_users_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users'),
        'users_table_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public'),
        'auth_users_accessible', EXISTS (SELECT 1 FROM auth.users LIMIT 1)
    ) INTO v_table_health;
    
    -- Check function health
    SELECT json_build_object(
        'get_admin_dashboard_stats_exists', EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_admin_dashboard_stats'),
        'get_pending_claims_exists', EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_pending_claims'),
        'get_comprehensive_user_stats_exists', EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_comprehensive_user_stats')
    ) INTO v_function_health;
    
    -- Check RLS policy health
    SELECT json_build_object(
        'device_claims_rls_enabled', EXISTS (
            SELECT 1 FROM pg_class 
            WHERE relname = 'device_claims' 
            AND relrowsecurity = true
        ),
        'admin_users_rls_enabled', EXISTS (
            SELECT 1 FROM pg_class 
            WHERE relname = 'admin_users' 
            AND relrowsecurity = true
        ),
        'device_claims_policies_count', (
            SELECT COUNT(*) FROM pg_policies WHERE tablename = 'device_claims'
        )
    ) INTO v_policy_health;
    
    -- Count issues
    IF NOT (v_table_health->>'device_claims_exists')::BOOLEAN THEN v_issues_count := v_issues_count + 1; END IF;
    IF NOT (v_table_health->>'lost_found_reports_exists')::BOOLEAN THEN v_issues_count := v_issues_count + 1; END IF;
    IF NOT (v_table_health->>'admin_users_exists')::BOOLEAN THEN v_issues_count := v_issues_count + 1; END IF;
    IF NOT (v_function_health->>'get_admin_dashboard_stats_exists')::BOOLEAN THEN v_issues_count := v_issues_count + 1; END IF;
    IF NOT (v_function_health->>'get_pending_claims_exists')::BOOLEAN THEN v_issues_count := v_issues_count + 1; END IF;
    
    -- Determine overall status
    v_overall_status := CASE 
        WHEN v_issues_count = 0 THEN 'HEALTHY'
        WHEN v_issues_count <= 2 THEN 'WARNING'
        ELSE 'CRITICAL'
    END;
    
    -- Build comprehensive health report
    v_health_status := json_build_object(
        'overall_status', v_overall_status,
        'issues_count', v_issues_count,
        'table_health', v_table_health,
        'function_health', v_function_health,
        'policy_health', v_policy_health,
        'checked_at', NOW(),
        'system_version', '2.0_comprehensive'
    );
    
    RETURN v_health_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Test all functions
SELECT 'Testing Comprehensive Functions' as test_type;
SELECT get_comprehensive_user_stats() as user_stats;
SELECT get_admin_dashboard_stats() as dashboard_stats;
SELECT * FROM get_pending_claims(5, true) as pending_claims_sample;
SELECT get_admin_system_health() as system_health;

-- 8. Final verification and status report
SELECT 
    'FINAL SYSTEM STATUS' as status_type,
    'Functions Created' as component,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_admin_dashboard_stats') 
         THEN 'SUCCESS' ELSE 'FAILED' END as status
UNION ALL
SELECT 
    'FINAL SYSTEM STATUS' as status_type,
    'Pending Claims Function' as component,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_pending_claims') 
         THEN 'SUCCESS' ELSE 'FAILED' END as status
UNION ALL
SELECT 
    'FINAL SYSTEM STATUS' as status_type,
    'User Stats Function' as component,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_comprehensive_user_stats') 
         THEN 'SUCCESS' ELSE 'FAILED' END as status
UNION ALL
SELECT 
    'FINAL SYSTEM STATUS' as status_type,
    'System Health Function' as component,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_admin_system_health') 
         THEN 'SUCCESS' ELSE 'FAILED' END as status;
