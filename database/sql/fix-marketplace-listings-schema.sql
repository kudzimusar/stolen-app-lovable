-- Fix marketplace_listings table schema mismatch
-- This migration aligns the simple schema with the enhanced schema needed by the API

-- 1. Add missing columns to marketplace_listings table
ALTER TABLE public.marketplace_listings 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS model VARCHAR(200),
ADD COLUMN IF NOT EXISTS condition VARCHAR(50) CHECK (condition IN ('new', 'like-new', 'excellent', 'good', 'fair', 'poor')),
ADD COLUMN IF NOT EXISTS storage_gb INTEGER,
ADD COLUMN IF NOT EXISTS ram_gb INTEGER,
ADD COLUMN IF NOT EXISTS color VARCHAR(50),
ADD COLUMN IF NOT EXISTS warranty_months INTEGER,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
ADD COLUMN IF NOT EXISTS availability VARCHAR(50) DEFAULT 'available' CHECK (availability IN ('available', 'reserved', 'sold')),
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_province VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_coordinates POINT,
ADD COLUMN IF NOT EXISTS watchlist_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS inquiry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS boost_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR,
ADD COLUMN IF NOT EXISTS slug VARCHAR(500),
ADD COLUMN IF NOT EXISTS listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS sold_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Update existing listings with device data
UPDATE public.marketplace_listings 
SET 
    brand = d.brand,
    model = d.model,
    color = d.color,
    storage_gb = CASE 
        WHEN d.storage_capacity ~ '^[0-9]+$' THEN d.storage_capacity::INTEGER
        ELSE NULL
    END,
    images = d.device_photos,
    location_city = COALESCE(d.registration_location_address, 'Johannesburg'),
    location_province = 'gauteng',
    verification_status = CASE 
        WHEN d.blockchain_hash IS NOT NULL THEN 'verified'
        ELSE 'pending'
    END,
    trust_score = CASE 
        WHEN d.blockchain_hash IS NOT NULL THEN 95
        ELSE 50
    END,
    listed_at = marketplace_listings.created_at,
    expires_at = marketplace_listings.created_at + INTERVAL '30 days'
FROM public.devices d
WHERE marketplace_listings.device_id = d.id;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_device_id ON public.marketplace_listings(device_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON public.marketplace_listings(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_featured ON public.marketplace_listings(featured);

-- 4. Update RLS policies if needed
-- Ensure users can only see active listings
DROP POLICY IF EXISTS "Users can view active listings" ON public.marketplace_listings;
CREATE POLICY "Users can view active listings" ON public.marketplace_listings
    FOR SELECT USING (status = 'active');

-- 5. Create trigger to update search vector (optional)
CREATE OR REPLACE FUNCTION update_marketplace_listings_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' || 
        COALESCE(NEW.brand, '') || ' ' || 
        COALESCE(NEW.model, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_marketplace_listings_search_vector_trigger ON public.marketplace_listings;
CREATE TRIGGER update_marketplace_listings_search_vector_trigger
    BEFORE INSERT OR UPDATE ON public.marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION update_marketplace_listings_search_vector();
