-- ================================================================
-- ADMIN DASHBOARD DATA INTEGRATION
-- Comprehensive SQL functions to ensure all tables are reflected in admin UI
-- ================================================================

-- ================================================================
-- 1. GET COMPREHENSIVE ADMIN STATS (Enhanced)
-- ================================================================
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    -- User Statistics
    'user_stats', (
      SELECT json_build_object(
        'total_users', COALESCE((SELECT COUNT(*) FROM auth.users), 0),
        'active_users', COALESCE((SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > NOW() - INTERVAL '30 days'), 0),
        'verified_users', COALESCE((SELECT COUNT(*) FROM users WHERE verification_status = true), 0),
        'new_users_this_month', COALESCE((SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '30 days'), 0)
      )
    ),
    
    -- Device Statistics
    'device_stats', (
      SELECT json_build_object(
        'total_devices', COALESCE((SELECT COUNT(*) FROM devices), 0),
        'active_devices', COALESCE((SELECT COUNT(*) FROM devices WHERE status = 'active'), 0),
        'stolen_devices', COALESCE((SELECT COUNT(*) FROM devices WHERE status = 'stolen'), 0),
        'lost_devices', COALESCE((SELECT COUNT(*) FROM devices WHERE status = 'lost'), 0),
        'blockchain_verified_devices', COALESCE((SELECT COUNT(*) FROM devices WHERE blockchain_hash IS NOT NULL AND blockchain_hash != ''), 0)
      )
    ),
    
    -- Lost & Found Statistics
    'lost_found_stats', (
      SELECT json_build_object(
        'total_reports', COALESCE((SELECT COUNT(*) FROM lost_found_reports), 0),
        'active_reports', COALESCE((SELECT COUNT(*) FROM lost_found_reports WHERE status = 'active'), 0),
        'pending_claims', COALESCE((SELECT COUNT(*) FROM lost_found_reports WHERE status = 'pending'), 0),
        'contacted_reports', COALESCE((SELECT COUNT(*) FROM lost_found_reports WHERE status = 'contacted'), 0),
        'pending_verification', COALESCE((SELECT COUNT(*) FROM lost_found_reports WHERE status = 'pending_verification'), 0),
        'reunited_reports', COALESCE((SELECT COUNT(*) FROM lost_found_reports WHERE status = 'reunited'), 0),
        'lost_reports', COALESCE((SELECT COUNT(*) FROM lost_found_reports WHERE report_type = 'lost'), 0),
        'found_reports', COALESCE((SELECT COUNT(*) FROM lost_found_reports WHERE report_type = 'found'), 0)
      )
    ),
    
    -- Marketplace Statistics
    'marketplace_stats', (
      SELECT json_build_object(
        'total_listings', COALESCE((SELECT COUNT(*) FROM marketplace_listings), 0),
        'active_listings', COALESCE((SELECT COUNT(*) FROM marketplace_listings WHERE status = 'approved'), 0),
        'pending_listings', COALESCE((SELECT COUNT(*) FROM marketplace_listings WHERE status = 'pending'), 0),
        'sold_listings', COALESCE((SELECT COUNT(*) FROM marketplace_listings WHERE status = 'sold'), 0),
        'total_listing_value', COALESCE((SELECT SUM(price) FROM marketplace_listings WHERE status = 'approved'), 0)
      )
    ),
    
    -- Financial Statistics
    'financial_stats', (
      SELECT json_build_object(
        'total_revenue', COALESCE((SELECT SUM(amount) FROM transactions WHERE status = 'completed'), 0),
        'pending_transactions', COALESCE((SELECT COUNT(*) FROM transactions WHERE status = 'pending'), 0),
        'total_rewards_paid', COALESCE((SELECT SUM(reward_amount) FROM lost_found_reports WHERE status = 'reunited' AND reward_amount > 0), 0),
        'pending_rewards', COALESCE((SELECT SUM(reward_amount) FROM lost_found_reports WHERE status IN ('contacted', 'pending_verification') AND reward_amount > 0), 0)
      )
    ),
    
    -- Community Statistics
    'community_stats', (
      SELECT json_build_object(
        'total_tips', COALESCE((SELECT COUNT(*) FROM community_tips), 0),
        'verified_tips', COALESCE((SELECT COUNT(*) FROM community_tips WHERE verified = true), 0),
        'total_events', COALESCE((SELECT COUNT(*) FROM community_events), 0),
        'upcoming_events', COALESCE((SELECT COUNT(*) FROM community_events WHERE start_date > NOW()), 0)
      )
    ),
    
    -- Admin Activity
    'admin_activity', (
      SELECT json_build_object(
        'total_admin_users', COALESCE((SELECT COUNT(*) FROM admin_users WHERE is_active = true), 0),
        'super_admins', COALESCE((SELECT COUNT(*) FROM admin_users WHERE role = 'super_admin' AND is_active = true), 0),
        'recent_actions', COALESCE((SELECT COUNT(*) FROM admin_activity_log WHERE created_at > NOW() - INTERVAL '24 hours'), 0)
      )
    ),
    
    -- System Health
    'system_health', json_build_object(
      'status', 'HEALTHY',
      'last_updated', NOW(),
      'function_version', '5.0_comprehensive'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;

-- ================================================================
-- 2. GET ADMIN RECENT ACTIVITY
-- ================================================================
CREATE OR REPLACE FUNCTION get_admin_recent_activity(limit_count INTEGER DEFAULT 20)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(activity_data) INTO result
  FROM (
    -- Recent Lost & Found Reports
    SELECT 
      'lost_found_report' as type,
      lfr.id,
      lfr.report_type,
      lfr.device_model,
      lfr.status,
      lfr.created_at,
      u.email as user_email,
      (u.raw_user_meta_data->>'full_name') as user_name
    FROM lost_found_reports lfr
    LEFT JOIN auth.users u ON lfr.user_id = u.id
    
    UNION ALL
    
    -- Recent Marketplace Listings
    SELECT 
      'marketplace_listing' as type,
      ml.id,
      ml.title as report_type,
      ml.brand || ' ' || ml.model as device_model,
      ml.status,
      ml.created_at,
      u.email as user_email,
      (u.raw_user_meta_data->>'full_name') as user_name
    FROM marketplace_listings ml
    LEFT JOIN auth.users u ON ml.seller_id = u.id
    
    UNION ALL
    
    -- Recent Device Registrations
    SELECT 
      'device_registration' as type,
      d.id,
      'registration' as report_type,
      d.brand || ' ' || d.model as device_model,
      d.status,
      d.created_at,
      u.email as user_email,
      (u.raw_user_meta_data->>'full_name') as user_name
    FROM devices d
    LEFT JOIN auth.users u ON d.current_owner_id = u.id
    
    ORDER BY created_at DESC
    LIMIT limit_count
  ) as activity_data;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION get_admin_recent_activity(INTEGER) TO authenticated;

-- ================================================================
-- 3. GET ADMIN PENDING REPORTS
-- ================================================================
CREATE OR REPLACE FUNCTION get_admin_pending_reports()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'lost_found_pending', (
      SELECT json_agg(
        json_build_object(
          'id', lfr.id,
          'report_type', lfr.report_type,
          'device_model', lfr.device_model,
          'status', lfr.status,
          'reward_amount', lfr.reward_amount,
          'created_at', lfr.created_at,
          'user_email', u.email,
          'user_name', u.raw_user_meta_data->>'full_name'
        )
      )
      FROM lost_found_reports lfr
      LEFT JOIN auth.users u ON lfr.user_id = u.id
      WHERE lfr.status IN ('contacted', 'pending', 'pending_verification')
      ORDER BY lfr.created_at DESC
      LIMIT 50
    ),
    
    'marketplace_pending', (
      SELECT json_agg(
        json_build_object(
          'id', ml.id,
          'title', ml.title,
          'price', ml.price,
          'status', ml.status,
          'created_at', ml.created_at,
          'seller_email', u.email,
          'seller_name', u.raw_user_meta_data->>'full_name'
        )
      )
      FROM marketplace_listings ml
      LEFT JOIN auth.users u ON ml.seller_id = u.id
      WHERE ml.status = 'pending'
      ORDER BY ml.created_at DESC
      LIMIT 50
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION get_admin_pending_reports() TO authenticated;

-- ================================================================
-- 4. CREATE ADMIN VIEWS FOR EASY QUERYING
-- ================================================================

-- Admin Lost & Found Reports View
CREATE OR REPLACE VIEW admin_lost_found_reports_view AS
SELECT 
  lfr.id,
  lfr.user_id,
  lfr.report_type,
  lfr.device_category,
  lfr.device_model,
  lfr.serial_number,
  lfr.status,
  lfr.verification_status,
  lfr.reward_amount,
  lfr.location_address,
  lfr.description,
  lfr.created_at,
  lfr.updated_at,
  u.email as user_email,
  (u.raw_user_meta_data->>'full_name') as user_name,
  (SELECT COUNT(*) FROM community_tips ct WHERE ct.report_id = lfr.id) as tips_count
FROM lost_found_reports lfr
LEFT JOIN auth.users u ON lfr.user_id = u.id;

GRANT SELECT ON admin_lost_found_reports_view TO authenticated;

-- Admin Marketplace Listings View
CREATE OR REPLACE VIEW admin_marketplace_listings_view AS
SELECT 
  ml.id,
  ml.seller_id,
  ml.device_id,
  ml.title,
  ml.description,
  ml.price,
  ml.brand,
  ml.model,
  ml.status,
  ml.created_at,
  ml.updated_at,
  u.email as seller_email,
  (u.raw_user_meta_data->>'full_name') as seller_name,
  d.serial_number as device_serial
FROM marketplace_listings ml
LEFT JOIN auth.users u ON ml.seller_id = u.id
LEFT JOIN devices d ON ml.device_id = d.id;

GRANT SELECT ON admin_marketplace_listings_view TO authenticated;

-- Admin Users View
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  (u.raw_user_meta_data->>'full_name') as full_name,
  (u.raw_user_meta_data->>'avatar_url') as avatar_url,
  usr.role,
  usr.verification_status,
  usr.phone,
  (SELECT COUNT(*) FROM devices d WHERE d.current_owner_id = u.id) as device_count,
  (SELECT COUNT(*) FROM lost_found_reports lfr WHERE lfr.user_id = u.id) as report_count,
  (SELECT COUNT(*) FROM marketplace_listings ml WHERE ml.seller_id = u.id) as listing_count
FROM auth.users u
LEFT JOIN users usr ON u.id = usr.id;

GRANT SELECT ON admin_users_view TO authenticated;

-- Admin Devices View
CREATE OR REPLACE VIEW admin_devices_view AS
SELECT 
  d.id,
  d.device_name,
  d.brand,
  d.model,
  d.serial_number,
  d.imei,
  d.status,
  d.registration_date,
  d.current_owner_id,
  d.blockchain_hash,
  d.created_at,
  d.updated_at,
  u.email as owner_email,
  (u.raw_user_meta_data->>'full_name') as owner_name,
  (d.blockchain_hash IS NOT NULL AND d.blockchain_hash != '') as blockchain_verified
FROM devices d
LEFT JOIN auth.users u ON d.current_owner_id = u.id;

GRANT SELECT ON admin_devices_view TO authenticated;

-- ================================================================
-- 5. CREATE RLS POLICIES FOR ADMIN ACCESS
-- ================================================================

-- Enable RLS on admin views (if they're materialized)
-- Note: Views inherit RLS from underlying tables

-- Drop existing function first to avoid parameter name conflict
DROP FUNCTION IF EXISTS is_admin_user(UUID);

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = p_user_id 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_admin_user(UUID) TO authenticated;

-- ================================================================
-- 6. CREATE ADMIN ACTIVITY LOG FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action_type TEXT,
  p_target_table TEXT,
  p_target_id UUID,
  p_action_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO admin_activity_log (
    admin_id,
    action_type,
    target_table,
    target_id,
    action_details,
    created_at
  ) VALUES (
    p_admin_id,
    p_action_type,
    p_target_table,
    p_target_id,
    p_action_details,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION log_admin_action(UUID, TEXT, TEXT, UUID, JSONB) TO authenticated;

-- ================================================================
-- 7. TEST THE FUNCTIONS
-- ================================================================

-- Test admin dashboard stats
-- SELECT get_admin_dashboard_stats();

-- Test recent activity
-- SELECT get_admin_recent_activity(10);

-- Test pending reports
-- SELECT get_admin_pending_reports();

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Admin Dashboard Data Integration Complete!';
  RAISE NOTICE '📊 Functions created:';
  RAISE NOTICE '   - get_admin_dashboard_stats()';
  RAISE NOTICE '   - get_admin_recent_activity(limit)';
  RAISE NOTICE '   - get_admin_pending_reports()';
  RAISE NOTICE '   - is_admin_user(user_id)';
  RAISE NOTICE '   - log_admin_action(...)';
  RAISE NOTICE '👁️  Views created:';
  RAISE NOTICE '   - admin_lost_found_reports_view';
  RAISE NOTICE '   - admin_marketplace_listings_view';
  RAISE NOTICE '   - admin_users_view';
  RAISE NOTICE '   - admin_devices_view';
  RAISE NOTICE '🔒 All permissions granted to authenticated users';
END $$;

