-- Comprehensive Product Detail Page Database Migration
-- This script creates all necessary tables and columns to support the complete Product Detail page
-- Run this script in order to set up the full database schema

-- =============================================================================
-- STEP 1: Create new tables for comprehensive product detail support
-- =============================================================================

-- Create seller_profiles table
CREATE TABLE IF NOT EXISTS public.seller_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    bio TEXT,
    profile_picture_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    total_sales INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    is_premium BOOLEAN DEFAULT false,
    contact_email TEXT,
    contact_phone TEXT,
    business_name TEXT,
    business_address TEXT,
    tax_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create device_verifications table
CREATE TABLE IF NOT EXISTS public.device_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    verification_method VARCHAR(50) NOT NULL CHECK (verification_method IN ('QR_SCAN', 'SERIAL_LOOKUP', 'DOCUMENT_REVIEW', 'BLOCKCHAIN_ANCHOR', 'IMEI_CHECK', 'MANUFACTURER_VERIFY')),
    verifier_name TEXT NOT NULL,
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    verification_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'verified' CHECK (status IN ('verified', 'failed', 'pending', 'expired')),
    verification_details JSONB,
    blockchain_tx_id TEXT,
    verified_by_user_id UUID REFERENCES auth.users(id),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create device_ownership_history table
CREATE TABLE IF NOT EXISTS public.device_ownership_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    previous_owner_id UUID REFERENCES auth.users(id),
    transfer_from_entity TEXT,
    transfer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transfer_method VARCHAR(20) DEFAULT 'purchase' CHECK (transfer_method IN ('purchase', 'sale', 'gift', 'inheritance', 'trade', 'other')),
    blockchain_tx_id TEXT UNIQUE,
    verification_status VARCHAR(20) DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'failed')),
    receipt_url TEXT,
    warranty_card_url TEXT,
    sales_agreement_url TEXT,
    device_report_url TEXT,
    certificate_url TEXT,
    ownership_proof_url TEXT,
    transfer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create device_repairs table
CREATE TABLE IF NOT EXISTS public.device_repairs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    repair_type VARCHAR(100) NOT NULL,
    service_provider TEXT,
    repair_date DATE NOT NULL,
    cost DECIMAL(10,2),
    receipt_url TEXT,
    description TEXT,
    warranty_after_repair_months INTEGER DEFAULT 0,
    repair_notes TEXT,
    verification_status VARCHAR(20) DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'failed')),
    verified_by_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create device_certificates table
CREATE TABLE IF NOT EXISTS public.device_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    certificate_type VARCHAR(50) NOT NULL CHECK (certificate_type IN ('warranty', 'authenticity', 'ownership', 'insurance', 'service_agreement', 'extended_warranty')),
    issuer TEXT NOT NULL,
    certificate_number TEXT,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    certificate_url TEXT,
    certificate_data JSONB,
    verification_status VARCHAR(20) DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'failed', 'expired')),
    verified_by_user_id UUID REFERENCES auth.users(id),
    verification_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create device_risk_assessment table
CREATE TABLE IF NOT EXISTS public.device_risk_assessment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_status VARCHAR(20) DEFAULT 'clean' CHECK (risk_status IN ('clean', 'low_risk', 'medium_risk', 'high_risk')),
    risk_factors JSONB,
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessed_by VARCHAR(100),
    assessment_notes TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create price_history table
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    price_change_type VARCHAR(20) DEFAULT 'listing' CHECK (price_change_type IN ('listing', 'price_update', 'discount', 'boost', 'featured')),
    change_reason TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create device_reviews table
CREATE TABLE IF NOT EXISTS public.device_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.marketplace_listings(id),
    reviewer_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES auth.users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_type VARCHAR(20) DEFAULT 'device' CHECK (review_type IN ('device', 'seller', 'transaction', 'repair', 'verification')),
    is_verified_purchase BOOLEAN DEFAULT false,
    transaction_id UUID,
    helpful_votes INTEGER DEFAULT 0,
    not_helpful_votes INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    response_from_seller TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    moderated_by UUID REFERENCES auth.users(id),
    moderation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- STEP 2: Add missing columns to existing tables
