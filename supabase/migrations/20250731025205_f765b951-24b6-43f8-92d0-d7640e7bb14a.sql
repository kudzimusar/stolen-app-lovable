-- STOLEN App Complete Backend Implementation

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('individual', 'retailer', 'repair_shop', 'law_enforcement', 'ngo', 'insurance', 'admin');
CREATE TYPE device_status AS ENUM ('active', 'stolen', 'lost', 'recovered', 'sold');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'disputed', 'refunded');
CREATE TYPE escrow_status AS ENUM ('created', 'funded', 'released', 'disputed', 'cancelled');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'removed', 'flagged');

-- 1. Users and Profile Management
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'individual',
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    address JSONB,
    verification_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Device Registration & Ownership
CREATE TABLE public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number TEXT UNIQUE NOT NULL,
    imei TEXT UNIQUE,
    device_name TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    color TEXT,
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    current_owner_id UUID REFERENCES public.users(id),
    status device_status DEFAULT 'active',
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_location POINT,
    device_photos TEXT[],
    receipt_url TEXT,
    blockchain_hash TEXT,
    insurance_policy_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.ownership_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    previous_owner_id UUID REFERENCES public.users(id),
    new_owner_id UUID REFERENCES public.users(id),
    transfer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transfer_type TEXT, -- 'purchase', 'gift', 'theft_recovery', etc.
    blockchain_hash TEXT,
    verified BOOLEAN DEFAULT FALSE
);

-- 3. Marketplace Operations
CREATE TABLE public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status listing_status DEFAULT 'active',
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
    warranty_remaining_months INTEGER DEFAULT 0,
    negotiable BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Lost & Found Reporting
CREATE TABLE public.stolen_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL, -- 'lost', 'stolen'
    incident_date DATE,
    incident_location POINT,
    police_report_number TEXT,
    description TEXT,
    reward_amount DECIMAL(10,2),
    status TEXT DEFAULT 'active', -- 'active', 'resolved', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.found_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stolen_report_id UUID REFERENCES public.stolen_reports(id) ON DELETE CASCADE,
    finder_id UUID REFERENCES public.users(id),
    tip_description TEXT,
    found_location POINT,
    contact_method TEXT,
    anonymous BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. STOLEN Pay (S-Pay) & Escrow
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_wallet_id UUID REFERENCES public.wallets(id),
    to_wallet_id UUID REFERENCES public.wallets(id),
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    transaction_type TEXT NOT NULL, -- 'transfer', 'escrow', 'reward', 'refund'
    status transaction_status DEFAULT 'pending',
    reference_id TEXT, -- marketplace listing, tip, etc.
    description TEXT,
    blockchain_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.escrow_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status escrow_status DEFAULT 'created',
    release_condition TEXT,
    dispute_reason TEXT,
    arbitrator_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AI-Enhanced Fraud Detection
CREATE TABLE public.ai_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL, -- 'device', 'listing', 'user', 'transaction'
    entity_id UUID NOT NULL,
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    fraud_indicators JSONB,
    ai_model_version TEXT,
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Repair History
CREATE TABLE public.repair_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    repair_shop_id UUID REFERENCES public.users(id),
    issue_description TEXT NOT NULL,
    repair_description TEXT,
    cost DECIMAL(10,2),
    repair_date DATE DEFAULT CURRENT_DATE,
    warranty_period_days INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_devices_serial ON public.devices(serial_number);
CREATE INDEX idx_devices_imei ON public.devices(imei);
CREATE INDEX idx_devices_owner ON public.devices(current_owner_id);
CREATE INDEX idx_devices_status ON public.devices(status);
CREATE INDEX idx_listings_seller ON public.marketplace_listings(seller_id);
CREATE INDEX idx_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_stolen_reports_device ON public.stolen_reports(device_id);
CREATE INDEX idx_stolen_reports_status ON public.stolen_reports(status);
CREATE INDEX idx_transactions_wallets ON public.transactions(from_wallet_id, to_wallet_id);
CREATE INDEX idx_ai_scores_entity ON public.ai_scores(entity_type, entity_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stolen_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view public user info" ON public.users
    FOR SELECT USING (true);

-- RLS Policies for Devices
CREATE POLICY "Users can view their own devices" ON public.devices
    FOR SELECT USING (auth.uid() = current_owner_id);

CREATE POLICY "Users can register new devices" ON public.devices
    FOR INSERT WITH CHECK (auth.uid() = current_owner_id);

CREATE POLICY "Users can update their own devices" ON public.devices
    FOR UPDATE USING (auth.uid() = current_owner_id);

CREATE POLICY "Public can view devices for marketplace" ON public.devices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_listings ml 
            WHERE ml.device_id = id AND ml.status = 'active'
        )
    );

-- RLS Policies for Marketplace Listings
CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can manage their listings" ON public.marketplace_listings
    FOR ALL USING (auth.uid() = seller_id);

-- RLS Policies for Stolen Reports
CREATE POLICY "Users can view their own reports" ON public.stolen_reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON public.stolen_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Law enforcement can view all reports" ON public.stolen_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'law_enforcement'
        )
    );

-- RLS Policies for Wallets
CREATE POLICY "Users can view their own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON public.wallets
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Transactions
CREATE POLICY "Users can view their transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.wallets w1 
            WHERE w1.id = from_wallet_id AND w1.user_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM public.wallets w2 
            WHERE w2.id = to_wallet_id AND w2.user_id = auth.uid()
        )
    );

-- RLS Policies for Escrow
CREATE POLICY "Escrow participants can view" ON public.escrow_accounts
    FOR SELECT USING (
        auth.uid() IN (buyer_id, seller_id, arbitrator_id)
    );

-- RLS Policies for AI Scores
CREATE POLICY "AI scores are publicly readable" ON public.ai_scores
    FOR SELECT USING (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('device-photos', 'device-photos', false),
    ('receipt-images', 'receipt-images', false),
    ('user-avatars', 'user-avatars', true);

-- Storage policies for device photos
CREATE POLICY "Users can upload their device photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'device-photos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their device photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'device-photos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for receipts
CREATE POLICY "Users can upload receipts" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'receipt-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their receipts" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'receipt-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.found_tips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stolen_reports;

-- Function to automatically create wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create wallet on user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();