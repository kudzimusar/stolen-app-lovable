-- ================================================================
-- GET COMPREHENSIVE ADMIN STATS
-- Enhanced function for UnifiedAdminDashboard.tsx
-- ================================================================

CREATE OR REPLACE FUNCTION get_comprehensive_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    -- User Statistics
    'totalUsers', COALESCE((SELECT COUNT(*) FROM users), 0),
    'activeUsers', COALESCE((SELECT COUNT(*) FROM users WHERE verification_status = true), 0),
    'newUsers', COALESCE((SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'), 0),
    
    -- Lost & Found Statistics
    'totalReports', COALESCE((SELECT COUNT(*) FROM lost_found_reports), 0),
    'pendingApprovals', COALESCE((SELECT COUNT(*) FROM lost_found_reports WHERE status IN ('contacted', 'pending_verification')), 0),
    'activeReports', COALESCE((SELECT COUNT(*) FROM lost_found_reports WHERE status = 'active'), 0),
    'reunitedReports', COALESCE((SELECT COUNT(*) FROM lost_found_reports WHERE status = 'reunited'), 0),
    
    -- Marketplace Statistics
    'totalListings', COALESCE((SELECT COUNT(*) FROM marketplace_listings), 0),
    'pendingListings', COALESCE((SELECT COUNT(*) FROM marketplace_listings WHERE status = 'pending'), 0),
    'activeListings', COALESCE((SELECT COUNT(*) FROM marketplace_listings WHERE status = 'approved'), 0),
    
    -- Device Statistics
    'totalDevices', COALESCE((SELECT COUNT(*) FROM devices), 0),
    'blockchainVerified', COALESCE((SELECT COUNT(*) FROM devices WHERE blockchain_hash IS NOT NULL AND blockchain_hash != ''), 0),
    
    -- Financial Statistics
    'totalRevenue', COALESCE((SELECT SUM(amount) FROM transactions WHERE status = 'completed'), 0),
    'pendingRewards', COALESCE((SELECT SUM(reward_amount) FROM lost_found_reports WHERE status IN ('contacted', 'pending_verification') AND reward_amount > 0), 0),
    
    -- Community Statistics
    'totalTips', COALESCE((SELECT COUNT(*) FROM community_tips), 0),
    'totalEvents', COALESCE((SELECT COUNT(*) FROM community_events), 0),
    
    -- System Health
    'lastUpdated', NOW(),
    'systemStatus', 'HEALTHY'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION get_comprehensive_admin_stats() TO authenticated;

-- Test the function
-- SELECT get_comprehensive_admin_stats();

DO $$
BEGIN
  RAISE NOTICE '✅ get_comprehensive_admin_stats() function created successfully!';
END $$;
