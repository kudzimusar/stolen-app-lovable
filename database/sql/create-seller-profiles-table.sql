-- Create seller_profiles table for detailed seller information
-- This table stores extended seller data beyond basic auth.users information

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

-- Enable RLS
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all seller profiles" ON public.seller_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own seller profile" ON public.seller_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own seller profile" ON public.seller_profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_profiles_verification_status ON public.seller_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_rating ON public.seller_profiles(rating);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_is_premium ON public.seller_profiles(is_premium);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_seller_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seller_profiles_updated_at
    BEFORE UPDATE ON public.seller_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_profiles_updated_at();

-- Insert default seller profile for existing users (optional)
-- This will create a basic profile for users who already exist
INSERT INTO public.seller_profiles (user_id, full_name, verification_status)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', email),
    'pending'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.seller_profiles)
ON CONFLICT (user_id) DO NOTHING;
