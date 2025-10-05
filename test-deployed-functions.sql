-- Test Deployed Functions: admin-approve-claim and submit-claim
-- This script will help test both deployed functions

-- 1. Check current lost_found_reports with claim_pending status
SELECT 
    'Current Claim Pending Reports' as test_type,
    id,
    user_id,
    report_type,
    device_model,
    status,
    claim_status,
    claimant_id,
    claimant_name,
    claim_submitted_at,
    created_at
FROM lost_found_reports 
WHERE claim_status = 'claim_pending'
ORDER BY claim_submitted_at DESC;

-- 2. Check reports that can be used for testing
SELECT 
    'Available Reports for Testing' as test_type,
    id,
    user_id,
    report_type,
    device_model,
    status,
    claim_status,
    reward_amount,
    created_at
FROM lost_found_reports 
WHERE status IN ('active', 'contacted', 'pending_verification')
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check admin users who can approve claims
SELECT 
    'Admin Users for Testing' as test_type,
    au.id as admin_id,
    au.user_id,
    au.role,
    au.permissions,
    u.email,
    COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', 'No Name') as display_name
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
WHERE au.is_active = true
ORDER BY au.created_at DESC;

-- 4. Create a test claim_pending report if none exist
INSERT INTO lost_found_reports (
    user_id,
    report_type,
    device_model,
    device_category,
    description,
    location_found,
    serial_number,
    status,
    claim_status,
    claimant_id,
    claimant_name,
    claim_submitted_at,
    reward_amount,
    created_at,
    updated_at
)
SELECT 
    (SELECT id FROM auth.users LIMIT 1) as user_id,
    'found' as report_type,
    'Test iPhone 15 Pro' as device_model,
    'Smartphone' as device_category,
    'Test device for admin approval workflow testing' as description,
    'Test Location, Johannesburg' as location_found,
    'TEST123456789' as serial_number,
    'active' as status,
    'claim_pending' as claim_status,
    (SELECT id FROM auth.users LIMIT 1) as claimant_id,
    'Test Claimant' as claimant_name,
    NOW() as claim_submitted_at,
    500.00 as reward_amount,
    NOW() as created_at,
    NOW() as updated_at
WHERE NOT EXISTS (
    SELECT 1 FROM lost_found_reports WHERE claim_status = 'claim_pending'
);

-- 5. Verify test data was created
SELECT 
    'Test Data Verification' as test_type,
    id,
    device_model,
    claim_status,
    claimant_name,
    reward_amount
FROM lost_found_reports 
WHERE claim_status = 'claim_pending'
ORDER BY created_at DESC;

-- 6. Check notification system for testing
SELECT 
    'Notification System Check' as test_type,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications
FROM notifications;

-- 7. Summary for testing
SELECT 
    'Testing Summary' as test_type,
    (SELECT COUNT(*) FROM lost_found_reports WHERE claim_status = 'claim_pending') as pending_claims,
    (SELECT COUNT(*) FROM admin_users WHERE is_active = true) as active_admins,
    (SELECT COUNT(*) FROM notifications) as total_notifications;
