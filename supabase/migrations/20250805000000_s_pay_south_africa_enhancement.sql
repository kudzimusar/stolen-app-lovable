-- S-Pay South African Enhancement Migration
-- This migration enhances the S-Pay wallet system for South African market compliance

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Enhanced Wallet Schema (ZAR currency and South African compliance)
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS available_balance DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS escrow_balance DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS total_rewards DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS daily_limit DECIMAL(12,2) DEFAULT 15000.00; -- R15,000 daily limit
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS monthly_limit DECIMAL(12,2) DEFAULT 100000.00; -- R100,000 monthly limit
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS fica_status TEXT DEFAULT 'pending'; -- FICA compliance status
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS fica_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS last_transaction_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS daily_transaction_count INTEGER DEFAULT 0;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS monthly_transaction_count INTEGER DEFAULT 0;

-- Update currency to ZAR for existing wallets
UPDATE public.wallets SET currency = 'ZAR' WHERE currency = 'USD' OR currency IS NULL;

-- 2. Transaction fees table (ZAR-based fees)
CREATE TABLE IF NOT EXISTS public.transaction_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type TEXT NOT NULL,
    fee_percentage DECIMAL(5,4) DEFAULT 0.00,
    fixed_fee DECIMAL(10,2) DEFAULT 0.00,
    min_fee DECIMAL(10,2) DEFAULT 0.00,
    max_fee DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enhanced transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS net_amount DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS escrow_id UUID;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS from_user_id UUID REFERENCES public.users(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS to_user_id UUID REFERENCES public.users(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update currency to ZAR for existing transactions
UPDATE public.transactions SET currency = 'ZAR' WHERE currency = 'USD' OR currency IS NULL;

-- 4. Payment methods table (South African specific)
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL, -- 'bank_account', 'eft', 'snapscan', 'zapper', 'paypal', 'crypto_wallet'
    method_data JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Withdrawal requests table (ZAR currency)
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_method_id UUID REFERENCES public.payment_methods(id),
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
    processing_fee DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(12,2) NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Transaction disputes table
CREATE TABLE IF NOT EXISTS public.transaction_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    dispute_type TEXT NOT NULL, -- 'fraud', 'unauthorized', 'duplicate', 'service_not_received'
    reason TEXT NOT NULL,
    evidence_urls TEXT[],
    status TEXT DEFAULT 'open', -- 'open', 'under_review', 'resolved', 'closed'
    resolution TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 7. South African banking integration table
CREATE TABLE IF NOT EXISTS public.sa_bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL, -- 'absa', 'fnb', 'nedbank', 'standard_bank', 'capitec', etc.
    account_number TEXT NOT NULL,
    account_type TEXT NOT NULL, -- 'savings', 'cheque', 'credit'
    branch_code TEXT,
    account_holder_name TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. FICA compliance tracking
CREATE TABLE IF NOT EXISTS public.fica_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL, -- 'id_document', 'proof_of_address', 'income_verification'
    document_type TEXT NOT NULL, -- 'sa_id', 'passport', 'drivers_license', 'utility_bill', 'bank_statement'
    document_number TEXT,
    document_url TEXT,
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Wallet verification table
CREATE TABLE IF NOT EXISTS public.wallet_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL, -- 'identity', 'address', 'income', 'source_of_funds'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    documents_submitted TEXT[],
    admin_notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Transaction limits table
CREATE TABLE IF NOT EXISTS public.transaction_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    limit_type TEXT NOT NULL, -- 'daily', 'monthly', 'single_transaction'
    current_amount DECIMAL(12,2) DEFAULT 0.00,
    limit_amount DECIMAL(12,2) NOT NULL,
    reset_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_verified ON public.wallets(user_id, is_verified);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(from_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON public.transactions(transaction_type, status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_sa_bank_accounts_user ON public.sa_bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_fica_verifications_user ON public.fica_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_limits_user ON public.transaction_limits(user_id);

-- Functions for balance calculations
CREATE OR REPLACE FUNCTION calculate_wallet_balance(wallet_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_balance DECIMAL;
BEGIN
    SELECT 
        COALESCE(available_balance, 0) + 
        COALESCE(escrow_balance, 0) + 
        COALESCE(pending_balance, 0)
    INTO total_balance
    FROM public.wallets
    WHERE id = wallet_id;
    
    RETURN total_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate transaction fees
CREATE OR REPLACE FUNCTION calculate_transaction_fee(amount DECIMAL, transaction_type TEXT)
RETURNS DECIMAL AS $$
DECLARE
    fee_info RECORD;
    calculated_fee DECIMAL;
BEGIN
    SELECT fee_percentage, fixed_fee, min_fee, max_fee
    INTO fee_info
    FROM public.transaction_fees
    WHERE transaction_type = $2 AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN 0.00;
    END IF;
    
    -- Calculate percentage fee
    calculated_fee = (amount * fee_info.fee_percentage) + fee_info.fixed_fee;
    
    -- Apply min/max constraints
    IF calculated_fee < fee_info.min_fee THEN
        calculated_fee = fee_info.min_fee;
    ELSIF calculated_fee > fee_info.max_fee THEN
        calculated_fee = fee_info.max_fee;
    END IF;
    
    RETURN calculated_fee;
END;
$$ LANGUAGE plpgsql;

-- Function to validate transaction limits
CREATE OR REPLACE FUNCTION validate_transaction_limits(user_id UUID, amount DECIMAL, transaction_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    wallet_info RECORD;
    daily_limit DECIMAL;
    monthly_limit DECIMAL;
    daily_used DECIMAL;
    monthly_used DECIMAL;
BEGIN
    -- Get wallet limits
    SELECT daily_limit, monthly_limit, daily_transaction_count, monthly_transaction_count
    INTO wallet_info
    FROM public.wallets
    WHERE user_id = $1;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check daily limit
    SELECT COALESCE(SUM(amount), 0)
    INTO daily_used
    FROM public.transactions
    WHERE from_user_id = $1 
    AND created_at >= CURRENT_DATE
    AND status = 'completed';
    
    IF (daily_used + amount) > wallet_info.daily_limit THEN
        RETURN FALSE;
    END IF;
    
    -- Check monthly limit
    SELECT COALESCE(SUM(amount), 0)
    INTO monthly_used
    FROM public.transactions
    WHERE from_user_id = $1 
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND status = 'completed';
    
    IF (monthly_used + amount) > wallet_info.monthly_limit THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update wallet balance when transaction is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update sender balance
        IF NEW.from_user_id IS NOT NULL THEN
            UPDATE public.wallets 
            SET available_balance = available_balance - NEW.amount,
                last_transaction_date = NOW(),
                daily_transaction_count = daily_transaction_count + 1,
                monthly_transaction_count = monthly_transaction_count + 1
            WHERE user_id = NEW.from_user_id;
        END IF;
        
        -- Update recipient balance
        IF NEW.to_user_id IS NOT NULL THEN
            UPDATE public.wallets 
            SET available_balance = available_balance + NEW.net_amount,
                last_transaction_date = NOW()
            WHERE user_id = NEW.to_user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily limits
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void AS $$
BEGIN
    UPDATE public.wallets 
    SET daily_transaction_count = 0
    WHERE DATE(last_transaction_date) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly limits
CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void AS $$
BEGIN
    UPDATE public.wallets 
    SET monthly_transaction_count = 0
    WHERE DATE_TRUNC('month', last_transaction_date) < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_wallet_balance
    AFTER UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- Insert default transaction fees (ZAR currency)
INSERT INTO public.transaction_fees (transaction_type, fee_percentage, fixed_fee, min_fee, max_fee) VALUES
('transfer', 0.005, 2.50, 2.50, 50.00), -- R2.50 minimum, R50 maximum
('escrow', 0.01, 5.00, 5.00, 100.00), -- R5.00 minimum, R100 maximum
('marketplace', 0.03, 0.00, 5.00, 250.00), -- R5.00 minimum, R250 maximum
('withdrawal', 0.02, 10.00, 10.00, 150.00), -- R10.00 minimum, R150 maximum
('eft', 0.005, 5.00, 5.00, 25.00), -- EFT transfer fees
('mobile_payment', 0.02, 2.00, 2.00, 20.00), -- Mobile money fees
('reward', 0.00, 0.00, 0.00, 0.00) -- No fees on rewards
ON CONFLICT (transaction_type) DO NOTHING;

-- Insert default transaction limits
INSERT INTO public.transaction_limits (user_id, limit_type, limit_amount, reset_date) 
SELECT 
    user_id,
    'daily',
    15000.00,
    CURRENT_DATE + INTERVAL '1 day'
FROM public.wallets
ON CONFLICT DO NOTHING;

INSERT INTO public.transaction_limits (user_id, limit_type, limit_amount, reset_date) 
SELECT 
    user_id,
    'monthly',
    100000.00,
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
FROM public.wallets
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) Policies
ALTER TABLE public.transaction_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sa_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fica_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transaction_fees (read-only for all authenticated users)
CREATE POLICY "transaction_fees_read_policy" ON public.transaction_fees
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for payment_methods
CREATE POLICY "payment_methods_user_policy" ON public.payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for withdrawal_requests
CREATE POLICY "withdrawal_requests_user_policy" ON public.withdrawal_requests
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for transaction_disputes
CREATE POLICY "transaction_disputes_user_policy" ON public.transaction_disputes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for sa_bank_accounts
CREATE POLICY "sa_bank_accounts_user_policy" ON public.sa_bank_accounts
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for fica_verifications
CREATE POLICY "fica_verifications_user_policy" ON public.fica_verifications
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for wallet_verifications
CREATE POLICY "wallet_verifications_user_policy" ON public.wallet_verifications
    FOR ALL USING (auth.uid() = (SELECT user_id FROM public.wallets WHERE id = wallet_id));

-- RLS Policies for transaction_limits
CREATE POLICY "transaction_limits_user_policy" ON public.transaction_limits
    FOR ALL USING (auth.uid() = user_id);

-- Create a cron job to reset daily limits (runs daily at midnight)
SELECT cron.schedule(
    'reset-daily-limits',
    '0 0 * * *',
    'SELECT reset_daily_limits();'
);

-- Create a cron job to reset monthly limits (runs monthly on the 1st)
SELECT cron.schedule(
    'reset-monthly-limits',
    '0 0 1 * *',
    'SELECT reset_monthly_limits();'
);
