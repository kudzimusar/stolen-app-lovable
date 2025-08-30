-- Advanced Security Features Migration
-- This migration adds AI fraud detection, MFA, real-time verification, and advanced rate limiting

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. AI Fraud Detection Tables
CREATE TABLE IF NOT EXISTS public.fraud_analysis_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    fraud_score DECIMAL(5,2) NOT NULL,
    risk_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    risk_factors TEXT[],
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    risk_score DECIMAL(5,2) DEFAULT 0.00,
    risk_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    risk_factors TEXT[],
    recommendations TEXT[],
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fraud_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rules JSONB NOT NULL,
    updated_by UUID REFERENCES public.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Multi-Factor Authentication Tables
CREATE TABLE IF NOT EXISTS public.mfa_setup (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mfa_type TEXT NOT NULL, -- 'totp', 'sms', 'email'
    secret TEXT,
    backup_codes TEXT[],
    phone_number TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mfa_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    amount DECIMAL(12,2),
    verification_type TEXT NOT NULL, -- 'totp', 'sms', 'backup_code'
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sms_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Real-time Verification Tables
CREATE TABLE IF NOT EXISTS public.real_time_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'sa_id', 'passport', 'drivers_license', 'proof_of_address', 'bank_account'
    document_number TEXT NOT NULL,
    verification_data JSONB,
    status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'failed'
    confidence_score DECIMAL(5,2),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    device_name TEXT,
    user_agent TEXT,
    ip_address TEXT,
    location TEXT,
    is_trusted BOOLEAN DEFAULT FALSE,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    ip_address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_ip_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    is_trusted BOOLEAN DEFAULT FALSE,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Advanced Rate Limiting Tables
CREATE TABLE IF NOT EXISTS public.rate_limit_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    action TEXT NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rate_limit_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config JSONB NOT NULL,
    updated_by UUID REFERENCES public.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rate_limit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    action TEXT NOT NULL,
    allowed BOOLEAN NOT NULL,
    remaining_requests INTEGER NOT NULL,
    limit_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_user_date ON public.fraud_analysis_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_score ON public.fraud_analysis_logs(fraud_score DESC);
CREATE INDEX IF NOT EXISTS idx_mfa_setup_user ON public.mfa_setup(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_verifications_user ON public.mfa_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_codes_user_phone ON public.sms_codes(user_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_codes_expires ON public.sms_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_real_time_verifications_user ON public.real_time_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_real_time_verifications_type ON public.real_time_verifications(document_type);
CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint ON public.user_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_user ON public.user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ip_addresses_user ON public.user_ip_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_usage_user_endpoint ON public.rate_limit_usage(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_usage_window ON public.rate_limit_usage(window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_user ON public.rate_limit_logs(user_id);

-- Functions for advanced security features

-- Function to calculate user risk score
CREATE OR REPLACE FUNCTION calculate_user_risk_score(user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    risk_score DECIMAL := 0;
    fraud_count INTEGER;
    dispute_count INTEGER;
    account_age INTEGER;
    fica_verified BOOLEAN;
BEGIN
    -- Get fraud analysis count
    SELECT COUNT(*) INTO fraud_count
    FROM public.fraud_analysis_logs
    WHERE user_id = $1 AND fraud_score > 70;
    
    -- Get dispute count
    SELECT COUNT(*) INTO dispute_count
    FROM public.transaction_disputes
    WHERE user_id = $1;
    
    -- Get account age
    SELECT 
        EXTRACT(DAY FROM (NOW() - created_at))::INTEGER,
        fica_status = 'verified'
    INTO account_age, fica_verified
    FROM public.wallets
    WHERE user_id = $1;
    
    -- Calculate risk score
    risk_score := risk_score + (fraud_count * 20);
    risk_score := risk_score + (dispute_count * 15);
    
    IF account_age < 7 THEN
        risk_score := risk_score + 25;
    ELSIF account_age < 30 THEN
        risk_score := risk_score + 10;
    END IF;
    
    IF NOT fica_verified THEN
        risk_score := risk_score + 20;
    END IF;
    
    RETURN LEAST(100, GREATEST(0, risk_score));
END;
$$ LANGUAGE plpgsql;

-- Function to update user risk profile
CREATE OR REPLACE FUNCTION update_user_risk_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_risk_profiles (user_id, risk_score, risk_level, last_updated)
    VALUES (
        NEW.user_id,
        calculate_user_risk_score(NEW.user_id),
        CASE 
            WHEN calculate_user_risk_score(NEW.user_id) < 30 THEN 'low'
            WHEN calculate_user_risk_score(NEW.user_id) < 50 THEN 'medium'
            WHEN calculate_user_risk_score(NEW.user_id) < 80 THEN 'high'
            ELSE 'critical'
        END,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        risk_score = EXCLUDED.risk_score,
        risk_level = EXCLUDED.risk_level,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired SMS codes
CREATE OR REPLACE FUNCTION cleanup_expired_sms_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM public.sms_codes
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old rate limit usage
CREATE OR REPLACE FUNCTION cleanup_old_rate_limit_usage()
RETURNS void AS $$
BEGIN
    DELETE FROM public.rate_limit_usage
    WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_risk_profile
    AFTER INSERT OR UPDATE ON public.fraud_analysis_logs
    FOR EACH ROW EXECUTE FUNCTION update_user_risk_profile();

-- Create scheduled jobs
SELECT cron.schedule(
    'cleanup-expired-sms-codes',
    '*/15 * * * *', -- Every 15 minutes
    'SELECT cleanup_expired_sms_codes();'
);

SELECT cron.schedule(
    'cleanup-old-rate-limit-usage',
    '0 */6 * * *', -- Every 6 hours
    'SELECT cleanup_old_rate_limit_usage();'
);

-- Insert default fraud rules
INSERT INTO public.fraud_rules (rules) VALUES (
    '{
        "rules": [
            {
                "name": "High Amount Transfer",
                "conditions": {
                    "amount_min": 50000,
                    "user_risk_level": ["high", "critical"]
                },
                "action": "require_mfa",
                "fraud_score_adjustment": 20
            },
            {
                "name": "New Recipient",
                "conditions": {
                    "recipient_type": "new",
                    "amount_min": 10000
                },
                "action": "flag_for_review",
                "fraud_score_adjustment": 15
            },
            {
                "name": "Unusual Location",
                "conditions": {
                    "location_change": true,
                    "time_window": "1 hour"
                },
                "action": "require_verification",
                "fraud_score_adjustment": 25
            },
            {
                "name": "Rapid Transactions",
                "conditions": {
                    "transaction_count": 5,
                    "time_window": "10 minutes"
                },
                "action": "block",
                "fraud_score_adjustment": 30
            }
        ]
    }'
) ON CONFLICT DO NOTHING;

-- Insert default rate limit configuration
INSERT INTO public.rate_limit_config (config) VALUES (
    '{
        "default_limits": {
            "individual": {
                "requests_per_hour": 100,
                "requests_per_day": 1000
            },
            "retailer": {
                "requests_per_hour": 500,
                "requests_per_day": 5000
            },
            "repair_shop": {
                "requests_per_hour": 300,
                "requests_per_day": 3000
            },
            "insurance": {
                "requests_per_hour": 1000,
                "requests_per_day": 10000
            },
            "law_enforcement": {
                "requests_per_hour": 200,
                "requests_per_day": 2000
            },
            "ngo": {
                "requests_per_hour": 200,
                "requests_per_day": 2000
            },
            "platform_admin": {
                "requests_per_hour": 10000,
                "requests_per_day": 100000
            },
            "payment_gateway": {
                "requests_per_hour": 5000,
                "requests_per_day": 50000
            }
        },
        "endpoint_limits": {
            "ai-fraud-detection": {
                "multiplier": 0.5
            },
            "mfa-authentication": {
                "multiplier": 0.3
            },
            "real-time-verification": {
                "multiplier": 0.2
            }
        },
        "risk_adjustments": {
            "low": 1.5,
            "medium": 1.0,
            "high": 0.5,
            "critical": 0.25
        }
    }'
) ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) Policies
ALTER TABLE public.fraud_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_setup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ip_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fraud analysis logs
CREATE POLICY "fraud_analysis_logs_user_policy" ON public.fraud_analysis_logs
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user risk profiles
CREATE POLICY "user_risk_profiles_user_policy" ON public.user_risk_profiles
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for fraud rules (admin only)
CREATE POLICY "fraud_rules_admin_policy" ON public.fraud_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'platform_admin'
        )
    );

-- RLS Policies for MFA setup
CREATE POLICY "mfa_setup_user_policy" ON public.mfa_setup
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for MFA verifications
CREATE POLICY "mfa_verifications_user_policy" ON public.mfa_verifications
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for SMS codes
CREATE POLICY "sms_codes_user_policy" ON public.sms_codes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for real-time verifications
CREATE POLICY "real_time_verifications_user_policy" ON public.real_time_verifications
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user devices
CREATE POLICY "user_devices_user_policy" ON public.user_devices
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user locations
CREATE POLICY "user_locations_user_policy" ON public.user_locations
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user IP addresses
CREATE POLICY "user_ip_addresses_user_policy" ON public.user_ip_addresses
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for rate limit usage
CREATE POLICY "rate_limit_usage_user_policy" ON public.rate_limit_usage
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for rate limit config (admin only)
CREATE POLICY "rate_limit_config_admin_policy" ON public.rate_limit_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'platform_admin'
        )
    );

-- RLS Policies for rate limit logs
CREATE POLICY "rate_limit_logs_user_policy" ON public.rate_limit_logs
    FOR ALL USING (auth.uid() = user_id);
