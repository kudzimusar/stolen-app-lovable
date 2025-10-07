-- ============================================================================
-- ADVANCED ADMIN SYSTEM - COMPLETE ENTERPRISE SOLUTION
-- ============================================================================
-- This script provides a comprehensive, enterprise-level admin system
-- that supports the full complexity and scale of the STOLEN App project
-- ============================================================================

-- 1. COMPREHENSIVE DATABASE STRUCTURE ANALYSIS
-- ============================================================================
-- First, let's perform a complete analysis of the existing database structure
-- ============================================================================

-- Analyze all user-related tables and their structures
SELECT 
    'Database Structure Analysis' as analysis_type,
    table_schema,
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'admin_users', 'device_claims', 'lost_found_reports')
   OR table_schema = 'auth'
ORDER BY table_schema, table_name, ordinal_position;

-- Check what user-related tables exist and their relationships
SELECT 
    'User Tables Analysis' as analysis_type,
    table_name,
    table_type,
    table_schema,
    CASE 
        WHEN table_schema = 'auth' THEN 'Authentication System'
        WHEN table_name = 'admin_users' THEN 'Admin Management'
        WHEN table_name = 'users' THEN 'Custom User Management'
        ELSE 'Application Data'
    END as table_purpose
FROM information_schema.tables 
WHERE table_name LIKE '%user%' 
   OR table_schema = 'auth'
   OR table_name IN ('device_claims', 'lost_found_reports')
ORDER BY table_schema, table_name;

-- 2. COMPREHENSIVE USER STATISTICS FUNCTION
-- ============================================================================
-- Advanced function that handles multiple user table scenarios with full error handling
-- ============================================================================

CREATE OR REPLACE FUNCTION get_comprehensive_user_stats()
RETURNS JSON AS $$
DECLARE
    v_total_users INTEGER := 0;
    v_active_users INTEGER := 0;
    v_confirmed_users INTEGER := 0;
    v_admin_users INTEGER := 0;
    v_super_admins INTEGER := 0;
    v_inactive_users INTEGER := 0;
    v_pending_verification INTEGER := 0;
    v_result JSON;
    v_error_context TEXT := '';
    v_user_source TEXT := 'unknown';
BEGIN
    -- Get total users from auth.users (always exists in Supabase)
    BEGIN
        SELECT COUNT(*) INTO v_total_users FROM auth.users;
        v_user_source := 'auth_users';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := 'Auth users error: ' || SQLERRM;
    END;
    
    -- Get confirmed users (email_confirmed_at is not null)
    BEGIN
        SELECT COUNT(*) INTO v_confirmed_users 
        FROM auth.users 
        WHERE email_confirmed_at IS NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := v_error_context || ' | Confirmed users error: ' || SQLERRM;
    END;
    
    -- Check if we have a custom users table with is_active column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) THEN
        BEGIN
            -- Use custom users table with is_active column
            SELECT COUNT(*) INTO v_active_users 
            FROM users 
            WHERE is_active = true;
            
            SELECT COUNT(*) INTO v_inactive_users 
            FROM users 
            WHERE is_active = false;
            
            -- Get total from custom users table
            SELECT COUNT(*) INTO v_total_users FROM users;
            v_user_source := 'custom_users_table';
        EXCEPTION
            WHEN OTHERS THEN
                v_error_context := v_error_context || ' | Custom users error: ' || SQLERRM;
        END;
    ELSE
        -- Fallback: use email_confirmed_at as active indicator
        v_active_users := v_confirmed_users;
        v_inactive_users := v_total_users - v_confirmed_users;
    END IF;
    
    -- Get admin users count with detailed breakdown
    BEGIN
        SELECT COUNT(*) INTO v_admin_users 
        FROM admin_users 
        WHERE is_active = true;
        
        SELECT COUNT(*) INTO v_super_admins 
        FROM admin_users au
        JOIN admin_roles ar ON au.admin_role_id = ar.id
        WHERE au.is_active = true 
        AND ar.role_name = 'super_admin';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := v_error_context || ' | Admin users error: ' || SQLERRM;
    END;
    
    -- Get pending verification count
    BEGIN
        SELECT COUNT(*) INTO v_pending_verification 
        FROM auth.users 
        WHERE email_confirmed_at IS NULL 
        AND created_at > NOW() - INTERVAL '7 days';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := v_error_context || ' | Pending verification error: ' || SQLERRM;
    END;
    
    -- Build comprehensive result with full context
    v_result := json_build_object(
        'total_users', v_total_users,
        'active_users', v_active_users,
        'inactive_users', v_inactive_users,
        'confirmed_users', v_confirmed_users,
        'pending_verification', v_pending_verification,
        'admin_users', v_admin_users,
        'super_admins', v_super_admins,
        'user_source', v_user_source,
        'has_is_active_column', EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'is_active'
            AND table_schema = 'public'
        ),
        'has_custom_users_table', EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'users' 
            AND table_schema = 'public'
        ),
        'error_context', COALESCE(v_error_context, 'No errors'),
        'generated_at', NOW()
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ENHANCED ADMIN DASHBOARD STATS FUNCTION
-- ============================================================================
-- Comprehensive dashboard statistics with full error handling and context
-- ============================================================================

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
    v_pending_rewards NUMERIC := 0;
    v_processed_claims INTEGER := 0;
    v_user_stats JSON;
    v_result JSON;
    v_error_context TEXT := '';
    v_system_health TEXT := 'HEALTHY';
