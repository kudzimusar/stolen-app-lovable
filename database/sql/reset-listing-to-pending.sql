-- Reset the existing iPhone 8 Plus listing to pending status for admin approval testing

-- First, check current status
SELECT 
    id,
    title,
    status::text,
    created_at
FROM public.marketplace_listings 
WHERE seller_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3';

-- Reset to pending status
UPDATE public.marketplace_listings 
SET 
    status = 'pending'::listing_status,
    updated_at = NOW()
WHERE seller_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
  AND id = 'a57761f0-6c51-423f-861c-1a0d947463bb';

-- Verify the change
SELECT 
    id,
    title,
    status::text,
    updated_at
FROM public.marketplace_listings 
WHERE seller_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3';

-- Check that marketplace now shows 0 listings (since it only shows approved/active)
-- And admin panel should show 1 pending listing
