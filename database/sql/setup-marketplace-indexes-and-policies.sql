-- Step 5: Setup indexes and policies for marketplace listings
-- Run this AFTER all enum values have been added

-- Create indexes for better performance on status filtering
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_device_id ON public.marketplace_listings(device_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON public.marketplace_listings(created_at);

-- Update RLS policies to handle new statuses
-- Allow users to see their own listings regardless of status
DROP POLICY IF EXISTS "Users can view their own listings" ON public.marketplace_listings;
CREATE POLICY "Users can view their own listings" ON public.marketplace_listings
    FOR SELECT USING (auth.uid() = seller_id);

-- Allow public to see only approved listings
DROP POLICY IF EXISTS "Public can view approved listings" ON public.marketplace_listings;
CREATE POLICY "Public can view approved listings" ON public.marketplace_listings
    FOR SELECT USING (status = 'approved');

-- Allow users to insert their own listings
DROP POLICY IF EXISTS "Users can insert their own listings" ON public.marketplace_listings;
CREATE POLICY "Users can insert their own listings" ON public.marketplace_listings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Allow users to update their own listings (for status changes by admin)
DROP POLICY IF EXISTS "Users can update their own listings" ON public.marketplace_listings;
CREATE POLICY "Users can update their own listings" ON public.marketplace_listings
    FOR UPDATE USING (auth.uid() = seller_id);

-- Verify the enum values are working
SELECT 
    'Final Enum Verification' as info,
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'listing_status'
ORDER BY e.enumsortorder;
