-- ============================================================================
-- UPDATE ADMIN DASHBOARD TO SHOW PENDING CLAIMS
-- ============================================================================
-- This script ensures the admin dashboard shows pending claims for review
-- ============================================================================

-- 1. Check if device_claims table exists and has data
SELECT 
    'Device Claims Check' as test_type,
    COUNT(*) as total_claims,
    COUNT(CASE WHEN claim_status = 'pending' THEN 1 END) as pending_claims,
    COUNT(CASE WHEN claim_status = 'approved' THEN 1 END) as approved_claims,
    COUNT(CASE WHEN claim_status = 'rejected' THEN 1 END) as rejected_claims
FROM device_claims;

-- 2. Check if get_admin_dashboard_stats function exists
SELECT 
    'Function Check' as test_type,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_admin_dashboard_stats';

-- 3. Update the get_admin_dashboard_stats function to include claims data
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    v_lost_count INTEGER;
    v_found_count INTEGER;
    v_reunited_count INTEGER;
    v_pending_claims INTEGER;
    v_total_reports INTEGER;
    v_active_users INTEGER;
    v_total_revenue NUMERIC;
    v_result JSON;
BEGIN
    -- Get report counts
    SELECT COUNT(*) INTO v_lost_count FROM lost_found_reports WHERE report_type = 'lost';
    SELECT COUNT(*) INTO v_found_count FROM lost_found_reports WHERE report_type = 'found';
    SELECT COUNT(*) INTO v_reunited_count FROM lost_found_reports WHERE report_type = 'reunited';
    SELECT COUNT(*) INTO v_total_reports FROM lost_found_reports;
    
    -- Get pending claims count
    SELECT COUNT(*) INTO v_pending_claims FROM device_claims WHERE claim_status = 'pending';
    
    -- Get active users count
    SELECT COUNT(*) INTO v_active_users FROM users WHERE is_active = true;
    
    -- Get total revenue (placeholder - update based on your revenue logic)
    SELECT COALESCE(SUM(reward_amount), 0) INTO v_total_revenue FROM lost_found_reports WHERE reward_amount IS NOT NULL;
    
    -- Build result JSON
    v_result := json_build_object(
        'lost_reports', v_lost_count,
        'found_reports', v_found_count,
        'reunited_reports', v_reunited_count,
        'total_reports', v_total_reports,
        'pending_claims', v_pending_claims,
        'active_users', v_active_users,
        'total_revenue', v_total_revenue,
        'last_updated', NOW()
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to get pending claims for admin review
CREATE OR REPLACE FUNCTION get_pending_claims(limit_count INTEGER DEFAULT 10)
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
    reward_amount NUMERIC
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
        lfr.reward_amount
    FROM device_claims dc
    JOIN lost_found_reports lfr ON dc.report_id = lfr.id
    WHERE dc.claim_status = 'pending'
    ORDER BY dc.submitted_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Test the updated functions
SELECT 'Testing Updated Functions' as test_type;
SELECT get_admin_dashboard_stats() as dashboard_stats;
SELECT * FROM get_pending_claims(5) as pending_claims_sample;

-- 6. Create RLS policies for device_claims table if they don't exist
DO $$
BEGIN
    -- Enable RLS on device_claims table
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'device_claims' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE device_claims ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Create policy for admins to see all claims
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'device_claims' 
        AND policyname = 'admin_claims_policy'
    ) THEN
        CREATE POLICY admin_claims_policy ON device_claims
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM admin_users 
                WHERE user_id = auth.uid() 
                AND is_active = true
            )
        );
    END IF;
    
    -- Create policy for users to see their own claims
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'device_claims' 
        AND policyname = 'user_own_claims_policy'
    ) THEN
        CREATE POLICY user_own_claims_policy ON device_claims
        FOR SELECT TO authenticated
        USING (claimant_user_id = auth.uid());
    END IF;
END $$;

-- 7. Verify the setup
SELECT 
    'Final Verification' as test_type,
    'Admin Dashboard Stats Function' as component,
    CASE WHEN EXISTS(
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_admin_dashboard_stats'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'Final Verification' as test_type,
    'Pending Claims Function' as component,
    CASE WHEN EXISTS(
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_pending_claims'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'Final Verification' as test_type,
    'Device Claims RLS' as component,
    CASE WHEN EXISTS(
        SELECT 1 FROM pg_class 
        WHERE relname = 'device_claims' 
        AND relrowsecurity = true
    ) THEN 'ENABLED' ELSE 'DISABLED' END as status;
