-- Enhanced marketplace data structure
-- Create marketplace categories table
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    parent_id UUID REFERENCES public.marketplace_categories(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 0,
    path TEXT[] DEFAULT '{}',
    child_count INTEGER DEFAULT 0,
    product_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    search_keywords TEXT[] DEFAULT '{}',
    attributes JSONB DEFAULT '[]',
    filters JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced marketplace listings table
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'ZAR',
    category_id UUID REFERENCES public.marketplace_categories(id),
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.devices(id),
    
    -- Product details
    brand VARCHAR(100),
    model VARCHAR(200),
    condition VARCHAR(50) CHECK (condition IN ('new', 'like-new', 'excellent', 'good', 'fair', 'poor')),
    storage_gb INTEGER,
    ram_gb INTEGER,
    color VARCHAR(50),
    warranty_months INTEGER,
    
    -- Media and verification
    images TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
    verification_date TIMESTAMP WITH TIME ZONE,
    trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
    
    -- Marketplace specific
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'expired', 'suspended', 'deleted')),
    availability VARCHAR(50) DEFAULT 'available' CHECK (availability IN ('available', 'reserved', 'sold')),
    location_city VARCHAR(100),
    location_province VARCHAR(100),
    location_coordinates POINT,
    
    -- Performance metrics
    view_count INTEGER DEFAULT 0,
    watchlist_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    boost_level INTEGER DEFAULT 0,
    featured_until TIMESTAMP WITH TIME ZONE,
    
    -- SEO and search
    search_vector TSVECTOR,
    slug VARCHAR(500) UNIQUE,
    
    -- Timestamps
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sold_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listing views tracking
CREATE TABLE IF NOT EXISTS public.listing_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    viewer_ip INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS public.marketplace_watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    price_alert_threshold DECIMAL(10,2),
    notifications_enabled BOOLEAN DEFAULT true,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Create marketplace inquiries
CREATE TABLE IF NOT EXISTS public.marketplace_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    inquiry_type VARCHAR(50) DEFAULT 'general' CHECK (inquiry_type IN ('general', 'price', 'condition', 'availability', 'meetup')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'responded', 'resolved', 'closed')),
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seller ratings and reviews
CREATE TABLE IF NOT EXISTS public.seller_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    review_type VARCHAR(50) DEFAULT 'transaction' CHECK (review_type IN ('transaction', 'communication', 'product_quality')),
    verified_purchase BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(seller_id, buyer_id, listing_id)
);

-- Create marketplace transactions
CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id),
    buyer_id UUID NOT NULL REFERENCES public.users(id),
    seller_id UUID NOT NULL REFERENCES public.users(id),
    payment_intent_id UUID REFERENCES public.payment_intents(id),
    escrow_id UUID REFERENCES public.escrow_transactions(id),
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed')),
    
    -- Transaction details
    payment_method VARCHAR(50),
    shipping_address JSONB,
    tracking_number VARCHAR(100),
    delivery_method VARCHAR(50) DEFAULT 'meetup' CHECK (delivery_method IN ('meetup', 'courier', 'collection')),
    
    -- Important dates
    confirmed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI recommendation tracking
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('personalized', 'trending', 'price_drop', 'similar')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    reasoning TEXT,
    context JSONB,
    clicked BOOLEAN DEFAULT false,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search analytics
