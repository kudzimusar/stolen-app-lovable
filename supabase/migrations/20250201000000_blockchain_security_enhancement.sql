-- Blockchain and Security Enhancement for S-Pay Wallet
-- This migration adds comprehensive blockchain integration, multi-signature support,
-- fraud detection, and advanced security features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better type safety
CREATE TYPE blockchain_network AS ENUM ('ethereum', 'polygon', 'binance_smart_chain', 'avalanche');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed', 'cancelled');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE security_action AS ENUM ('approve', 'review', 'block', 'escalate');
CREATE TYPE multisig_status AS ENUM ('pending_signatures', 'ready_for_execution', 'executed', 'expired', 'cancelled');

-- 1. Blockchain Transactions Table
CREATE TABLE IF NOT EXISTS public.blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    transaction_hash TEXT NOT NULL UNIQUE,
    block_number BIGINT,
    confirmations INTEGER DEFAULT 0,
    gas_used BIGINT,
    gas_fee DECIMAL(18,8),
    status transaction_status DEFAULT 'pending',
    network blockchain_network DEFAULT 'polygon',
    from_address TEXT,
    to_address TEXT,
    contract_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    
    -- Indexes for performance
    CONSTRAINT positive_confirmations CHECK (confirmations >= 0),
    CONSTRAINT positive_gas_used CHECK (gas_used >= 0)
);

-- 2. Multi-Signature Transactions Table
CREATE TABLE IF NOT EXISTS public.multisig_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    multisig_id TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_data JSONB NOT NULL,
    required_signatures INTEGER NOT NULL DEFAULT 2,
    current_signatures INTEGER DEFAULT 0,
    signers TEXT[] NOT NULL,
    pending_signers TEXT[] NOT NULL,
    status multisig_status DEFAULT 'pending_signatures',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_result JSONB,
    
    CONSTRAINT valid_signatures CHECK (current_signatures <= required_signatures),
    CONSTRAINT positive_required_signatures CHECK (required_signatures > 0)
);

-- 3. Multi-Signature Signatures Table
CREATE TABLE IF NOT EXISTS public.multisig_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    multisig_id TEXT REFERENCES public.multisig_transactions(multisig_id) ON DELETE CASCADE,
    signer_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    signature TEXT NOT NULL,
    signature_method TEXT DEFAULT 'ecdsa',
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    UNIQUE(multisig_id, signer_user_id)
);

-- 4. Fraud Analysis Logs Table
CREATE TABLE IF NOT EXISTS public.fraud_analysis_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_data JSONB NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level risk_level NOT NULL,
    triggers TEXT[] NOT NULL,
    recommended_action security_action NOT NULL,
    requires_manual_review BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_decision security_action,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Wallet Security Configurations Table
CREATE TABLE IF NOT EXISTS public.wallet_security_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    multi_sig_required BOOLEAN DEFAULT FALSE,
    required_signatures INTEGER DEFAULT 2,
    signers TEXT[] DEFAULT ARRAY[]::TEXT[],
    daily_limit DECIMAL(12,2) DEFAULT 15000.00,
    monthly_limit DECIMAL(12,2) DEFAULT 100000.00,
    require_hardware_auth BOOLEAN DEFAULT FALSE,
    allowed_countries TEXT[] DEFAULT ARRAY['ZA']::TEXT[],
    blocked_countries TEXT[] DEFAULT ARRAY[]::TEXT[],
    block_suspicious_ips BOOLEAN DEFAULT TRUE,
    max_device_count INTEGER DEFAULT 5,
    session_timeout_minutes INTEGER DEFAULT 30,
    require_2fa_for_high_value BOOLEAN DEFAULT TRUE,
    high_value_threshold DECIMAL(12,2) DEFAULT 5000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_limits CHECK (daily_limit >= 0 AND monthly_limit >= 0),
    CONSTRAINT positive_signatures CHECK (required_signatures > 0),
    CONSTRAINT valid_thresholds CHECK (high_value_threshold >= 0)
);