-- =============================================================================

-- Add columns to devices table
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS last_verified_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS serial_status VARCHAR(20) DEFAULT 'clean' CHECK (serial_status IN ('clean', 'reported_lost', 'reported_stolen', 'blacklisted'));
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS ram_gb INTEGER;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS processor TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS screen_size_inch DECIMAL(4,2);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS battery_health_percentage INTEGER CHECK (battery_health_percentage >= 0 AND battery_health_percentage <= 100);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS last_seen_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS device_age_months INTEGER;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(10,2);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS depreciation_rate DECIMAL(3,2) DEFAULT 0.10;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS verification_level VARCHAR(20) DEFAULT 'basic' CHECK (verification_level IN ('basic', 'standard', 'premium', 'enterprise'));
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS blockchain_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS last_risk_assessment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS is_marketplace_eligible BOOLEAN DEFAULT true;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS marketplace_restrictions TEXT[];
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS recommended_price DECIMAL(10,2);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS price_range_min DECIMAL(10,2);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS price_range_max DECIMAL(10,2);

-- Add columns to marketplace_listings table
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS is_premium_trust_score BOOLEAN DEFAULT false;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS blockchain_proof_url TEXT;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS watchlist_count INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS inquiry_count INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS boost_level INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS contact_count INTEGER DEFAULT 0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2) DEFAULT 0.0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS is_negotiable BOOLEAN DEFAULT true;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS minimum_offer DECIMAL(10,2);
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS instant_buy_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS escrow_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS shipping_included BOOLEAN DEFAULT false;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0.0;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS listing_tags TEXT[];
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS custom_fields JSONB;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];

-- =============================================================================
-- STEP 3: Enable RLS and create policies
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_risk_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for seller_profiles (drop if exists to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all seller profiles" ON public.seller_profiles;
DROP POLICY IF EXISTS "Users can insert their own seller profile" ON public.seller_profiles;
DROP POLICY IF EXISTS "Users can update their own seller profile" ON public.seller_profiles;

CREATE POLICY "Users can view all seller profiles" ON public.seller_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own seller profile" ON public.seller_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own seller profile" ON public.seller_profiles FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for device_verifications (drop if exists)
DROP POLICY IF EXISTS "Users can view verifications for their devices" ON public.device_verifications;
DROP POLICY IF EXISTS "Anyone can view public device verifications" ON public.device_verifications;
DROP POLICY IF EXISTS "System can insert verifications" ON public.device_verifications;

CREATE POLICY "Users can view verifications for their devices" ON public.device_verifications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND current_owner_id = auth.uid())
);
CREATE POLICY "Anyone can view public device verifications" ON public.device_verifications FOR SELECT USING (status = 'verified');
CREATE POLICY "System can insert verifications" ON public.device_verifications FOR INSERT WITH CHECK (true);

-- Create RLS policies for device_ownership_history (drop if exists)
DROP POLICY IF EXISTS "Users can view ownership history for their devices" ON public.device_ownership_history;
DROP POLICY IF EXISTS "Users can insert ownership history" ON public.device_ownership_history;

CREATE POLICY "Users can view ownership history for their devices" ON public.device_ownership_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND current_owner_id = auth.uid()) OR
    owner_id = auth.uid() OR
    previous_owner_id = auth.uid()
);
CREATE POLICY "Users can insert ownership history" ON public.device_ownership_history FOR INSERT WITH CHECK (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND current_owner_id = auth.uid())
);

-- Create RLS policies for device_repairs (drop if exists)
DROP POLICY IF EXISTS "Users can view repairs for their devices" ON public.device_repairs;
DROP POLICY IF EXISTS "Users can insert repairs for their devices" ON public.device_repairs;

CREATE POLICY "Users can view repairs for their devices" ON public.device_repairs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND current_owner_id = auth.uid())
);
CREATE POLICY "Users can insert repairs for their devices" ON public.device_repairs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND current_owner_id = auth.uid())
);