BEGIN
    -- Get comprehensive user statistics
    BEGIN
        SELECT get_comprehensive_user_stats() INTO v_user_stats;
        v_total_users := (v_user_stats->>'total_users')::INTEGER;
        v_active_users := (v_user_stats->>'active_users')::INTEGER;
        v_admin_users := (v_user_stats->>'admin_users')::INTEGER;
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := 'User stats error: ' || SQLERRM;
            v_system_health := 'WARNING';
            -- Fallback to basic auth.users count
            SELECT COUNT(*) INTO v_total_users FROM auth.users;
            v_active_users := v_total_users;
    END;
    
    -- Get report counts with comprehensive error handling
    BEGIN
        SELECT COUNT(*) INTO v_lost_count FROM lost_found_reports WHERE report_type = 'lost';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := v_error_context || ' | Lost reports error: ' || SQLERRM;
            v_system_health := 'WARNING';
    END;
    
    BEGIN
        SELECT COUNT(*) INTO v_found_count FROM lost_found_reports WHERE report_type = 'found';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := v_error_context || ' | Found reports error: ' || SQLERRM;
            v_system_health := 'WARNING';
    END;
    
    BEGIN
        SELECT COUNT(*) INTO v_reunited_count FROM lost_found_reports WHERE report_type = 'reunited';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := v_error_context || ' | Reunited reports error: ' || SQLERRM;
            v_system_health := 'WARNING';
    END;
    
    BEGIN
        SELECT COUNT(*) INTO v_total_reports FROM lost_found_reports;
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := v_error_context || ' | Total reports error: ' || SQLERRM;
            v_system_health := 'CRITICAL';
    END;
    
    -- Get pending claims count with error handling
    BEGIN
        SELECT COUNT(*) INTO v_pending_claims FROM device_claims WHERE claim_status = 'pending';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := v_error_context || ' | Pending claims error: ' || SQLERRM;
            v_system_health := 'WARNING';
    END;
    
    -- Get processed claims count
    BEGIN
        SELECT COUNT(*) INTO v_processed_claims 
        FROM device_claims 
        WHERE claim_status IN ('approved', 'rejected');
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := v_error_context || ' | Processed claims error: ' || SQLERRM;
    END;
    
    -- Get total revenue with comprehensive calculation
    BEGIN
        SELECT COALESCE(SUM(reward_amount), 0) INTO v_total_revenue 
        FROM lost_found_reports 
        WHERE reward_amount IS NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := v_error_context || ' | Revenue error: ' || SQLERRM;
    END;
    
    -- Get pending rewards (offered but not paid)
    BEGIN
        SELECT COALESCE(SUM(reward_amount), 0) INTO v_pending_rewards 
        FROM lost_found_reports 
        WHERE reward_amount IS NOT NULL 
        AND report_type = 'found'
        AND verification_status != 'reunited';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := v_error_context || ' | Pending rewards error: ' || SQLERRM;
    END;
    
    -- Build comprehensive result with full context and health status
    v_result := json_build_object(
        'lost_reports', v_lost_count,
        'found_reports', v_found_count,
        'reunited_reports', v_reunited_count,
        'total_reports', v_total_reports,
        'pending_claims', v_pending_claims,
        'processed_claims', v_processed_claims,
        'active_users', v_active_users,
        'total_users', v_total_users,
        'admin_users', v_admin_users,
        'total_revenue', v_total_revenue,
        'pending_rewards', v_pending_rewards,
        'user_stats', v_user_stats,
        'system_health', v_system_health,
        'last_updated', NOW(),
        'error_context', COALESCE(v_error_context, 'No errors'),
        'function_version', '3.0_enterprise',
        'generated_at', NOW()
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ADVANCED PENDING CLAIMS FUNCTION WITH PRIORITY SCORING
-- ============================================================================
-- Comprehensive claims management with priority scoring and metadata
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

-- 5. COMPREHENSIVE SYSTEM HEALTH MONITORING
-- ============================================================================
-- Advanced system health monitoring with detailed diagnostics
-- ============================================================================

CREATE OR REPLACE FUNCTION get_admin_system_health()
RETURNS JSON AS $$
DECLARE
    v_health_status JSON;
    v_table_health JSON;
    v_function_health JSON;
    v_policy_health JSON;
    v_performance_health JSON;
    v_overall_status TEXT;
    v_issues_count INTEGER := 0;
    v_critical_issues INTEGER := 0;
    v_warnings INTEGER := 0;
BEGIN
    -- Check table health with detailed analysis
    SELECT json_build_object(
        'device_claims_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'device_claims'),
        'lost_found_reports_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lost_found_reports'),
        'admin_users_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users'),
        'admin_roles_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_roles'),
        'users_table_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public'),
        'auth_users_accessible', EXISTS (SELECT 1 FROM auth.users LIMIT 1),
        'device_claims_has_data', (SELECT COUNT(*) > 0 FROM device_claims),
        'lost_found_reports_has_data', (SELECT COUNT(*) > 0 FROM lost_found_reports),
        'admin_users_has_data', (SELECT COUNT(*) > 0 FROM admin_users)
    ) INTO v_table_health;
    
    -- Check function health
    SELECT json_build_object(
        'get_admin_dashboard_stats_exists', EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_admin_dashboard_stats'),
        'get_pending_claims_exists', EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_pending_claims'),
        'get_comprehensive_user_stats_exists', EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_comprehensive_user_stats'),
        'get_admin_system_health_exists', EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_admin_system_health')
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
        'lost_found_reports_rls_enabled', EXISTS (
            SELECT 1 FROM pg_class 
            WHERE relname = 'lost_found_reports' 
            AND relrowsecurity = true
        ),
        'device_claims_policies_count', (
            SELECT COUNT(*) FROM pg_policies WHERE tablename = 'device_claims'
        ),
        'admin_users_policies_count', (
            SELECT COUNT(*) FROM pg_policies WHERE tablename = 'admin_users'
        )
    ) INTO v_policy_health;
    
    -- Check performance health
    SELECT json_build_object(
        'device_claims_count', (SELECT COUNT(*) FROM device_claims),
        'pending_claims_count', (SELECT COUNT(*) FROM device_claims WHERE claim_status = 'pending'),
        'lost_reports_count', (SELECT COUNT(*) FROM lost_found_reports WHERE report_type = 'lost'),
        'found_reports_count', (SELECT COUNT(*) FROM lost_found_reports WHERE report_type = 'found'),
        'admin_users_count', (SELECT COUNT(*) FROM admin_users),
        'active_admin_users_count', (SELECT COUNT(*) FROM admin_users WHERE is_active = true)
    ) INTO v_performance_health;
    
    -- Count issues with severity levels
    IF NOT (v_table_health->>'device_claims_exists')::BOOLEAN THEN 
        v_critical_issues := v_critical_issues + 1; 
    END IF;
    IF NOT (v_table_health->>'lost_found_reports_exists')::BOOLEAN THEN 
        v_critical_issues := v_critical_issues + 1; 
    END IF;
    IF NOT (v_table_health->>'admin_users_exists')::BOOLEAN THEN 
        v_critical_issues := v_critical_issues + 1; 
    END IF;
    IF NOT (v_function_health->>'get_admin_dashboard_stats_exists')::BOOLEAN THEN 
        v_critical_issues := v_critical_issues + 1; 
    END IF;
    IF NOT (v_function_health->>'get_pending_claims_exists')::BOOLEAN THEN 
        v_critical_issues := v_critical_issues + 1; 
    END IF;
    
    -- Count warnings
    IF NOT (v_table_health->>'device_claims_has_data')::BOOLEAN THEN 
        v_warnings := v_warnings + 1; 
    END IF;
    IF NOT (v_table_health->>'lost_found_reports_has_data')::BOOLEAN THEN 
        v_warnings := v_warnings + 1; 
    END IF;
    IF NOT (v_policy_health->>'device_claims_rls_enabled')::BOOLEAN THEN 
        v_warnings := v_warnings + 1; 
    END IF;
    
    v_issues_count := v_critical_issues + v_warnings;
    
    -- Determine overall status
    v_overall_status := CASE 
        WHEN v_critical_issues = 0 AND v_warnings = 0 THEN 'HEALTHY'
        WHEN v_critical_issues = 0 AND v_warnings <= 2 THEN 'WARNING'
        WHEN v_critical_issues <= 2 THEN 'DEGRADED'
        ELSE 'CRITICAL'
    END;
    
    -- Build comprehensive health report
    v_health_status := json_build_object(
        'overall_status', v_overall_status,
        'critical_issues', v_critical_issues,
        'warnings', v_warnings,
        'total_issues', v_issues_count,
        'table_health', v_table_health,
        'function_health', v_function_health,
        'policy_health', v_policy_health,
        'performance_health', v_performance_health,
        'checked_at', NOW(),
        'system_version', '3.0_enterprise',
        'recommendations', CASE 
            WHEN v_critical_issues > 0 THEN 'Critical issues detected - immediate attention required'
            WHEN v_warnings > 2 THEN 'Multiple warnings - review system configuration'
            ELSE 'System operating normally'
        END
    );
    
    RETURN v_health_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ADVANCED CLAIMS ANALYTICS FUNCTION
