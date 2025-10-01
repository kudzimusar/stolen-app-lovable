-- Test Reward & Verification System
-- Run this in Supabase SQL Editor to check current state

-- 1. Check all Lost & Found reports with their current status
SELECT 
  lfr.id,
  lfr.device_model,
  lfr.report_type,
  lfr.status,
  lfr.verification_status,
  lfr.reward_amount,
  lfr.created_at,
  u.display_name as owner,
  u.email as owner_email,
  COUNT(ct.id) as total_tips,
  COUNT(CASE WHEN ct.tip_type = 'contact_attempt' THEN ct.id END) as contact_attempts,
  COUNT(CASE WHEN ct.tip_type = 'community_tip' THEN ct.id END) as community_tips
FROM lost_found_reports lfr
JOIN users u ON lfr.user_id = u.id
LEFT JOIN community_tips ct ON lfr.id = ct.report_id
GROUP BY lfr.id, lfr.device_model, lfr.report_type, lfr.status, lfr.verification_status, lfr.reward_amount, lfr.created_at, u.display_name, u.email
ORDER BY lfr.created_at DESC;

-- 2. Check all community tips with their types
SELECT 
  ct.id,
  ct.report_id,
  ct.tip_type,
  ct.tip_description,
  ct.created_at,
  u.display_name as tipster,
  u.email as tipster_email,
  lfr.device_model as device,
  lfr.report_type as device_type
FROM community_tips ct
JOIN users u ON ct.tipster_id = u.id
JOIN lost_found_reports lfr ON ct.report_id = lfr.id
ORDER BY ct.created_at DESC;

-- 3. Check reward status distribution
SELECT 
  CASE 
    WHEN reward_amount IS NULL OR reward_amount = 0 THEN 'No Reward'
    WHEN status = 'active' THEN 'Reward Offered'
    WHEN status = 'contacted' THEN 'Reward Pending'
    WHEN status = 'pending_verification' THEN 'Reward Processing'
    WHEN status = 'reunited' THEN 'Reward Paid'
    ELSE 'Unknown'
  END as reward_status,
  COUNT(*) as count
FROM lost_found_reports
GROUP BY 
  CASE 
    WHEN reward_amount IS NULL OR reward_amount = 0 THEN 'No Reward'
    WHEN status = 'active' THEN 'Reward Offered'
    WHEN status = 'contacted' THEN 'Reward Pending'
    WHEN status = 'pending_verification' THEN 'Reward Processing'
    WHEN status = 'reunited' THEN 'Reward Paid'
    ELSE 'Unknown'
  END
ORDER BY count DESC;

-- 4. Check verification status distribution
SELECT 
  verification_status,
  status,
  COUNT(*) as count
FROM lost_found_reports
GROUP BY verification_status, status
ORDER BY verification_status, status;

-- 5. Check if we have any devices that need approval
SELECT 
  lfr.id,
  lfr.device_model,
  lfr.reward_amount,
  lfr.status,
  lfr.verification_status,
  u.display_name as owner,
  COUNT(ct.id) as contact_attempts
FROM lost_found_reports lfr
JOIN users u ON lfr.user_id = u.id
LEFT JOIN community_tips ct ON lfr.id = ct.report_id AND ct.tip_type = 'contact_attempt'
WHERE lfr.status IN ('contacted', 'pending_verification')
  AND lfr.reward_amount > 0
GROUP BY lfr.id, lfr.device_model, lfr.reward_amount, lfr.status, lfr.verification_status, u.display_name
ORDER BY lfr.created_at DESC;

-- 6. Check user activity for testing
SELECT 
  u.id,
  u.display_name,
  u.email,
  COUNT(DISTINCT lfr.id) as total_reports,
  COUNT(DISTINCT CASE WHEN lfr.report_type = 'lost' THEN lfr.id END) as lost_reports,
  COUNT(DISTINCT CASE WHEN lfr.report_type = 'found' THEN lfr.id END) as found_reports,
  COUNT(DISTINCT ct.id) as tips_given,
  COUNT(DISTINCT CASE WHEN ct.tip_type = 'contact_attempt' THEN ct.id END) as contact_attempts
FROM users u
LEFT JOIN lost_found_reports lfr ON u.id = lfr.user_id
LEFT JOIN community_tips ct ON u.id = ct.tipster_id
GROUP BY u.id, u.display_name, u.email
ORDER BY u.created_at DESC
LIMIT 5;