-- 6. User Risk Profiles Table
CREATE TABLE IF NOT EXISTS public.user_risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    overall_risk_score INTEGER DEFAULT 50 CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
    transaction_velocity_score INTEGER DEFAULT 0,
    geographic_risk_score INTEGER DEFAULT 0,
    device_risk_score INTEGER DEFAULT 0,
    behavior_risk_score INTEGER DEFAULT 0,
    total_transaction_count INTEGER DEFAULT 0,
    total_transaction_volume DECIMAL(15,2) DEFAULT 0.00,
    avg_transaction_amount DECIMAL(12,2) DEFAULT 0.00,
    suspicious_activity_count INTEGER DEFAULT 0,
    last_suspicious_activity TIMESTAMP WITH TIME ZONE,
    trusted_devices TEXT[] DEFAULT ARRAY[]::TEXT[],
    known_locations JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT non_negative_counts CHECK (
        total_transaction_count >= 0 AND 
        suspicious_activity_count >= 0
    ),
    CONSTRAINT non_negative_amounts CHECK (
        total_transaction_volume >= 0 AND 
        avg_transaction_amount >= 0
    )
);

-- 7. Device Fingerprints Table
CREATE TABLE IF NOT EXISTS public.device_fingerprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    fingerprint_hash TEXT NOT NULL,
    device_type TEXT, -- 'mobile', 'desktop', 'tablet'
    operating_system TEXT,
    browser TEXT,
    screen_resolution TEXT,
    timezone TEXT,
    language TEXT,
    ip_address INET,
    geolocation JSONB,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_trusted BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 1,
    
    UNIQUE(user_id, fingerprint_hash),
    CONSTRAINT positive_usage_count CHECK (usage_count >= 0)
);

-- 8. Transaction Security Logs Table
CREATE TABLE IF NOT EXISTS public.transaction_security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    security_check_type TEXT NOT NULL, -- 'fraud_detection', '2fa_verification', 'device_verification', etc.
    check_result TEXT NOT NULL, -- 'passed', 'failed', 'warning'
    risk_factors JSONB,
    mitigation_actions TEXT[],
    processing_time_ms INTEGER,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_processing_time CHECK (processing_time_ms >= 0)
);

-- 9. Blockchain Network Status Table
CREATE TABLE IF NOT EXISTS public.blockchain_network_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    network blockchain_network NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    current_block_number BIGINT,
    last_block_time TIMESTAMP WITH TIME ZONE,
    average_confirmation_time_seconds INTEGER,
    gas_price_gwei DECIMAL(10,4),
    network_congestion_level TEXT, -- 'low', 'medium', 'high'
    api_endpoint TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(network),
    CONSTRAINT positive_metrics CHECK (
        current_block_number >= 0 AND 
        average_confirmation_time_seconds >= 0 AND
        gas_price_gwei >= 0
    )
);

-- 10. Payment Processing Logs Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.payment_processing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    payment_method_type TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    fees JSONB,
    status TEXT NOT NULL,
    external_reference TEXT,
    processing_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    processing_time_ms INTEGER,
    error_code TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    webhook_data JSONB,
    
    CONSTRAINT positive_amount CHECK (amount > 0),
    CONSTRAINT non_negative_retry CHECK (retry_count >= 0),
    CONSTRAINT positive_processing_time CHECK (processing_time_ms >= 0)
);

-- 11. FICA Verification Documents Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.fica_verification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'sa_id', 'passport', 'drivers_license', 'proof_of_address', 'bank_statement', 'income_verification'
    document_category TEXT NOT NULL, -- 'identity', 'address', 'income'
    document_number TEXT,
    document_url TEXT,
    document_hash TEXT, -- For integrity verification
    ocr_extracted_data JSONB,
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'requires_review'
    verification_score INTEGER CHECK (verification_score >= 0 AND verification_score <= 100),
    verification_notes TEXT,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_categories CHECK (document_category IN ('identity', 'address', 'income', 'other'))
);