-- ============================================================================
-- Comprehensive analytics for claims processing and admin insights
-- ============================================================================

CREATE OR REPLACE FUNCTION get_claims_analytics(
    date_from TIMESTAMP DEFAULT (NOW() - INTERVAL '30 days'),
    date_to TIMESTAMP DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
    v_total_claims INTEGER;
    v_pending_claims INTEGER;
    v_approved_claims INTEGER;
    v_rejected_claims INTEGER;
    v_avg_processing_time NUMERIC;
    v_high_priority_claims INTEGER;
    v_claims_by_type JSON;
    v_claims_by_status JSON;
    v_processing_trends JSON;
    v_result JSON;
BEGIN
    -- Get basic claim counts
    SELECT COUNT(*) INTO v_total_claims FROM device_claims WHERE submitted_at BETWEEN date_from AND date_to;
    SELECT COUNT(*) INTO v_pending_claims FROM device_claims WHERE claim_status = 'pending' AND submitted_at BETWEEN date_from AND date_to;
    SELECT COUNT(*) INTO v_approved_claims FROM device_claims WHERE claim_status = 'approved' AND submitted_at BETWEEN date_from AND date_to;
    SELECT COUNT(*) INTO v_rejected_claims FROM device_claims WHERE claim_status = 'rejected' AND submitted_at BETWEEN date_from AND date_to;
    
    -- Get high priority claims
    SELECT COUNT(*) INTO v_high_priority_claims 
    FROM device_claims dc
    JOIN lost_found_reports lfr ON dc.report_id = lfr.id
    WHERE dc.submitted_at BETWEEN date_from AND date_to
    AND (EXTRACT(DAY FROM (NOW() - dc.submitted_at)) > 3 OR COALESCE(lfr.reward_amount, 0) > 500);
    
    -- Calculate average processing time
    SELECT COALESCE(AVG(EXTRACT(DAY FROM (reviewed_at - submitted_at))), 0) INTO v_avg_processing_time
    FROM device_claims 
    WHERE claim_status IN ('approved', 'rejected') 
    AND submitted_at BETWEEN date_from AND date_to
    AND reviewed_at IS NOT NULL;
    
    -- Get claims by type
    SELECT json_object_agg(claim_type, claim_count) INTO v_claims_by_type
    FROM (
        SELECT claim_type, COUNT(*) as claim_count
        FROM device_claims 
        WHERE submitted_at BETWEEN date_from AND date_to
        GROUP BY claim_type
    ) t;
    
    -- Get claims by status
    SELECT json_object_agg(claim_status, status_count) INTO v_claims_by_status
    FROM (
        SELECT claim_status, COUNT(*) as status_count
        FROM device_claims 
        WHERE submitted_at BETWEEN date_from AND date_to
        GROUP BY claim_status
    ) t;
    
    -- Get processing trends (daily)
    SELECT json_object_agg(processing_date, daily_count) INTO v_processing_trends
    FROM (
        SELECT DATE(submitted_at) as processing_date, COUNT(*) as daily_count
        FROM device_claims 
        WHERE submitted_at BETWEEN date_from AND date_to
        GROUP BY DATE(submitted_at)
        ORDER BY processing_date
    ) t;
    
    -- Build comprehensive analytics result
    v_result := json_build_object(
        'date_range', json_build_object(
            'from', date_from,
            'to', date_to
        ),
        'total_claims', v_total_claims,
        'pending_claims', v_pending_claims,
        'approved_claims', v_approved_claims,
        'rejected_claims', v_rejected_claims,
        'high_priority_claims', v_high_priority_claims,
        'avg_processing_time_days', ROUND(v_avg_processing_time, 2),
        'approval_rate', CASE 
            WHEN v_total_claims > 0 THEN ROUND((v_approved_claims::NUMERIC / v_total_claims * 100), 2)
            ELSE 0 
        END,
        'claims_by_type', v_claims_by_type,
        'claims_by_status', v_claims_by_status,
        'processing_trends', v_processing_trends,
        'generated_at', NOW()
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. COMPREHENSIVE TESTING AND VERIFICATION
-- ============================================================================
-- Test all functions and provide detailed status reports
-- ============================================================================

-- Test all functions
SELECT 'Testing Advanced Admin System' as test_type;
SELECT get_comprehensive_user_stats() as user_stats;
SELECT get_admin_dashboard_stats() as dashboard_stats;
SELECT * FROM get_pending_claims(5, true, false) as pending_claims_sample;
SELECT get_admin_system_health() as system_health;
SELECT get_claims_analytics() as claims_analytics;

-- 8. FINAL COMPREHENSIVE STATUS REPORT
-- ============================================================================
-- Detailed verification of all system components
-- ============================================================================

SELECT 
    'ADVANCED ADMIN SYSTEM STATUS' as status_type,
    'Core Functions' as component,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_admin_dashboard_stats') 
         THEN 'SUCCESS' ELSE 'FAILED' END as status,
    'Admin dashboard statistics function' as description
UNION ALL
SELECT 
    'ADVANCED ADMIN SYSTEM STATUS' as status_type,
    'Claims Management' as component,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_pending_claims') 
         THEN 'SUCCESS' ELSE 'FAILED' END as status,
    'Advanced pending claims with priority scoring' as description
UNION ALL
SELECT 
    'ADVANCED ADMIN SYSTEM STATUS' as status_type,
    'User Analytics' as component,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_comprehensive_user_stats') 
         THEN 'SUCCESS' ELSE 'FAILED' END as status,
    'Comprehensive user statistics and analytics' as description
UNION ALL
SELECT 
    'ADVANCED ADMIN SYSTEM STATUS' as status_type,
    'System Health' as component,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_admin_system_health') 
         THEN 'SUCCESS' ELSE 'FAILED' END as status,
    'Advanced system health monitoring and diagnostics' as description
UNION ALL
SELECT 
    'ADVANCED ADMIN SYSTEM STATUS' as status_type,
    'Claims Analytics' as component,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_claims_analytics') 
         THEN 'SUCCESS' ELSE 'FAILED' END as status,
    'Comprehensive claims analytics and reporting' as description
UNION ALL
SELECT 
    'ADVANCED ADMIN SYSTEM STATUS' as status_type,
    'Database Tables' as component,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'device_claims') 
         THEN 'SUCCESS' ELSE 'FAILED' END as status,
    'Device claims table for claim management' as description
UNION ALL
SELECT 
    'ADVANCED ADMIN SYSTEM STATUS' as status_type,
    'Admin Tables' as component,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') 
         THEN 'SUCCESS' ELSE 'FAILED' END as status,
    'Admin users table for role-based access control' as description;