-- Create RLS policies for device_certificates (drop if exists)
DROP POLICY IF EXISTS "Users can view certificates for their devices" ON public.device_certificates;
DROP POLICY IF EXISTS "Users can insert certificates for their devices" ON public.device_certificates;

CREATE POLICY "Users can view certificates for their devices" ON public.device_certificates FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND current_owner_id = auth.uid())
);
CREATE POLICY "Users can insert certificates for their devices" ON public.device_certificates FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND current_owner_id = auth.uid())
);

-- Create RLS policies for device_risk_assessment (drop if exists)
DROP POLICY IF EXISTS "Users can view risk assessment for their devices" ON public.device_risk_assessment;
DROP POLICY IF EXISTS "Anyone can view public risk assessments" ON public.device_risk_assessment;

CREATE POLICY "Users can view risk assessment for their devices" ON public.device_risk_assessment FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.devices WHERE id = device_id AND current_owner_id = auth.uid())
);
CREATE POLICY "Anyone can view public risk assessments" ON public.device_risk_assessment FOR SELECT USING (is_active = true);

-- Create RLS policies for price_history (drop if exists)
DROP POLICY IF EXISTS "Anyone can view price history" ON public.price_history;
DROP POLICY IF EXISTS "Users can insert price history for their listings" ON public.price_history;

CREATE POLICY "Anyone can view price history" ON public.price_history FOR SELECT USING (true);
CREATE POLICY "Users can insert price history for their listings" ON public.price_history FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.marketplace_listings WHERE id = listing_id AND seller_id = auth.uid())
);

-- Create RLS policies for device_reviews (drop if exists)
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.device_reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.device_reviews;
DROP POLICY IF EXISTS "Users can insert reviews" ON public.device_reviews;

CREATE POLICY "Anyone can view approved reviews" ON public.device_reviews FOR SELECT USING (moderation_status = 'approved');
CREATE POLICY "Users can view their own reviews" ON public.device_reviews FOR SELECT USING (reviewer_id = auth.uid());
CREATE POLICY "Users can insert reviews" ON public.device_reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- =============================================================================
-- STEP 4: Create indexes for performance
-- =============================================================================

-- Indexes for seller_profiles
CREATE INDEX IF NOT EXISTS idx_seller_profiles_verification_status ON public.seller_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_rating ON public.seller_profiles(rating);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_is_premium ON public.seller_profiles(is_premium);

-- Indexes for device_verifications
CREATE INDEX IF NOT EXISTS idx_device_verifications_device_id ON public.device_verifications(device_id);
CREATE INDEX IF NOT EXISTS idx_device_verifications_method ON public.device_verifications(verification_method);
CREATE INDEX IF NOT EXISTS idx_device_verifications_status ON public.device_verifications(status);
CREATE INDEX IF NOT EXISTS idx_device_verifications_timestamp ON public.device_verifications(verification_timestamp);

-- Indexes for device_ownership_history
CREATE INDEX IF NOT EXISTS idx_device_ownership_history_device_id ON public.device_ownership_history(device_id);
CREATE INDEX IF NOT EXISTS idx_device_ownership_history_owner_id ON public.device_ownership_history(owner_id);
CREATE INDEX IF NOT EXISTS idx_device_ownership_history_transfer_date ON public.device_ownership_history(transfer_date);

-- Indexes for device_repairs
CREATE INDEX IF NOT EXISTS idx_device_repairs_device_id ON public.device_repairs(device_id);
CREATE INDEX IF NOT EXISTS idx_device_repairs_repair_date ON public.device_repairs(repair_date);
CREATE INDEX IF NOT EXISTS idx_device_repairs_repair_type ON public.device_repairs(repair_type);

-- Indexes for device_certificates
CREATE INDEX IF NOT EXISTS idx_device_certificates_device_id ON public.device_certificates(device_id);
CREATE INDEX IF NOT EXISTS idx_device_certificates_type ON public.device_certificates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_device_certificates_expiry_date ON public.device_certificates(expiry_date);

