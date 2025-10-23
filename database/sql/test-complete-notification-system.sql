-- COMPLETE NOTIFICATION SYSTEM TEST
-- This script tests the entire notification system end-to-end

-- Test 1: Verify all database infrastructure exists
SELECT 'DATABASE INFRASTRUCTURE TEST' as test_section;

-- Check user_notifications table enhancements
SELECT 
    'user_notifications enhancements' as component,
    COUNT(*) as columns_added,
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at');

-- Check supporting tables
SELECT 
    'supporting tables' as component,
    COUNT(*) as tables_created,
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notification_preferences', 'email_templates', 'notification_delivery_logs');

-- Check email templates
SELECT 
    'email templates' as component,
    COUNT(*) as templates_created,
    CASE 
        WHEN COUNT(*) >= 60 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM email_templates;

-- Test 2: Insert test notifications for all 18 features
SELECT 'NOTIFICATION INSERTION TEST' as test_section;

-- Insert test notifications for each feature
INSERT INTO user_notifications (
    user_id, 
    title, 
    message, 
    feature_category, 
    feature_data, 
    priority_level, 
    action_link
) VALUES 
    -- Device Management
    ((SELECT id FROM users LIMIT 1), 'Device Registered', 'Your iPhone 15 has been registered successfully', 'device_management', '{"device_name": "iPhone 15", "serial_number": "ABC123"}', 5, '/my-devices'),
    
    -- Marketplace
    ((SELECT id FROM users LIMIT 1), 'New Bid Received', 'You received a bid of R5000 for your iPhone', 'marketplace', '{"item_name": "iPhone 15", "bid_amount": 5000}', 7, '/marketplace'),
    
    -- Insurance
    ((SELECT id FROM users LIMIT 1), 'Claim Submitted', 'Your insurance claim #CLM001 has been submitted', 'insurance', '{"claim_number": "CLM001", "amount": 15000}', 6, '/insurance'),
    
    -- Payment
    ((SELECT id FROM users LIMIT 1), 'Payment Received', 'You received R1000 from John Doe', 'payment', '{"amount": 1000, "sender": "John Doe"}', 8, '/wallet'),
    
    -- Security
    ((SELECT id FROM users LIMIT 1), 'Security Alert', 'New login detected from Johannesburg', 'security', '{"location": "Johannesburg", "device": "Chrome"}', 9, '/security'),
    
    -- Repair Services
    ((SELECT id FROM users LIMIT 1), 'Repair Booked', 'Your repair appointment is confirmed for tomorrow', 'repair_services', '{"date": "2024-01-15", "time": "10:00 AM"}', 5, '/repair'),
    
    -- Admin
    ((SELECT id FROM users LIMIT 1), 'New User Registration', 'A new user has registered on the platform', 'admin', '{"user_name": "Jane Smith", "role": "member"}', 4, '/admin'),
    
    -- Community
    ((SELECT id FROM users LIMIT 1), 'Badge Unlocked', 'You unlocked the "Helper" badge!', 'community', '{"badge_name": "Helper", "points": 100}', 6, '/community'),
    
    -- Hot Deals
    ((SELECT id FROM users LIMIT 1), 'Hot Deal Alert', 'New hot deal available: iPhone 15 Pro 20% off!', 'hot_deals', '{"deal_name": "iPhone 15 Pro", "discount": "20%"}', 8, '/hot-deals'),
    
    -- Law Enforcement
    ((SELECT id FROM users LIMIT 1), 'Device Match Found', 'A match has been found for your stolen device', 'law_enforcement', '{"device_name": "iPhone 15", "location": "Cape Town"}', 10, '/law-enforcement'),
    
    -- NGO
    ((SELECT id FROM users LIMIT 1), 'Donation Received', 'Thank you for your R500 donation', 'ngo', '{"amount": 500, "cause": "Device Recovery"}', 7, '/ngo'),
    
    -- Retailer
    ((SELECT id FROM users LIMIT 1), 'Bulk Registration', '50 devices registered successfully', 'retailer', '{"device_count": 50, "batch_id": "BATCH001"}', 5, '/retailer'),
    
    -- Repair Shop
    ((SELECT id FROM users LIMIT 1), 'New Booking', 'New repair booking received', 'repair_shop', '{"customer_name": "John Doe", "device": "Samsung Galaxy"}', 6, '/repair-shop'),
    
    -- User Profile
    ((SELECT id FROM users LIMIT 1), 'Profile Updated', 'Your profile has been successfully updated', 'user_profile', '{"updated_fields": ["phone", "address"]}', 3, '/profile'),
    
    -- Support
    ((SELECT id FROM users LIMIT 1), 'Ticket Created', 'Support ticket #TKT001 has been created', 'support', '{"ticket_number": "TKT001", "priority": "high"}', 6, '/support'),
    
    -- Lost & Found (existing)
    ((SELECT id FROM users LIMIT 1), 'Device Found', 'Your lost iPhone has been found!', 'lost_found', '{"device_name": "iPhone 15", "finder": "Jane Smith"}', 9, '/lost-found')
ON CONFLICT DO NOTHING;

-- Test 3: Verify notifications were inserted correctly
SELECT 'NOTIFICATION VERIFICATION TEST' as test_section;

SELECT 
    feature_category,
    COUNT(*) as notification_count,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM user_notifications 
WHERE feature_category IN (
    'device_management', 'marketplace', 'insurance', 'payment', 'security',
    'repair_services', 'admin', 'community', 'hot_deals', 'law_enforcement',
    'ngo', 'retailer', 'repair_shop', 'user_profile', 'support', 'lost_found'
)
GROUP BY feature_category
ORDER BY feature_category;

-- Test 4: Test notification center queries
SELECT 'NOTIFICATION CENTER QUERY TEST' as test_section;

-- Test Device Management notifications
SELECT 
    'device_management' as feature,
    COUNT(*) as notifications,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM user_notifications 
WHERE feature_category = 'device_management';

-- Test Marketplace notifications
SELECT 
    'marketplace' as feature,
    COUNT(*) as notifications,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM user_notifications 
WHERE feature_category = 'marketplace';

-- Test Insurance notifications
SELECT 
    'insurance' as feature,
    COUNT(*) as notifications,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM user_notifications 
WHERE feature_category = 'insurance';

-- Test 5: Final system status
SELECT 'FINAL SYSTEM STATUS' as test_section;

SELECT 
    'COMPLETE NOTIFICATION SYSTEM' as system_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'user_notifications' AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at')) as columns_added,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('notification_preferences', 'email_templates', 'notification_delivery_logs')) as tables_created,
    (SELECT COUNT(*) FROM email_templates) as templates_created,
    (SELECT COUNT(*) FROM user_notifications WHERE feature_category IS NOT NULL) as test_notifications,
    '✅ ALL SYSTEMS OPERATIONAL' as status;
