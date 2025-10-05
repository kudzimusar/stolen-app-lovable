-- Lost and Found Database Setup
-- This script ensures all required tables exist for the Lost and Found feature

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "earthdistance";
CREATE EXTENSION IF NOT EXISTS "cube";

-- 1. Lost and Found Reports Table
CREATE TABLE IF NOT EXISTS public.lost_found_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Will reference auth.users(id) when available
    report_type TEXT NOT NULL CHECK (report_type IN ('lost', 'found')),
    device_category TEXT NOT NULL,
    device_model TEXT,
    serial_number TEXT,
    description TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(10,8),
    location_address TEXT,
    incident_date TIMESTAMP WITH TIME ZONE,
    reward_amount DECIMAL(10,2),
    contact_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'resolved')),
    community_score INTEGER DEFAULT 0,
    photos TEXT[],
    documents TEXT[],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if auth.users exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Ensure column exists before adding constraint
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_reports' AND column_name = 'user_id') THEN
            ALTER TABLE lost_found_reports ADD COLUMN user_id UUID;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_reports' AND column_name = 'user_id') THEN
            ALTER TABLE lost_found_reports ADD CONSTRAINT fk_lost_found_reports_user_id 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 2. User Reputation Table
CREATE TABLE IF NOT EXISTS public.user_reputation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Will reference auth.users(id) when available
    reputation_score INTEGER DEFAULT 0,
    successful_recoveries INTEGER DEFAULT 0,
    community_contributions INTEGER DEFAULT 0,
    trust_level TEXT DEFAULT 'new' CHECK (trust_level IN ('new', 'verified', 'trusted', 'expert')),
    badges JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add foreign key constraint if auth.users exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Ensure column exists before adding constraint
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reputation' AND column_name = 'user_id') THEN
            ALTER TABLE user_reputation ADD COLUMN user_id UUID;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reputation' AND column_name = 'user_id') THEN
            ALTER TABLE user_reputation ADD CONSTRAINT fk_user_reputation_user_id 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 3. User Notifications Table
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Will reference auth.users(id) when available
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if auth.users exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Ensure column exists before adding constraint
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notifications' AND column_name = 'user_id') THEN
            ALTER TABLE user_notifications ADD COLUMN user_id UUID;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notifications' AND column_name = 'user_id') THEN
            ALTER TABLE user_notifications ADD CONSTRAINT fk_user_notifications_user_id 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 4. Community Tips Table