-- 12. Transaction Limits (Enhanced)
CREATE TABLE IF NOT EXISTS public.enhanced_transaction_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    limit_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly', 'single_transaction'
    limit_category TEXT NOT NULL, -- 'send', 'receive', 'withdraw', 'deposit', 'total'
    current_amount DECIMAL(12,2) DEFAULT 0.00,
    limit_amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    override_reason TEXT,
    override_approved_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, limit_type, limit_category),
    CONSTRAINT non_negative_amounts CHECK (current_amount >= 0 AND limit_amount >= 0)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_hash ON public.blockchain_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_status ON public.blockchain_transactions(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_network ON public.blockchain_transactions(network);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_confirmations ON public.blockchain_transactions(confirmations);

CREATE INDEX IF NOT EXISTS idx_multisig_transactions_status ON public.multisig_transactions(status);
CREATE INDEX IF NOT EXISTS idx_multisig_transactions_expires ON public.multisig_transactions(expires_at);
CREATE INDEX IF NOT EXISTS idx_multisig_transactions_user ON public.multisig_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_fraud_analysis_user_date ON public.fraud_analysis_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_risk_level ON public.fraud_analysis_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_action ON public.fraud_analysis_logs(recommended_action);

CREATE INDEX IF NOT EXISTS idx_device_fingerprints_user ON public.device_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_hash ON public.device_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_trusted ON public.device_fingerprints(is_trusted);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_blocked ON public.device_fingerprints(is_blocked);

CREATE INDEX IF NOT EXISTS idx_transaction_security_logs_transaction ON public.transaction_security_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_security_logs_user_date ON public.transaction_security_logs(user_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_processing_logs_transaction ON public.payment_processing_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_processing_logs_status ON public.payment_processing_logs(status);
CREATE INDEX IF NOT EXISTS idx_payment_processing_logs_method ON public.payment_processing_logs(payment_method_type);

CREATE INDEX IF NOT EXISTS idx_fica_verification_user_status ON public.fica_verification_documents(user_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_fica_verification_expires ON public.fica_verification_documents(expires_at);

CREATE INDEX IF NOT EXISTS idx_enhanced_limits_user_type ON public.enhanced_transaction_limits(user_id, limit_type, limit_category);
CREATE INDEX IF NOT EXISTS idx_enhanced_limits_reset_date ON public.enhanced_transaction_limits(reset_date);

-- Create functions for automated processing

-- Function to update user risk profile based on transaction activity
CREATE OR REPLACE FUNCTION update_user_risk_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Update risk profile when a new fraud analysis is created
    INSERT INTO public.user_risk_profiles (user_id, overall_risk_score, updated_at)
    VALUES (NEW.user_id, NEW.risk_score, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET
        overall_risk_score = (
            (user_risk_profiles.overall_risk_score * 0.8) + 
            (NEW.risk_score * 0.2)
        )::INTEGER,
        suspicious_activity_count = CASE 
            WHEN NEW.risk_level IN ('high', 'critical') 
            THEN user_risk_profiles.suspicious_activity_count + 1
            ELSE user_risk_profiles.suspicious_activity_count
        END,
        last_suspicious_activity = CASE 
            WHEN NEW.risk_level IN ('high', 'critical') 
            THEN NOW()
            ELSE user_risk_profiles.last_suspicious_activity
        END,
        updated_at = NOW();
        
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically expire old multi-sig transactions
CREATE OR REPLACE FUNCTION expire_multisig_transactions()
RETURNS void AS $$
BEGIN
    UPDATE public.multisig_transactions
    SET status = 'expired'::multisig_status
    WHERE expires_at < NOW() 
    AND status = 'pending_signatures'::multisig_status;
END;
$$ LANGUAGE plpgsql;

-- Function to update blockchain transaction confirmations
CREATE OR REPLACE FUNCTION update_blockchain_confirmations()
RETURNS void AS $$
BEGIN
    -- This would be called by a scheduled job to update confirmations
    -- from the actual blockchain network
    UPDATE public.blockchain_transactions
    SET 
        confirmations = LEAST(confirmations + 1, 12),
        status = CASE 
            WHEN confirmations >= 12 THEN 'confirmed'::transaction_status
            ELSE status
        END
    WHERE status = 'pending'::transaction_status
    AND created_at < NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_user_risk_profile
    AFTER INSERT ON public.fraud_analysis_logs
    FOR EACH ROW EXECUTE FUNCTION update_user_risk_profile();

-- Insert default blockchain network configurations
INSERT INTO public.blockchain_network_status (network, is_active, api_endpoint, network_congestion_level) VALUES
('polygon', true, 'https://polygon-rpc.com', 'low'),
('ethereum', true, 'https://mainnet.infura.io/v3/YOUR_API_KEY', 'medium'),
('binance_smart_chain', true, 'https://bsc-dataseed1.binance.org', 'low'),
('avalanche', true, 'https://api.avax.network/ext/bc/C/rpc', 'low')
ON CONFLICT (network) DO NOTHING;

-- Insert default transaction fee configurations
INSERT INTO public.transaction_fees (transaction_type, fee_percentage, fixed_fee, min_fee, max_fee) VALUES
('blockchain_transfer', 0.001, 0.50, 0.50, 25.00), -- Blockchain fees
('multisig_setup', 0.00, 10.00, 10.00, 10.00), -- One-time multi-sig setup
('fraud_review', 0.00, 5.00, 5.00, 5.00), -- Manual fraud review fee
('expedited_transfer', 0.01, 15.00, 15.00, 100.00), -- Fast-track transfers
('international_transfer', 0.025, 25.00, 25.00, 500.00) -- Cross-border transfers
ON CONFLICT (transaction_type) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Create RLS policies for security
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multisig_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multisig_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_security_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fica_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_transaction_limits ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (users can only see their own data)
CREATE POLICY "Users can view their own blockchain transactions" ON public.blockchain_transactions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.transactions t 
        WHERE t.id = blockchain_transactions.transaction_id 
        AND (t.from_user_id = auth.uid() OR t.to_user_id = auth.uid())
    )
);

CREATE POLICY "Users can view their own multisig transactions" ON public.multisig_transactions
FOR ALL USING (user_id = auth.uid() OR auth.uid() = ANY(signers::UUID[]));

CREATE POLICY "Users can view their own security configs" ON public.wallet_security_configs
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own risk profiles" ON public.user_risk_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own device fingerprints" ON public.device_fingerprints
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own FICA documents" ON public.fica_verification_documents
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own transaction limits" ON public.enhanced_transaction_limits
FOR ALL USING (user_id = auth.uid());

-- Enable realtime for important tables
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blockchain_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.multisig_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fraud_analysis_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transaction_security_logs;

COMMENT ON TABLE public.blockchain_transactions IS 'Immutable records of all transactions recorded on blockchain networks';
COMMENT ON TABLE public.multisig_transactions IS 'Multi-signature transactions requiring multiple approvals for high-value or high-risk transfers';
COMMENT ON TABLE public.fraud_analysis_logs IS 'AI-powered fraud detection results and risk assessments for all transactions';
COMMENT ON TABLE public.wallet_security_configs IS 'User-configurable security settings including multi-sig requirements and limits';
COMMENT ON TABLE public.user_risk_profiles IS 'Dynamic risk assessment profiles for users based on transaction history and behavior';
COMMENT ON TABLE public.device_fingerprints IS 'Device identification and trust management for security and fraud prevention';
COMMENT ON TABLE public.fica_verification_documents IS 'FICA compliance documentation and verification status for South African regulations';
COMMENT ON TABLE public.enhanced_transaction_limits IS 'Configurable transaction limits by type and category for risk management';
