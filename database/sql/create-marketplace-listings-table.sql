-- Create marketplace_listings table
-- This table stores listings for devices being sold on the marketplace

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
    warranty_remaining_months INTEGER DEFAULT 0,
    negotiable BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled', 'expired')),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_device_id ON public.marketplace_listings(device_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_featured ON public.marketplace_listings(featured);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON public.marketplace_listings(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON public.marketplace_listings(price);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view active listings" ON public.marketplace_listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create their own listings" ON public.marketplace_listings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings" ON public.marketplace_listings
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings" ON public.marketplace_listings
    FOR DELETE USING (auth.uid() = seller_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marketplace_listings_updated_at 
    BEFORE UPDATE ON public.marketplace_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.marketplace_listings IS 'Stores marketplace listings for devices being sold';
COMMENT ON COLUMN public.marketplace_listings.condition_rating IS 'Device condition rating from 1 (poor) to 5 (excellent)';
COMMENT ON COLUMN public.marketplace_listings.featured IS 'Whether this listing is featured as a hot deal';
COMMENT ON COLUMN public.marketplace_listings.views_count IS 'Number of times this listing has been viewed';
COMMENT ON COLUMN public.marketplace_listings.expires_at IS 'When this listing automatically expires';
