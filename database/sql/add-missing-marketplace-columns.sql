-- Add missing columns to marketplace_listings table
-- This script safely adds columns that might be missing

-- Add views_count column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_listings' 
        AND column_name = 'views_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.marketplace_listings 
        ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add featured column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_listings' 
        AND column_name = 'featured'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.marketplace_listings 
        ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add expires_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_listings' 
        AND column_name = 'expires_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.marketplace_listings 
        ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_listings' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.marketplace_listings 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_marketplace_listings_updated_at ON public.marketplace_listings;
CREATE TRIGGER update_marketplace_listings_updated_at 
    BEFORE UPDATE ON public.marketplace_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS if not already enabled
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_device_id ON public.marketplace_listings(device_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_featured ON public.marketplace_listings(featured);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON public.marketplace_listings(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON public.marketplace_listings(price);

-- Create RLS policies if they don't exist
DO $$
BEGIN
    -- Policy for viewing active listings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketplace_listings' 
        AND policyname = 'Users can view active listings'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can view active listings" ON public.marketplace_listings
            FOR SELECT USING (status = 'active');
    END IF;

    -- Policy for creating listings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketplace_listings' 
        AND policyname = 'Users can create their own listings'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can create their own listings" ON public.marketplace_listings
            FOR INSERT WITH CHECK (auth.uid() = seller_id);
    END IF;

    -- Policy for updating listings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketplace_listings' 
        AND policyname = 'Users can update their own listings'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can update their own listings" ON public.marketplace_listings
            FOR UPDATE USING (auth.uid() = seller_id);
    END IF;

    -- Policy for deleting listings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketplace_listings' 
        AND policyname = 'Users can delete their own listings'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can delete their own listings" ON public.marketplace_listings
            FOR DELETE USING (auth.uid() = seller_id);
    END IF;
END $$;

-- Add comments
COMMENT ON TABLE public.marketplace_listings IS 'Stores marketplace listings for devices being sold';
COMMENT ON COLUMN public.marketplace_listings.views_count IS 'Number of times this listing has been viewed';
COMMENT ON COLUMN public.marketplace_listings.featured IS 'Whether this listing is featured as a hot deal';
COMMENT ON COLUMN public.marketplace_listings.expires_at IS 'When this listing automatically expires';
