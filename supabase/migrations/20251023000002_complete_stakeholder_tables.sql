-- Complete Stakeholder Admin System
-- Creates ALL missing tables referenced by the stakeholder admin views
-- Maintains full complexity and functionality for each stakeholder

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- REPAIR ORDERS TABLE (for Repair Shop admins)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.repair_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_shop_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  repair_type TEXT NOT NULL, -- 'screen', 'battery', 'water_damage', 'software', 'other'
  issue_description TEXT NOT NULL,
  diagnosis TEXT,
  parts_used JSONB DEFAULT '[]'::JSONB, -- [{name, cost, quantity}]
  labor_cost DECIMAL(10,2) DEFAULT 0,
  parts_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (labor_cost + parts_cost) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'warranty_claim')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  estimated_completion TIMESTAMP WITH TIME ZONE,
  actual_completion TIMESTAMP WITH TIME ZONE,
  warranty_period_days INTEGER DEFAULT 0,
  warranty_expiry TIMESTAMP WITH TIME ZONE,
  technician_name TEXT,
  customer_notes TEXT,
  internal_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  photos_before TEXT[] DEFAULT ARRAY[]::TEXT[],
  photos_after TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repair_orders_shop ON public.repair_orders(repair_shop_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_customer ON public.repair_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_status ON public.repair_orders(status);
CREATE INDEX IF NOT EXISTS idx_repair_orders_created ON public.repair_orders(created_at DESC);

-- =====================================================
-- INSURANCE POLICIES TABLE (for Insurance admins)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_number TEXT UNIQUE NOT NULL,
  provider_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  policyholder_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('theft', 'damage', 'comprehensive', 'warranty_extension')),
  coverage_type TEXT NOT NULL, -- 'basic', 'premium', 'platinum'
  coverage_limit DECIMAL(12,2) NOT NULL,
  premium_amount DECIMAL(10,2) NOT NULL,
  deductible DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'expired', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  renewal_date DATE,
  payment_frequency TEXT CHECK (payment_frequency IN ('monthly', 'quarterly', 'annually', 'one_time')),
  covered_incidents TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['theft', 'accidental_damage', 'water_damage', 'screen_damage']
  exclusions TEXT[] DEFAULT ARRAY[]::TEXT[],
  beneficiary_name TEXT,
  beneficiary_relationship TEXT,
  documents JSONB DEFAULT '[]'::JSONB, -- [{type, url, uploaded_at}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_policies_provider ON public.insurance_policies(provider_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_policyholder ON public.insurance_policies(policyholder_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON public.insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_number ON public.insurance_policies(policy_number);

-- =====================================================
-- INSURANCE CLAIMS TABLE (for Insurance admins)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_number TEXT UNIQUE NOT NULL,
  policy_id UUID REFERENCES public.insurance_policies(id) ON DELETE CASCADE,
  insurance_provider_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  claimant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('theft', 'loss', 'accidental_damage', 'water_damage', 'screen_damage', 'other')),
  incident_date DATE NOT NULL,
  incident_location TEXT,
  police_report_number TEXT,
  claim_amount DECIMAL(12,2) NOT NULL,
  approved_amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'paid', 'appealed')),
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  review_date TIMESTAMP WITH TIME ZONE,
  approval_date TIMESTAMP WITH TIME ZONE,
  payment_date TIMESTAMP WITH TIME ZONE,
  reviewer_id UUID REFERENCES public.users(id),
  reviewer_notes TEXT,
  rejection_reason TEXT,
  evidence_photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  supporting_documents JSONB DEFAULT '[]'::JSONB,
  fraud_score DECIMAL(5,2) DEFAULT 0, -- AI fraud detection score
  fraud_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy ON public.insurance_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_provider ON public.insurance_claims(insurance_provider_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_claimant ON public.insurance_claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_number ON public.insurance_claims(claim_number);

-- =====================================================
-- DEVICE DONATIONS TABLE (for NGO admins)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.device_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_number TEXT UNIQUE NOT NULL,
  ngo_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  donation_type TEXT CHECK (donation_type IN ('individual', 'corporate', 'government', 'international')),
  donation_value DECIMAL(10,2),
  tax_deductible BOOLEAN DEFAULT TRUE,
  tax_receipt_issued BOOLEAN DEFAULT FALSE,
  tax_receipt_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'processing', 'completed', 'distributed', 'declined')),
  condition_on_receipt TEXT CHECK (condition_on_receipt IN ('new', 'like-new', 'excellent', 'good', 'fair', 'poor')),
  refurbishment_needed BOOLEAN DEFAULT FALSE,
  refurbishment_cost DECIMAL(10,2),
  intended_beneficiary TEXT, -- 'student', 'senior', 'disabled', 'low_income', 'refugee', 'other'
  program_name TEXT,
  impact_category TEXT, -- 'education', 'healthcare', 'employment', 'communication'
  distribution_date TIMESTAMP WITH TIME ZONE,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  impact_notes TEXT,
  donor_recognition TEXT, -- 'anonymous', 'public', 'certificate_only'
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  documents JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_donations_ngo ON public.device_donations(ngo_id);
CREATE INDEX IF NOT EXISTS idx_device_donations_donor ON public.device_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_device_donations_recipient ON public.device_donations(recipient_id);
CREATE INDEX IF NOT EXISTS idx_device_donations_status ON public.device_donations(status);
CREATE INDEX IF NOT EXISTS idx_device_donations_number ON public.device_donations(donation_number);

