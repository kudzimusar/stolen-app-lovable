-- Create missing tables for Lost and Found Community
-- Run this in Supabase SQL Editor

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "earthdistance" CASCADE;
CREATE EXTENSION IF NOT EXISTS "cube" CASCADE;

-- Community Tips and Sightings Table
CREATE TABLE IF NOT EXISTS public.community_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.lost_found_reports(id) ON DELETE CASCADE,
    tipster_id UUID REFERENCES public.users(id),
    tip_type TEXT NOT NULL CHECK (tip_type IN ('sighting', 'information', 'contact')),
    tip_description TEXT NOT NULL,
    tip_location_lat DECIMAL(10,8),
    tip_location_lng DECIMAL(10,8),
    tip_location_address TEXT,
    contact_method TEXT,
    anonymous BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    reward_claimed BOOLEAN DEFAULT FALSE,
    reward_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device Matching and Recovery Table
CREATE TABLE IF NOT EXISTS public.device_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lost_report_id UUID REFERENCES public.lost_found_reports(id) ON DELETE CASCADE,
    found_report_id UUID REFERENCES public.lost_found_reports(id) ON DELETE CASCADE,
    match_confidence DECIMAL(5,4) CHECK (match_confidence >= 0 AND match_confidence <= 1),
    match_criteria JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'verified', 'recovered', 'rejected')),
    contact_initiated_at TIMESTAMP WITH TIME ZONE,
    recovery_confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences and History Table
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    preferences JSONB DEFAULT '{}',
    last_sent TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Events and Campaigns Table
CREATE TABLE IF NOT EXISTS public.community_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES public.users(id),
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

-- Event Participants Table
CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'participant' CHECK (role IN ('organizer', 'participant', 'volunteer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Success Stories Table
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
CREATE INDEX IF NOT EXISTS idx_community_tips_location ON public.community_tips 
USING GIST (ll_to_earth(tip_location_lat, tip_location_lng));

CREATE INDEX IF NOT EXISTS idx_community_tips_report ON public.community_tips (report_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_device_matches_status ON public.device_matches (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_events_location ON public.community_events 
USING GIST (ll_to_earth(location_lat, location_lng));

CREATE INDEX IF NOT EXISTS idx_community_events_date ON public.community_events (start_date, status);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_device_matches_updated_at 
    BEFORE UPDATE ON public.device_matches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_events_updated_at 
    BEFORE UPDATE ON public.community_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lng1 DECIMAL, 
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN earth_distance(
        ll_to_earth(lat1, lng1),
        ll_to_earth(lat2, lng2)
    ) / 1000; -- Return distance in kilometers
END;
$$ LANGUAGE plpgsql;

-- Function to find nearby reports
CREATE OR REPLACE FUNCTION find_nearby_reports(
    search_lat DECIMAL, 
    search_lng DECIMAL, 
    radius_km DECIMAL DEFAULT 10
) RETURNS TABLE (
    id UUID,
    report_type TEXT,
    device_model TEXT,
    distance_km DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lfr.id,
        lfr.report_type,
        lfr.device_model,
        calculate_distance(search_lat, search_lng, lfr.location_lat, lfr.location_lng) as distance_km,
        lfr.created_at
    FROM public.lost_found_reports lfr
    WHERE 
        lfr.location_lat IS NOT NULL 
        AND lfr.location_lng IS NOT NULL
        AND calculate_distance(search_lat, search_lng, lfr.location_lat, lfr.location_lng) <= radius_km
        AND lfr.verification_status != 'rejected'
    ORDER BY distance_km ASC, lfr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update user reputation after successful recovery
CREATE OR REPLACE FUNCTION update_user_reputation_on_recovery()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'recovered' AND OLD.status != 'recovered' THEN
        -- Update finder's reputation
        INSERT INTO public.user_reputation (user_id, successful_recoveries, reputation_score)
        SELECT user_id, 1, 10
        FROM public.lost_found_reports 
        WHERE id = NEW.found_report_id
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            successful_recoveries = user_reputation.successful_recoveries + 1,
            reputation_score = user_reputation.reputation_score + 10,
            updated_at = NOW();
        
        -- Update reporter's reputation
        INSERT INTO public.user_reputation (user_id, successful_recoveries, reputation_score)
        SELECT user_id, 0, 5
        FROM public.lost_found_reports 
        WHERE id = NEW.lost_report_id
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            reputation_score = user_reputation.reputation_score + 5,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reputation updates
CREATE TRIGGER trigger_update_reputation_on_recovery
    AFTER UPDATE ON public.device_matches
    FOR EACH ROW EXECUTE FUNCTION update_user_reputation_on_recovery();

-- Insert default notification preferences for existing users
INSERT INTO public.user_notifications (user_id, notification_type, preferences)
SELECT 
    u.id,
    'lost_found',
    '{"email": true, "push": true, "sms": false, "radius_km": 10, "high_value_only": false}'::jsonb
FROM public.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_notifications un 
    WHERE un.user_id = u.id AND un.notification_type = 'lost_found'
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_tips TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.success_stories TO authenticated;

-- Enable Row Level Security (RLS)
ALTER TABLE public.community_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view community tips" ON public.community_tips
    FOR SELECT USING (true);

CREATE POLICY "Users can create community tips" ON public.community_tips
    FOR INSERT WITH CHECK (auth.uid() = tipster_id OR anonymous = true);

CREATE POLICY "Users can view device matches" ON public.device_matches
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own notifications" ON public.user_notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view community events" ON public.community_events
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their event participation" ON public.event_participants
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view success stories" ON public.success_stories
    FOR SELECT USING (public_share = true OR featured = true);
