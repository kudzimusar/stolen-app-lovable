-- Step 6: Test the new enum values
-- Run this AFTER all setup is complete to verify everything works

-- Test that all new enum values can be used
SELECT 
    'Testing Enum Values' as test_type,
    'pending'::listing_status as pending_test,
    'approved'::listing_status as approved_test,
    'rejected'::listing_status as rejected_test,
    'expired'::listing_status as expired_test;

-- Check current marketplace listings and their statuses
SELECT 
    'Current Listings Status' as test_type,
    status,
    COUNT(*) as count
FROM public.marketplace_listings
GROUP BY status
ORDER BY count DESC;

-- Show any existing listings
SELECT 
    'Sample Listings' as test_type,
    id,
    title,
    price,
    status,
    created_at
FROM public.marketplace_listings
ORDER BY created_at DESC
LIMIT 5;
