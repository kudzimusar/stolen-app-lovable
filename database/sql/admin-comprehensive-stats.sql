-- Create comprehensive admin statistics function that includes device data
-- This ensures admin portal has complete userbase visibility including My Devices data

CREATE OR REPLACE FUNCTION get_comprehensive_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    -- User Statistics
    'user_stats', (
      SELECT json_build_object(
        'total_users', COUNT(*),
        'active_users', COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days'),
        'admin_users', (SELECT COUNT(*) FROM admin_users WHERE is_active = true),
        'super_admins', (SELECT COUNT(*) FROM admin_users WHERE role = 'super_admin' AND is_active = true)
      )
      FROM auth.users
    ),
    
    -- Device Statistics (My Devices Integration)
    'device_stats', (
      SELECT json_build_object(
        'total_devices', COUNT(*),
        'active_devices', COUNT(*) FILTER (WHERE status = 'active'),
        'stolen_devices', COUNT(*) FILTER (WHERE status = 'stolen'),
        'lost_devices', COUNT(*) FILTER (WHERE status = 'lost'),
        'blockchain_verified', COUNT(*) FILTER (WHERE blockchain_hash IS NOT NULL AND blockchain_hash != ''),
        'devices_by_brand', (
          SELECT json_object_agg(brand, brand_count)
          FROM (
            SELECT brand, COUNT(*) as brand_count
            FROM devices
            GROUP BY brand
            ORDER BY brand_count DESC
            LIMIT 10
          ) brand_stats
        ),
        'devices_by_status', (
          SELECT json_object_agg(status, status_count)
          FROM (
            SELECT status, COUNT(*) as status_count
            FROM devices
            GROUP BY status
          ) status_stats
        ),
        'recent_registrations', (
          SELECT COUNT(*)
          FROM devices
          WHERE registration_date > NOW() - INTERVAL '7 days'
        )
      )
      FROM devices
    ),
    
    -- Lost & Found Statistics
    'lost_found_stats', (
      SELECT json_build_object(
        'total_reports', COUNT(*),
        'lost_reports', COUNT(*) FILTER (WHERE report_type = 'lost'),
        'found_reports', COUNT(*) FILTER (WHERE report_type = 'found'),
        'reunited_reports', COUNT(*) FILTER (WHERE status = 'reunited'),
        'pending_claims', COUNT(*) FILTER (WHERE status = 'pending'),
        'processed_claims', COUNT(*) FILTER (WHERE status = 'processed')
      )
      FROM lost_found_reports
    ),
    
    -- System Health
    'system_health', 'HEALTHY',
    
    -- Financial Statistics
    'financial_stats', (
      SELECT json_build_object(
        'total_revenue', COALESCE(SUM(amount), 0),
        'pending_rewards', (
          SELECT COALESCE(SUM(reward_amount), 0)
          FROM lost_found_reports
          WHERE reward_amount IS NOT NULL AND status = 'pending'
        )
      )
      FROM transactions
    ),
    
    -- Admin Activity
    'admin_activity', (
      SELECT json_build_object(
        'total_actions', COUNT(*),
        'recent_actions', COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')
      )
      FROM admin_activity_log
    ),
    
    -- Last Updated
    'last_updated', NOW(),
    'function_version', '4.0_comprehensive'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to admin users
GRANT EXECUTE ON FUNCTION get_comprehensive_admin_stats() TO authenticated;

-- Create a view for easy querying of device statistics by admin
CREATE OR REPLACE VIEW admin_device_summary AS
SELECT 
  d.id,
  d.device_name,
  d.brand,
  d.model,
  d.status,
  d.registration_date,
  d.blockchain_hash IS NOT NULL as blockchain_verified,
  d.current_owner_id,
  u.email as owner_email,
  u.raw_user_meta_data->>'full_name' as owner_name,
  d.created_at,
  d.updated_at
FROM devices d
LEFT JOIN auth.users u ON d.current_owner_id = u.id;

-- Grant access to admin users
GRANT SELECT ON admin_device_summary TO authenticated;

-- Create a function to get user device details for admin
CREATE OR REPLACE FUNCTION get_user_device_details(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_info', (
      SELECT json_build_object(
        'id', u.id,
        'email', u.email,
        'full_name', u.raw_user_meta_data->>'full_name',
        'created_at', u.created_at,
        'last_sign_in', u.last_sign_in_at
      )
      FROM auth.users u
      WHERE u.id = user_id
    ),
    'devices', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', d.id,
          'device_name', d.device_name,
          'brand', d.brand,
          'model', d.model,
          'status', d.status,
          'registration_date', d.registration_date,
          'blockchain_hash', d.blockchain_hash,
          'blockchain_verified', d.blockchain_hash IS NOT NULL AND d.blockchain_hash != ''
        )
      ), '[]'::json)
      FROM devices d
      WHERE d.current_owner_id = user_id
    ),
    'device_count', (
      SELECT COUNT(*)
      FROM devices d
      WHERE d.current_owner_id = user_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_device_details(UUID) TO authenticated;
