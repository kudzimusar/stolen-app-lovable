-- Create price_history table for tracking price changes
-- This table stores historical price data for marketplace listings

CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    price_change_type VARCHAR(20) DEFAULT 'listing' CHECK (price_change_type IN ('listing', 'price_update', 'discount', 'boost', 'featured')),
    change_reason TEXT, -- Reason for price change
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by_user_id UUID REFERENCES auth.users(id), -- Who made the change (if manual)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view price history" ON public.price_history
    FOR SELECT USING (true);

CREATE POLICY "Users can insert price history for their listings" ON public.price_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.marketplace_listings 
            WHERE id = listing_id AND seller_id = auth.uid()
        )
    );

CREATE POLICY "System can insert price history" ON public.price_history
    FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_history_listing_id ON public.price_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON public.price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_price_history_price ON public.price_history(price);
CREATE INDEX IF NOT EXISTS idx_price_history_currency ON public.price_history(currency);

-- Create function to get price trend for a listing
CREATE OR REPLACE FUNCTION get_listing_price_trend(listing_uuid UUID, days_back INTEGER DEFAULT 90)
RETURNS TABLE (
    price_date DATE,
    price DECIMAL(10,2),
    currency VARCHAR(3),
    price_change_type VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(ph.recorded_at) as price_date,
        ph.price,
        ph.currency,
        ph.price_change_type
    FROM public.price_history ph
    WHERE ph.listing_id = listing_uuid
    AND ph.recorded_at >= NOW() - INTERVAL '1 day' * days_back
    ORDER BY ph.recorded_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get price statistics for a listing
CREATE OR REPLACE FUNCTION get_listing_price_stats(listing_uuid UUID)
RETURNS TABLE (
    current_price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    avg_price DECIMAL(10,2),
    price_changes INTEGER,
    days_listed INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT price FROM public.marketplace_listings WHERE id = listing_uuid) as current_price,
        (SELECT price FROM public.price_history WHERE listing_id = listing_uuid ORDER BY recorded_at ASC LIMIT 1) as original_price,
        MIN(ph.price) as min_price,
        MAX(ph.price) as max_price,
        AVG(ph.price) as avg_price,
        COUNT(*)::INTEGER as price_changes,
        (DATE(NOW()) - DATE(MIN(ph.recorded_at)))::INTEGER as days_listed
    FROM public.price_history ph
    WHERE ph.listing_id = listing_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically record price changes
CREATE OR REPLACE FUNCTION record_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only record if price actually changed
    IF TG_OP = 'UPDATE' AND OLD.price != NEW.price THEN
        INSERT INTO public.price_history (
            listing_id,
            price,
            currency,
            price_change_type,
            change_reason,
            recorded_by_user_id
        ) VALUES (
            NEW.id,
            NEW.price,
            NEW.currency,
            'price_update',
            'Price updated by seller',
            NEW.seller_id
        );
    ELSIF TG_OP = 'INSERT' THEN
        -- Record initial listing price
        INSERT INTO public.price_history (
            listing_id,
            price,
            currency,
            price_change_type,
            change_reason,
            recorded_by_user_id
        ) VALUES (
            NEW.id,
            NEW.price,
            NEW.currency,
            'listing',
            'Initial listing price',
            NEW.seller_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on marketplace_listings table
CREATE TRIGGER trigger_record_price_change
    AFTER INSERT OR UPDATE OF price ON public.marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION record_price_change();
