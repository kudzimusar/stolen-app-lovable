-- Check all active users and their Lost & Found activity
-- Run this in Supabase SQL Editor

-- 1. Check all users with their activity
SELECT 
  u.id,
  u.email,
  u.display_name,
  u.role,
  u.created_at,
  COUNT(DISTINCT lfr.id) as total_reports,
  COUNT(DISTINCT CASE WHEN lfr.report_type = 'lost' THEN lfr.id END) as lost_reports,
  COUNT(DISTINCT CASE WHEN lfr.report_type = 'found' THEN lfr.id END) as found_reports,
  COUNT(DISTINCT ct.id) as tips_given,
  ur.reputation_score,
  ur.trust_level
FROM users u
LEFT JOIN lost_found_reports lfr ON u.id = lfr.user_id
LEFT JOIN community_tips ct ON u.id = ct.tipster_id
LEFT JOIN user_reputation ur ON u.id = ur.user_id
GROUP BY u.id, u.email, u.display_name, u.role, u.created_at, ur.reputation_score, ur.trust_level
ORDER BY u.created_at DESC
LIMIT 10;

-- 2. Check all Lost & Found reports with status
SELECT 
  lfr.id,
  lfr.device_model,
  lfr.report_type,
  lfr.status,
  lfr.reward_amount,
  lfr.created_at,
  u.display_name as owner,
  u.email as owner_email,
  COUNT(ct.id) as response_count
FROM lost_found_reports lfr
JOIN users u ON lfr.user_id = u.id
LEFT JOIN community_tips ct ON lfr.id = ct.report_id
GROUP BY lfr.id, lfr.device_model, lfr.report_type, lfr.status, lfr.reward_amount, lfr.created_at, u.display_name, u.email
ORDER BY lfr.created_at DESC;

-- 3. Check all community tips (contact attempts)
SELECT 
  ct.id,
  ct.report_id,
  ct.tip_type,
  ct.tip_description,
  ct.created_at,
  u.display_name as tipster,
  u.email as tipster_email,
  lfr.device_model as device
FROM community_tips ct
JOIN users u ON ct.tipster_id = u.id
JOIN lost_found_reports lfr ON ct.report_id = lfr.id
ORDER BY ct.created_at DESC;

-- 4. Check user notifications
SELECT 
  un.id,
  un.user_id,
  un.notification_type,
  un.title,
  un.message,
  un.is_read,
  un.created_at,
  u.display_name,
  u.email
FROM user_notifications un
JOIN users u ON un.user_id = u.id
ORDER BY un.created_at DESC
LIMIT 20;