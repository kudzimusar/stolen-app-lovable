-- Create proper enum values for marketplace listings admin workflow
-- This will add the missing enum values needed for admin approval process

-- 1. First, check what enum type exists for listing status
SELECT 
    'Current Enum Type' as info,
    t.typname as enum_name,
    e.enumlabel as existing_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%listing%' 
   OR t.typname LIKE '%status%'
   OR t.typname LIKE '%marketplace%'
ORDER BY t.typname, e.enumsortorder;

-- 2. Add the missing enum values for admin workflow
-- These are the values we need for proper admin approval process

-- Add 'pending' status for listings awaiting admin review
DO $$ 
BEGIN
    -- Check if 'pending' already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'listing_status' AND e.enumlabel = 'pending'
    ) THEN
        -- Find the enum type for listing status
        ALTER TYPE listing_status ADD VALUE 'pending';
        RAISE NOTICE 'Added pending status to listing_status enum';
    ELSE
        RAISE NOTICE 'pending status already exists in listing_status enum';
    END IF;
END $$;

-- Add 'approved' status for admin-approved listings
DO $$ 
BEGIN
    -- Check if 'approved' already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'listing_status' AND e.enumlabel = 'approved'
    ) THEN
        ALTER TYPE listing_status ADD VALUE 'approved';
        RAISE NOTICE 'Added approved status to listing_status enum';
    ELSE
        RAISE NOTICE 'approved status already exists in listing_status enum';
    END IF;
END $$;

-- Add 'rejected' status for admin-rejected listings
DO $$ 
BEGIN
    -- Check if 'rejected' already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'listing_status' AND e.enumlabel = 'rejected'
    ) THEN
        ALTER TYPE listing_status ADD VALUE 'rejected';
        RAISE NOTICE 'Added rejected status to listing_status enum';
    ELSE
        RAISE NOTICE 'rejected status already exists in listing_status enum';
    END IF;
END $$;

-- Add 'expired' status for expired listings
DO $$ 
BEGIN
    -- Check if 'expired' already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'listing_status' AND e.enumlabel = 'expired'
    ) THEN
        ALTER TYPE listing_status ADD VALUE 'expired';
        RAISE NOTICE 'Added expired status to listing_status enum';
    ELSE
        RAISE NOTICE 'expired status already exists in listing_status enum';
    END IF;
END $$;

-- 3. Verify the updated enum values
SELECT 
    'Updated Enum Values' as info,
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'listing_status'
ORDER BY e.enumsortorder;

-- 4. Update any existing listings to use proper status
-- If there are existing listings with 'active' status, we can keep them
-- New listings will use 'pending' status for admin review

-- 5. Create indexes for better performance on status filtering
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_device_id ON public.marketplace_listings(device_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON public.marketplace_listings(created_at);

-- 6. Update RLS policies to handle new statuses
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

-- 7. Test the new enum values
SELECT 
    'Test New Enum Values' as info,
    'pending'::listing_status as pending_status,
    'approved'::listing_status as approved_status,
    'rejected'::listing_status as rejected_status,
    'expired'::listing_status as expired_status;
