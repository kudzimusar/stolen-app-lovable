-- Add missing columns to marketplace_listings table for comprehensive product detail page support

-- Add columns for enhanced marketplace features
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS is_premium_trust_score BOOLEAN DEFAULT false;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS blockchain_proof_url TEXT;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS watchlist_count INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS inquiry_count INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS boost_level INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Add columns for enhanced analytics
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS contact_count INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2) DEFAULT 0.0;

-- Add columns for enhanced marketplace features
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS is_negotiable BOOLEAN DEFAULT true;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS minimum_offer DECIMAL(10,2);
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS instant_buy_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS escrow_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS shipping_included BOOLEAN DEFAULT false;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0.0;

-- Add columns for enhanced metadata
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS listing_tags TEXT[];
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS custom_fields JSONB;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_premium_trust ON public.marketplace_listings(is_premium_trust_score);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_watchlist_count ON public.marketplace_listings(watchlist_count);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_inquiry_count ON public.marketplace_listings(inquiry_count);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_boost_level ON public.marketplace_listings(boost_level);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_featured_until ON public.marketplace_listings(featured_until);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_slug ON public.marketplace_listings(slug);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_instant_buy ON public.marketplace_listings(instant_buy_enabled);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_escrow ON public.marketplace_listings(escrow_enabled);

-- Create function to generate unique slug
CREATE OR REPLACE FUNCTION generate_listing_slug(listing_title TEXT, device_brand TEXT, device_model TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from title, brand, and model
    base_slug := LOWER(REGEXP_REPLACE(
        COALESCE(listing_title, device_brand || '-' || device_model), 
        '[^a-zA-Z0-9]+', '-', 'g'
    ));
    
    -- Remove leading/trailing dashes
    base_slug := TRIM(base_slug, '-');
    
    -- Limit length
    base_slug := LEFT(base_slug, 50);
    
    final_slug := base_slug;
    
    -- Check if slug exists and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.marketplace_listings WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate conversion rate
CREATE OR REPLACE FUNCTION calculate_listing_conversion_rate(listing_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_views INTEGER;
    total_inquiries INTEGER;
    conversion_rate DECIMAL(5,2);
BEGIN
    -- Get total views and inquiries
    SELECT 
        COALESCE(views_count, 0),
        COALESCE(inquiry_count, 0)
    INTO total_views, total_inquiries
    FROM public.marketplace_listings
    WHERE id = listing_uuid;
    
    -- Calculate conversion rate
    IF total_views > 0 THEN
        conversion_rate := (total_inquiries::DECIMAL / total_views::DECIMAL) * 100;
    ELSE
        conversion_rate := 0.0;
    END IF;
    
    RETURN conversion_rate;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate slug
CREATE OR REPLACE FUNCTION auto_generate_listing_slug()
RETURNS TRIGGER AS $$
DECLARE
    device_brand TEXT;
    device_model TEXT;
BEGIN
    -- Get device brand and model
    SELECT brand, model
    INTO device_brand, device_model
    FROM public.devices
    WHERE id = NEW.device_id;
    
    -- Generate slug if not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_listing_slug(NEW.title, device_brand, device_model);
    END IF;
    
    -- Calculate conversion rate
    NEW.conversion_rate := calculate_listing_conversion_rate(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new and updated listings
CREATE TRIGGER trigger_auto_generate_listing_slug
    BEFORE INSERT OR UPDATE ON public.marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_listing_slug();

-- Create trigger to update conversion rate when views or inquiries change
CREATE OR REPLACE FUNCTION update_conversion_rate()
RETURNS TRIGGER AS $$
BEGIN
    -- Update conversion rate when views_count or inquiry_count changes
    IF TG_OP = 'UPDATE' AND (OLD.views_count != NEW.views_count OR OLD.inquiry_count != NEW.inquiry_count) THEN
        NEW.conversion_rate := calculate_listing_conversion_rate(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversion_rate
    BEFORE UPDATE OF views_count, inquiry_count ON public.marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_conversion_rate();

-- Update existing listings with generated slugs
UPDATE public.marketplace_listings 
SET slug = generate_listing_slug(title, 
    (SELECT brand FROM public.devices WHERE id = device_id),
    (SELECT model FROM public.devices WHERE id = device_id)
)
WHERE slug IS NULL OR slug = '';
