-- STEP 4: Populate email templates (run AFTER tables are created)
-- This script inserts all email templates for the 18 notification features

INSERT INTO email_templates (feature_category, notification_type, template_name, subject_template, html_template, text_template)
VALUES 
    -- Lost & Found
    ('lost_found', 'device_found', 'Device Found Notification', 'Your {{device_name}} has been found!', '<h1>Great news!</h1><p>Your {{device_name}} has been found.</p>', 'Your {{device_name}} has been found.'),
    ('lost_found', 'contact_response', 'Contact Response', 'Response to your lost device report', '<h1>Response Received</h1><p>Someone responded to your lost device report.</p>', 'Response received for your lost device.'),
    
    -- Device Management
    ('device_management', 'device_registered', 'Device Registration', 'Device {{device_name}} Registered', '<h1>Device Registered</h1><p>{{device_name}} ({{serial_number}}) registered successfully.</p>', 'Device registered successfully.'),
    ('device_management', 'device_verified', 'Device Verification', 'Device Verified Successfully', '<h1>Verification Complete</h1><p>Your device is now verified.</p>', 'Device verified.'),
    ('device_management', 'transfer_initiated', 'Device Transfer', 'Device Transfer Initiated', '<h1>Transfer Started</h1><p>Your device transfer has been initiated.</p>', 'Device transfer started.'),
    ('device_management', 'warranty_expiring', 'Warranty Expiry', 'Warranty Expiring Soon', '<h1>Warranty Alert</h1><p>Your device warranty expires soon.</p>', 'Warranty expiring soon.'),
    
    -- Marketplace
    ('marketplace', 'listing_created', 'Listing Created', 'Your {{item_name}} is Live', '<h1>Listing Live</h1><p>{{item_name}} is now live on marketplace.</p>', 'Listing created successfully.'),
    ('marketplace', 'bid_received', 'New Bid', 'New Bid: R{{bid_amount}}', '<h1>New Bid!</h1><p>R{{bid_amount}} bid on {{item_name}}.</p>', 'New bid received.'),
    ('marketplace', 'item_sold', 'Item Sold', 'Your {{item_name}} has been sold!', '<h1>Item Sold!</h1><p>{{item_name}} has been sold for R{{price}}.</p>', 'Item sold successfully.'),
    ('marketplace', 'price_drop', 'Price Drop Alert', 'Price dropped on {{item_name}}', '<h1>Price Drop!</h1><p>{{item_name}} price dropped to R{{new_price}}.</p>', 'Price drop alert.'),
    
    -- Insurance
    ('insurance', 'claim_submitted', 'Claim Submitted', 'Claim #{{claim_number}} Submitted', '<h1>Claim Submitted</h1><p>Your claim is under review.</p>', 'Claim submitted successfully.'),
    ('insurance', 'claim_approved', 'Claim Approved', 'Claim Approved - R{{amount}}', '<h1>Claim Approved!</h1><p>R{{amount}} approved.</p>', 'Claim approved.'),
    ('insurance', 'claim_rejected', 'Claim Rejected', 'Claim #{{claim_number}} Rejected', '<h1>Claim Rejected</h1><p>Your claim has been rejected.</p>', 'Claim rejected.'),
    ('insurance', 'fraud_alert', 'Fraud Alert', 'Fraud Alert Detected', '<h1>Fraud Alert</h1><p>Suspicious activity detected on your account.</p>', 'Fraud alert.'),
    
    -- Payment
    ('payment', 'payment_received', 'Payment Received', 'R{{amount}} Received', '<h1>Payment Received</h1><p>R{{amount}} from {{sender}}.</p>', 'Payment received.'),
    ('payment', 'payment_sent', 'Payment Sent', 'R{{amount}} Sent', '<h1>Payment Sent</h1><p>R{{amount}} to {{recipient}}.</p>', 'Payment sent.'),
    ('payment', 'transaction_failed', 'Transaction Failed', 'Transaction Failed', '<h1>Transaction Failed</h1><p>Your transaction could not be completed.</p>', 'Transaction failed.'),
    ('payment', 'low_balance', 'Low Balance Alert', 'Low Account Balance', '<h1>Low Balance</h1><p>Your account balance is low.</p>', 'Low balance alert.'),
    
    -- Security
    ('security', 'security_alert', 'Security Alert', 'Security Alert', '<h1>Security Alert</h1><p>{{alert_message}}</p>', 'Security alert.'),
    ('security', 'login_attempt', 'Login Attempt', 'New Login Detected', '<h1>Login Alert</h1><p>New login from {{location}}.</p>', 'Login attempt detected.'),
    ('security', 'password_changed', 'Password Changed', 'Password Successfully Changed', '<h1>Password Changed</h1><p>Your password has been updated.</p>', 'Password changed.'),
    ('security', 'device_compromised', 'Device Compromised', 'Device Security Alert', '<h1>Device Compromised</h1><p>Your device may be compromised.</p>', 'Device compromised.'),
    
    -- Repair Services
    ('repair_services', 'booking_confirmed', 'Repair Booked', 'Repair Booking Confirmed', '<h1>Booking Confirmed</h1><p>Repair appointment scheduled.</p>', 'Repair booked.'),
    ('repair_services', 'repair_completed', 'Repair Complete', 'Repair Completed', '<h1>Repair Complete</h1><p>Your device is ready for pickup.</p>', 'Repair completed.'),
    ('repair_services', 'parts_arrived', 'Parts Arrived', 'Repair Parts Arrived', '<h1>Parts Arrived</h1><p>Your repair parts have arrived.</p>', 'Parts arrived.'),
    ('repair_services', 'ready_for_pickup', 'Ready for Pickup', 'Device Ready for Pickup', '<h1>Ready for Pickup</h1><p>Your device is ready for collection.</p>', 'Ready for pickup.'),
    
    -- Admin
    ('admin', 'new_user_registration', 'New User Registration', 'New User Registered', '<h1>New User</h1><p>A new user has registered.</p>', 'New user registered.'),
    ('admin', 'suspicious_activity', 'Suspicious Activity', 'Suspicious Activity Detected', '<h1>Suspicious Activity</h1><p>Suspicious activity detected.</p>', 'Suspicious activity.'),
    ('admin', 'system_error', 'System Error', 'System Error Occurred', '<h1>System Error</h1><p>A system error has occurred.</p>', 'System error.'),
    ('admin', 'high_value_transaction', 'High Value Transaction', 'High Value Transaction Alert', '<h1>High Value Transaction</h1><p>High value transaction detected.</p>', 'High value transaction.'),
    
    -- Community
    ('community', 'new_tip', 'New Community Tip', 'New Tip Available', '<h1>New Tip</h1><p>A new community tip is available.</p>', 'New tip available.'),
    ('community', 'reputation_level', 'Reputation Update', 'Reputation Level Changed', '<h1>Reputation Update</h1><p>Your reputation level has changed.</p>', 'Reputation updated.'),
    ('community', 'badge_unlocked', 'Badge Unlocked', 'New Badge Unlocked!', '<h1>Badge Unlocked</h1><p>You have unlocked a new badge.</p>', 'Badge unlocked.'),
    ('community', 'referral_reward', 'Referral Reward', 'Referral Reward Earned', '<h1>Referral Reward</h1><p>You earned a referral reward.</p>', 'Referral reward earned.'),
    
    -- Hot Deals
    ('hot_deals', 'deal_alert', 'Hot Deal Alert', 'New Hot Deal Available!', '<h1>Hot Deal!</h1><p>A new hot deal is available.</p>', 'Hot deal available.'),
    ('hot_deals', 'price_drop', 'Price Drop', 'Price Dropped on Hot Deal', '<h1>Price Drop</h1><p>Price dropped on hot deal.</p>', 'Price drop on hot deal.'),
    ('hot_deals', 'deal_ending', 'Deal Ending Soon', 'Hot Deal Ending Soon', '<h1>Deal Ending</h1><p>Hot deal ending soon.</p>', 'Deal ending soon.'),
    ('hot_deals', 'bid_placed', 'Bid Placed', 'Your Bid Placed', '<h1>Bid Placed</h1><p>Your bid has been placed.</p>', 'Bid placed.'),
    
    -- Law Enforcement
    ('law_enforcement', 'device_match', 'Device Match Found', 'Device Match Detected', '<h1>Device Match</h1><p>A device match has been found.</p>', 'Device match found.'),
    ('law_enforcement', 'case_update', 'Case Update', 'Case Status Updated', '<h1>Case Update</h1><p>Your case status has been updated.</p>', 'Case updated.'),
    ('law_enforcement', 'recovery_alert', 'Recovery Alert', 'Device Recovery Alert', '<h1>Recovery Alert</h1><p>Device recovery alert.</p>', 'Recovery alert.'),
    ('law_enforcement', 'investigation_update', 'Investigation Update', 'Investigation Progress', '<h1>Investigation Update</h1><p>Investigation progress update.</p>', 'Investigation update.'),
    
    -- NGO
    ('ngo', 'donation_received', 'Donation Received', 'Donation Received', '<h1>Donation Received</h1><p>Thank you for your donation.</p>', 'Donation received.'),
    ('ngo', 'impact_update', 'Impact Update', 'Your Impact Update', '<h1>Impact Update</h1><p>See the impact of your contribution.</p>', 'Impact update.'),
    ('ngo', 'program_update', 'Program Update', 'Program Status Update', '<h1>Program Update</h1><p>Program status has been updated.</p>', 'Program update.'),
    ('ngo', 'volunteer_opportunity', 'Volunteer Opportunity', 'New Volunteer Opportunity', '<h1>Volunteer Opportunity</h1><p>A new volunteer opportunity is available.</p>', 'Volunteer opportunity.'),
    
    -- Retailer
    ('retailer', 'bulk_registration', 'Bulk Registration', 'Bulk Device Registration', '<h1>Bulk Registration</h1><p>Bulk device registration completed.</p>', 'Bulk registration completed.'),
    ('retailer', 'inventory_alert', 'Inventory Alert', 'Inventory Status Alert', '<h1>Inventory Alert</h1><p>Inventory status alert.</p>', 'Inventory alert.'),
    ('retailer', 'certificate_issued', 'Certificate Issued', 'Certificate Generated', '<h1>Certificate Issued</h1><p>Your certificate has been generated.</p>', 'Certificate issued.'),
    ('retailer', 'sales_update', 'Sales Update', 'Sales Report Update', '<h1>Sales Update</h1><p>Your sales report has been updated.</p>', 'Sales update.'),
    
    -- Repair Shop
    ('repair_shop', 'new_booking', 'New Booking', 'New Repair Booking', '<h1>New Booking</h1><p>A new repair booking has been made.</p>', 'New booking received.'),
    ('repair_shop', 'repair_completed', 'Repair Completed', 'Repair Job Completed', '<h1>Repair Completed</h1><p>Repair job has been completed.</p>', 'Repair completed.'),
    ('repair_shop', 'customer_feedback', 'Customer Feedback', 'Feedback Received', '<h1>Customer Feedback</h1><p>Customer feedback received.</p>', 'Customer feedback.'),
    ('repair_shop', 'parts_ordered', 'Parts Ordered', 'Repair Parts Ordered', '<h1>Parts Ordered</h1><p>Repair parts have been ordered.</p>', 'Parts ordered.'),
    
    -- User Profile
    ('user_profile', 'profile_updated', 'Profile Updated', 'Profile Successfully Updated', '<h1>Profile Updated</h1><p>Your profile has been updated.</p>', 'Profile updated.'),
    ('user_profile', 'account_changes', 'Account Changes', 'Account Settings Changed', '<h1>Account Changes</h1><p>Your account settings have been changed.</p>', 'Account changes.'),
    ('user_profile', 'preference_updated', 'Preference Updated', 'Preferences Updated', '<h1>Preferences Updated</h1><p>Your preferences have been updated.</p>', 'Preferences updated.'),
    ('user_profile', 'verification_complete', 'Verification Complete', 'Account Verified', '<h1>Verification Complete</h1><p>Your account has been verified.</p>', 'Verification complete.'),
    
    -- Support
    ('support', 'ticket_created', 'Ticket Created', 'Support Ticket Created', '<h1>Ticket Created</h1><p>Your support ticket has been created.</p>', 'Ticket created.'),
    ('support', 'ticket_updated', 'Ticket Updated', 'Support Ticket Updated', '<h1>Ticket Updated</h1><p>Your support ticket has been updated.</p>', 'Ticket updated.'),
    ('support', 'ticket_resolved', 'Ticket Resolved', 'Support Ticket Resolved', '<h1>Ticket Resolved</h1><p>Your support ticket has been resolved.</p>', 'Ticket resolved.'),
    ('support', 'help_response', 'Help Response', 'Help Response Received', '<h1>Help Response</h1><p>A help response has been received.</p>', 'Help response received.')
ON CONFLICT (feature_category, notification_type) DO NOTHING;

-- Verify templates were inserted
SELECT 'Templates populated successfully' as status,
       feature_category,
       COUNT(*) as template_count
FROM email_templates 
GROUP BY feature_category 
ORDER BY feature_category;