CREATE TABLE IF NOT EXISTS public.search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    search_query TEXT NOT NULL,
    search_type VARCHAR(50) DEFAULT 'general' CHECK (search_type IN ('general', 'ai_smart', 'category', 'voice')),
    filters_applied JSONB,
    results_count INTEGER,
    clicked_result_id UUID REFERENCES public.marketplace_listings(id),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create price history tracking
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    change_reason VARCHAR(100),
    changed_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON public.marketplace_listings(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_location ON public.marketplace_listings(location_city, location_province);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON public.marketplace_listings(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created ON public.marketplace_listings(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_search ON public.marketplace_listings USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_parent ON public.marketplace_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_slug ON public.marketplace_categories(slug);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing ON public.listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.marketplace_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_listing ON public.marketplace_inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON public.marketplace_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON public.marketplace_transactions(seller_id);

-- Create search vector update trigger
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.model, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_listing_search_vector
    BEFORE INSERT OR UPDATE ON public.marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_search_vector();

-- Create automatic slug generation
CREATE OR REPLACE FUNCTION generate_listing_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(
            regexp_replace(
                regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'),
                '\s+', '-', 'g'
            )
        ) || '-' || substr(NEW.id::text, 1, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_listing_slug
    BEFORE INSERT OR UPDATE ON public.marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION generate_listing_slug();

-- Create view count update function
CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.marketplace_listings 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = NEW.listing_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_listing_views
    AFTER INSERT ON public.listing_views
    FOR EACH ROW
    EXECUTE FUNCTION increment_listing_views();

-- Create watchlist count update function
CREATE OR REPLACE FUNCTION update_watchlist_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.marketplace_listings 
        SET watchlist_count = watchlist_count + 1,
            updated_at = NOW()
        WHERE id = NEW.listing_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.marketplace_listings 
        SET watchlist_count = watchlist_count - 1,
            updated_at = NOW()
        WHERE id = OLD.listing_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_watchlist_count
    AFTER INSERT OR DELETE ON public.marketplace_watchlist
    FOR EACH ROW
    EXECUTE FUNCTION update_watchlist_count();

-- Insert default marketplace categories
INSERT INTO public.marketplace_categories (name, slug, description, icon, level, path, featured, search_keywords) VALUES
('Electronics', 'electronics', 'All electronic devices and accessories', '📱', 0, '{electronics}', true, '{tech,device,gadget,electronic}'),
('Mobile Phones', 'mobile-phones', 'Smartphones and feature phones', '📱', 1, '{electronics,mobile-phones}', true, '{phone,smartphone,mobile,cell,iphone,android}'),
('Laptops', 'laptops', 'Portable computers and notebooks', '💻', 1, '{electronics,laptops}', true, '{laptop,notebook,computer,macbook,thinkpad}'),
('Tablets', 'tablets', 'Tablet computers and e-readers', '📱', 1, '{electronics,tablets}', false, '{tablet,ipad,android,e-reader}'),
('Gaming', 'gaming', 'Gaming consoles and accessories', '🎮', 1, '{electronics,gaming}', true, '{gaming,console,playstation,xbox,nintendo}'),
('Cameras', 'cameras', 'Digital cameras and photography equipment', '📷', 1, '{electronics,cameras}', false, '{camera,photography,dslr,mirrorless}'),
('Audio', 'audio', 'Headphones, speakers, and audio equipment', '🎧', 1, '{electronics,audio}', false, '{headphones,speakers,audio,sound}'),
('Wearables', 'wearables', 'Smartwatches and fitness trackers', '⌚', 1, '{electronics,wearables}', false, '{smartwatch,fitness,tracker,apple watch}'),
('Home & Garden', 'home-garden', 'Home appliances and garden equipment', '🏠', 0, '{home-garden}', false, '{home,appliance,garden,furniture}'),
('Vehicles', 'vehicles', 'Cars, motorcycles, and transport', '🚗', 0, '{vehicles}', false, '{car,vehicle,motorcycle,transport}')
ON CONFLICT (slug) DO NOTHING;

-- Update parent relationships and counts
UPDATE public.marketplace_categories SET parent_id = (SELECT id FROM public.marketplace_categories WHERE slug = 'electronics') 
WHERE slug IN ('mobile-phones', 'laptops', 'tablets', 'gaming', 'cameras', 'audio', 'wearables');

-- Update child counts
UPDATE public.marketplace_categories 
SET child_count = (
    SELECT COUNT(*) 
    FROM public.marketplace_categories c2 
    WHERE c2.parent_id = public.marketplace_categories.id
);

-- Create RLS policies
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;

-- Categories are public
CREATE POLICY "Categories are public" ON public.marketplace_categories FOR SELECT TO public USING (true);

-- Listings visibility policies
CREATE POLICY "Public listings are visible" ON public.marketplace_listings 
FOR SELECT TO public 
USING (status = 'active' AND availability = 'available');

CREATE POLICY "Sellers can manage their listings" ON public.marketplace_listings 
FOR ALL TO authenticated 
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- Watchlist policies
CREATE POLICY "Users can manage their watchlist" ON public.marketplace_watchlist 
FOR ALL TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Inquiry policies
CREATE POLICY "Buyers can create inquiries" ON public.marketplace_inquiries 
FOR INSERT TO authenticated 
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Parties can view their inquiries" ON public.marketplace_inquiries 
FOR SELECT TO authenticated 
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Review policies
CREATE POLICY "Public reviews are visible" ON public.seller_reviews 
FOR SELECT TO public 
USING (true);

CREATE POLICY "Buyers can create reviews" ON public.seller_reviews 
FOR INSERT TO authenticated 
WITH CHECK (buyer_id = auth.uid());

-- Transaction policies
CREATE POLICY "Parties can view their transactions" ON public.marketplace_transactions 
FOR SELECT TO authenticated 
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- View tracking is public (for analytics)
CREATE POLICY "Public view tracking" ON public.listing_views 
FOR INSERT TO public 
WITH CHECK (true);
