-- Create device_reviews table for reviews and ratings
-- This table stores reviews and ratings for devices, sellers, and transactions

CREATE TABLE IF NOT EXISTS public.device_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.marketplace_listings(id), -- Optional: link to specific listing
    reviewer_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES auth.users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_type VARCHAR(20) DEFAULT 'device' CHECK (review_type IN ('device', 'seller', 'transaction', 'repair', 'verification')),
    is_verified_purchase BOOLEAN DEFAULT false, -- Whether this is from a verified purchase
    transaction_id UUID, -- Link to transaction if applicable
    helpful_votes INTEGER DEFAULT 0, -- How many users found this review helpful
    not_helpful_votes INTEGER DEFAULT 0, -- How many users found this review not helpful
    is_featured BOOLEAN DEFAULT false, -- Whether this review is featured
    is_anonymous BOOLEAN DEFAULT false, -- Whether the reviewer wants to remain anonymous
    response_from_seller TEXT, -- Seller's response to the review
    response_date TIMESTAMP WITH TIME ZONE, -- When seller responded
    moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    moderated_by UUID REFERENCES auth.users(id), -- Admin who moderated
    moderation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.device_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view approved reviews" ON public.device_reviews
    FOR SELECT USING (moderation_status = 'approved');

CREATE POLICY "Users can view their own reviews" ON public.device_reviews
    FOR SELECT USING (reviewer_id = auth.uid());

CREATE POLICY "Users can insert reviews" ON public.device_reviews
    FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON public.device_reviews
    FOR UPDATE USING (reviewer_id = auth.uid());

CREATE POLICY "Sellers can respond to reviews" ON public.device_reviews
    FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "Admins can moderate reviews" ON public.device_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_reviews_device_id ON public.device_reviews(device_id);
CREATE INDEX IF NOT EXISTS idx_device_reviews_listing_id ON public.device_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_device_reviews_reviewer_id ON public.device_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_device_reviews_seller_id ON public.device_reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_device_reviews_rating ON public.device_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_device_reviews_review_type ON public.device_reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_device_reviews_moderation_status ON public.device_reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_device_reviews_created_at ON public.device_reviews(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_device_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_reviews_updated_at
    BEFORE UPDATE ON public.device_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_device_reviews_updated_at();

-- Create function to calculate seller rating
CREATE OR REPLACE FUNCTION calculate_seller_rating(seller_uuid UUID)
RETURNS TABLE (
    average_rating DECIMAL(2,1),
    total_reviews INTEGER,
    rating_distribution JSONB
) AS $$
DECLARE
    avg_rating DECIMAL(2,1);
    review_count INTEGER;
    rating_dist JSONB;
BEGIN
    SELECT 
        COALESCE(AVG(rating), 0.0)::DECIMAL(2,1),
        COUNT(*)::INTEGER
    INTO avg_rating, review_count
    FROM public.device_reviews
    WHERE seller_id = seller_uuid 
    AND moderation_status = 'approved';
    
    -- Get rating distribution
    SELECT jsonb_build_object(
        '5_star', COUNT(*) FILTER (WHERE rating = 5),
        '4_star', COUNT(*) FILTER (WHERE rating = 4),
        '3_star', COUNT(*) FILTER (WHERE rating = 3),
        '2_star', COUNT(*) FILTER (WHERE rating = 2),
        '1_star', COUNT(*) FILTER (WHERE rating = 1)
    )
    INTO rating_dist
    FROM public.device_reviews
    WHERE seller_id = seller_uuid 
    AND moderation_status = 'approved';
    
    RETURN QUERY SELECT avg_rating, review_count, rating_dist;
END;
$$ LANGUAGE plpgsql;

-- Create function to get device reviews summary
CREATE OR REPLACE FUNCTION get_device_reviews_summary(device_uuid UUID)
RETURNS TABLE (
    total_reviews INTEGER,
    average_rating DECIMAL(2,1),
    verified_reviews INTEGER,
    featured_reviews INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_reviews,
        COALESCE(AVG(rating), 0.0)::DECIMAL(2,1) as average_rating,
        COUNT(*) FILTER (WHERE is_verified_purchase = true)::INTEGER as verified_reviews,
        COUNT(*) FILTER (WHERE is_featured = true)::INTEGER as featured_reviews
    FROM public.device_reviews
    WHERE device_id = device_uuid 
    AND moderation_status = 'approved';
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update seller profile rating when review is added
CREATE OR REPLACE FUNCTION update_seller_rating_on_review()
RETURNS TRIGGER AS $$
DECLARE
    new_avg_rating DECIMAL(2,1);
    total_reviews INTEGER;
BEGIN
    -- Calculate new average rating for the seller
    SELECT 
        COALESCE(AVG(rating), 0.0)::DECIMAL(2,1),
        COUNT(*)::INTEGER
    INTO new_avg_rating, total_reviews
    FROM public.device_reviews
    WHERE seller_id = NEW.seller_id 
    AND moderation_status = 'approved';
    
    -- Update seller profile
    UPDATE public.seller_profiles
    SET 
        rating = new_avg_rating,
        total_reviews = total_reviews,
        updated_at = NOW()
    WHERE user_id = NEW.seller_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seller_rating_on_review
    AFTER INSERT OR UPDATE OF rating, moderation_status ON public.device_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_rating_on_review();