CREATE TABLE IF NOT EXISTS public.community_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.lost_found_reports(id) ON DELETE CASCADE,
    tipster_id UUID, -- Will reference auth.users(id) when available
    tip_type TEXT NOT NULL CHECK (tip_type IN ('sighting', 'information', 'contact')),
    description TEXT NOT NULL,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(10,8),
    location_address TEXT,
    contact_info JSONB,
    is_anonymous BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if auth.users exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Ensure column exists before adding constraint
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_tips' AND column_name = 'tipster_id') THEN
            ALTER TABLE community_tips ADD COLUMN tipster_id UUID;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_tips' AND column_name = 'tipster_id') THEN
            ALTER TABLE community_tips ADD CONSTRAINT fk_community_tips_tipster_id 
            FOREIGN KEY (tipster_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 5. Device Matches Table
CREATE TABLE IF NOT EXISTS public.device_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lost_report_id UUID REFERENCES public.lost_found_reports(id) ON DELETE CASCADE,
    found_report_id UUID REFERENCES public.lost_found_reports(id) ON DELETE CASCADE,
    match_confidence DECIMAL(3,2) NOT NULL CHECK (match_confidence >= 0 AND match_confidence <= 1),
    match_criteria JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'resolved')),
    matched_by UUID, -- Will reference auth.users(id) when available
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if auth.users exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Ensure column exists before adding constraint
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_matches' AND column_name = 'matched_by') THEN
            ALTER TABLE device_matches ADD COLUMN matched_by UUID;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_matches' AND column_name = 'matched_by') THEN
            ALTER TABLE device_matches ADD CONSTRAINT fk_device_matches_matched_by 
            FOREIGN KEY (matched_by) REFERENCES auth.users(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- 6. Community Events Table
CREATE TABLE IF NOT EXISTS public.community_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID, -- Will reference auth.users(id) when available
    event_type TEXT NOT NULL CHECK (event_type IN ('recovery_drive', 'awareness_campaign', 'training_session')),
    title TEXT NOT NULL,
    description TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(10,8),
    location_address TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if auth.users exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Ensure column exists before adding constraint
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_events' AND column_name = 'organizer_id') THEN
            ALTER TABLE community_events ADD COLUMN organizer_id UUID;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_events' AND column_name = 'organizer_id') THEN
            ALTER TABLE community_events ADD CONSTRAINT fk_community_events_organizer_id 
            FOREIGN KEY (organizer_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- 7. Success Stories Table
CREATE TABLE IF NOT EXISTS public.success_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recovery_id UUID REFERENCES public.device_matches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    photos TEXT[],
    public_share BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lost_found_location ON public.lost_found_reports 
USING GIST (ll_to_earth(location_lat, location_lng));

CREATE INDEX IF NOT EXISTS idx_lost_found_created ON public.lost_found_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lost_found_user ON public.lost_found_reports (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lost_found_type_status ON public.lost_found_reports (report_type, verification_status);
CREATE INDEX IF NOT EXISTS idx_lost_found_status ON public.lost_found_reports (status);

-- Drop existing function if it exists with different signature
DROP FUNCTION IF EXISTS find_nearby_reports(numeric, numeric, numeric);

-- Create function to find nearby reports
CREATE OR REPLACE FUNCTION find_nearby_reports(
    search_lat DECIMAL(10,8),
    search_lng DECIMAL(10,8),
    radius_km DECIMAL
)
RETURNS TABLE (
    id UUID,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lfr.id,
        earth_distance(
            ll_to_earth(search_lat, search_lng),
            ll_to_earth(lfr.location_lat, lfr.location_lng)
        ) / 1000 as distance_km
    FROM public.lost_found_reports lfr
    WHERE lfr.location_lat IS NOT NULL 
      AND lfr.location_lng IS NOT NULL
      AND earth_distance(
          ll_to_earth(search_lat, search_lng),
          ll_to_earth(lfr.location_lat, lfr.location_lng)
      ) / 1000 <= radius_km
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_community_stats();

-- Create function to get community stats
CREATE OR REPLACE FUNCTION get_community_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'lost', (SELECT COUNT(*) FROM public.lost_found_reports WHERE report_type = 'lost' AND status = 'active'),
        'found', (SELECT COUNT(*) FROM public.lost_found_reports WHERE report_type = 'found' AND status = 'active'),
        'reunited', (SELECT COUNT(*) FROM public.lost_found_reports WHERE status = 'resolved'),
        'total_reports', (SELECT COUNT(*) FROM public.lost_found_reports),
        'active_tips', (SELECT COUNT(*) FROM public.community_tips WHERE is_verified = TRUE),
        'successful_matches', (SELECT COUNT(*) FROM public.device_matches WHERE status = 'confirmed')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.lost_found_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all lost found reports" ON public.lost_found_reports
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reports" ON public.lost_found_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON public.lost_found_reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON public.lost_found_reports
    FOR DELETE USING (auth.uid() = user_id);

-- Insert some test data
INSERT INTO public.lost_found_reports (
    report_type, device_category, device_model, description, 
    location_lat, location_lng, location_address, reward_amount, 
    verification_status, status
) VALUES 
(
    'lost', 'Smartphone', 'iPhone 15 Pro Max', 
    'Space Black, cracked screen protector, purple case. Lost at Sandton City Mall.',
    -26.1076, 28.0567, 'Sandton City Mall, Johannesburg', 5000,
    'verified', 'active'
),
(
    'found', 'Smartphone', 'Samsung Galaxy S24', 
    'Found at V&A Waterfront, blue case. Please contact if this is yours.',
    -33.9048, 18.4161, 'V&A Waterfront, Cape Town', 0,
    'verified', 'active'
),
(
    'lost', 'Laptop', 'MacBook Pro', 
    'Space Gray, 13-inch, South African flag sticker. Lost at Gateway Theatre of Shopping.',
    -29.8587, 31.0218, 'Gateway Theatre of Shopping, Durban', 8000,
    'pending', 'active'
);

-- Create a test user reputation entry
INSERT INTO public.user_reputation (user_id, reputation_score, successful_recoveries, trust_level)
VALUES (auth.uid(), 0, 0, 'new')
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