-- =====================================================
-- ADD MISSING COLUMNS TO STOLEN_REPORTS (for Law Enforcement)
-- =====================================================

-- Add assigned_officer_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'stolen_reports' 
    AND column_name = 'assigned_officer_id'
  ) THEN
    ALTER TABLE public.stolen_reports 
    ADD COLUMN assigned_officer_id UUID REFERENCES public.users(id);
    
    CREATE INDEX IF NOT EXISTS idx_stolen_reports_officer ON public.stolen_reports(assigned_officer_id);
  END IF;
END $$;

-- =====================================================
-- MARKETPLACE TRANSACTIONS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_number TEXT UNIQUE NOT NULL,
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed', 'refunded')),
  payment_method TEXT,
  payment_intent_id TEXT,
  escrow_id UUID,
  shipping_address JSONB,
  tracking_number TEXT,
  delivery_method TEXT CHECK (delivery_method IN ('meetup', 'courier', 'collection')),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_buyer ON public.marketplace_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_seller ON public.marketplace_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_listing ON public.marketplace_transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_status ON public.marketplace_transactions(status);

-- =====================================================
-- ENABLE RLS ON ALL NEW TABLES
-- =====================================================

ALTER TABLE public.repair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Repair Orders: Repair shops see their orders, customers see their orders, admins see all
DROP POLICY IF EXISTS repair_orders_policy ON public.repair_orders;

CREATE POLICY repair_orders_policy ON public.repair_orders
  FOR ALL
  USING (
    repair_shop_id = auth.uid()
    OR customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('admin', 'super_admin')
    )
  );

-- Insurance Policies: Provider sees their policies, policyholders see their own, admins see all
DROP POLICY IF EXISTS insurance_policies_policy ON public.insurance_policies;

CREATE POLICY insurance_policies_policy ON public.insurance_policies
  FOR ALL
  USING (
    provider_id = auth.uid()
    OR policyholder_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('admin', 'super_admin')
    )
  );

-- Insurance Claims: Provider sees their claims, claimants see their own, admins see all
DROP POLICY IF EXISTS insurance_claims_policy ON public.insurance_claims;

CREATE POLICY insurance_claims_policy ON public.insurance_claims
  FOR ALL
  USING (
    insurance_provider_id = auth.uid()
    OR claimant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('admin', 'super_admin')
    )
  );

-- Device Donations: NGO sees their donations, donors/recipients see their own, admins see all
DROP POLICY IF EXISTS device_donations_policy ON public.device_donations;

CREATE POLICY device_donations_policy ON public.device_donations
  FOR ALL
  USING (
    ngo_id = auth.uid()
    OR donor_id = auth.uid()
    OR recipient_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('admin', 'super_admin')
    )
  );

-- Marketplace Transactions: Buyer/seller see their transactions, admins see all
DROP POLICY IF EXISTS marketplace_transactions_policy ON public.marketplace_transactions;

CREATE POLICY marketplace_transactions_policy ON public.marketplace_transactions
  FOR ALL
  USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('admin', 'super_admin')
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Complete stakeholder tables created successfully';
  RAISE NOTICE '📋 Tables: repair_orders, insurance_policies, insurance_claims, device_donations, marketplace_transactions';
  RAISE NOTICE '🔒 RLS policies applied to all tables';
  RAISE NOTICE '📊 Ready for stakeholder admin views';
END $$;