-- Indexes for device_risk_assessment
CREATE INDEX IF NOT EXISTS idx_device_risk_assessment_device_id ON public.device_risk_assessment(device_id);
CREATE INDEX IF NOT EXISTS idx_device_risk_assessment_risk_score ON public.device_risk_assessment(risk_score);
CREATE INDEX IF NOT EXISTS idx_device_risk_assessment_risk_status ON public.device_risk_assessment(risk_status);

-- Indexes for price_history
CREATE INDEX IF NOT EXISTS idx_price_history_listing_id ON public.price_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON public.price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_price_history_price ON public.price_history(price);

-- Indexes for device_reviews
CREATE INDEX IF NOT EXISTS idx_device_reviews_device_id ON public.device_reviews(device_id);
CREATE INDEX IF NOT EXISTS idx_device_reviews_seller_id ON public.device_reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_device_reviews_rating ON public.device_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_device_reviews_created_at ON public.device_reviews(created_at);

-- Indexes for enhanced devices table
CREATE INDEX IF NOT EXISTS idx_devices_last_verified_date ON public.devices(last_verified_date);
CREATE INDEX IF NOT EXISTS idx_devices_trust_score ON public.devices(trust_score);
CREATE INDEX IF NOT EXISTS idx_devices_serial_status ON public.devices(serial_status);
CREATE INDEX IF NOT EXISTS idx_devices_verification_level ON public.devices(verification_level);

-- Indexes for enhanced marketplace_listings table
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_premium_trust ON public.marketplace_listings(is_premium_trust_score);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_watchlist_count ON public.marketplace_listings(watchlist_count);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_inquiry_count ON public.marketplace_listings(inquiry_count);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_slug ON public.marketplace_listings(slug);

-- =============================================================================
-- STEP 5: Create utility functions and triggers
-- =============================================================================

-- Create function to calculate device age in months (fixed version)
CREATE OR REPLACE FUNCTION calculate_device_age(device_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    device_age INTEGER;
    purchase_date_val DATE;
    registration_date_val TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT purchase_date, registration_date
    INTO purchase_date_val, registration_date_val
    FROM public.devices
    WHERE id = device_uuid;
    
    IF purchase_date_val IS NOT NULL THEN
        device_age := EXTRACT(EPOCH FROM (CURRENT_DATE - purchase_date_val)) / (30 * 24 * 60 * 60);
    ELSIF registration_date_val IS NOT NULL THEN
        device_age := EXTRACT(EPOCH FROM (CURRENT_DATE - registration_date_val::DATE)) / (30 * 24 * 60 * 60);
    ELSE
        device_age := 0;
    END IF;
    
    RETURN GREATEST(0, device_age::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Create function to generate listing slug
CREATE OR REPLACE FUNCTION generate_listing_slug(listing_title TEXT, device_brand TEXT, device_model TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    base_slug := LOWER(REGEXP_REPLACE(
        COALESCE(listing_title, device_brand || '-' || device_model), 
        '[^a-zA-Z0-9]+', '-'
    ));
    base_slug := TRIM(base_slug, '-');
    base_slug := LEFT(base_slug, 50);
    
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM public.marketplace_listings WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate listing slug
CREATE OR REPLACE FUNCTION auto_generate_listing_slug()
RETURNS TRIGGER AS $$
DECLARE
    device_brand TEXT;
    device_model TEXT;
BEGIN
    SELECT brand, model
    INTO device_brand, device_model
    FROM public.devices
    WHERE id = NEW.device_id;
    
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_listing_slug(NEW.title, device_brand, device_model);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_listing_slug ON public.marketplace_listings;
CREATE TRIGGER trigger_auto_generate_listing_slug
    BEFORE INSERT OR UPDATE ON public.marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_listing_slug();

-- =============================================================================
-- STEP 6: Insert default data for existing users
-- =============================================================================

-- Insert default seller profiles for existing users
INSERT INTO public.seller_profiles (user_id, full_name, verification_status)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', email),
    'pending'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.seller_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Comprehensive Product Detail Page migration completed successfully!';
    RAISE NOTICE 'Created 8 new tables and added columns to existing tables.';
    RAISE NOTICE 'All RLS policies, indexes, and triggers have been set up.';
END $$;
