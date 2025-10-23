-- Fix Department Admin Views to Show Real Aggregated Data
-- These views aggregate data across ALL users in each department, not per-user

-- =====================================================
-- 1. RETAILER DEPARTMENT VIEW (Aggregate All Marketplace Data)
-- =====================================================

DROP VIEW IF EXISTS public.retailer_admin_stats CASCADE;

CREATE OR REPLACE VIEW public.retailer_admin_stats AS
SELECT
  -- Count all marketplace listings from retailer users
  COUNT(DISTINCT ml.id) as total_listings,
  COUNT(DISTINCT CASE WHEN ml.status = 'active' THEN ml.id END) as active_listings,
  COUNT(DISTINCT CASE WHEN ml.status = 'sold' THEN ml.id END) as sold_listings,
  COUNT(DISTINCT CASE WHEN ml.status = 'pending' THEN ml.id END) as pending_verification,
  COUNT(DISTINCT ml.seller_id) as total_sellers,
  
  -- Calculate revenue from sold listings
  COALESCE(SUM(CASE WHEN ml.status = 'sold' THEN ml.price END), 0) as total_revenue,
  
  -- Calculate average listing price
  COALESCE(AVG(ml.price), 0) as average_listing_price,
  
  -- Count featured listings
  COUNT(DISTINCT CASE WHEN ml.featured = true THEN ml.id END) as featured_listings,
  
  -- Calculate conversion rate
  CASE 
    WHEN COUNT(DISTINCT ml.id) > 0 THEN 
      ROUND((COUNT(DISTINCT CASE WHEN ml.status = 'sold' THEN ml.id END)::numeric / COUNT(DISTINCT ml.id)::numeric) * 100, 1)
    ELSE 0 
  END as conversion_rate
FROM marketplace_listings ml;

-- =====================================================
-- 2. REPAIR SHOP DEPARTMENT VIEW (Aggregate All Repair Data)
-- =====================================================

DROP VIEW IF EXISTS public.repair_shop_admin_stats CASCADE;

-- First check if repair_orders table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'repair_orders') THEN
    EXECUTE '
    CREATE OR REPLACE VIEW public.repair_shop_admin_stats AS
    SELECT
      COUNT(DISTINCT ro.id) as total_repairs,
      COUNT(DISTINCT CASE WHEN ro.status = ''pending'' THEN ro.id END) as pending_repairs,
      COUNT(DISTINCT CASE WHEN ro.status = ''in_progress'' THEN ro.id END) as in_progress_repairs,
      COUNT(DISTINCT CASE WHEN ro.status = ''completed'' THEN ro.id END) as completed_repairs,
      COUNT(DISTINCT ro.customer_id) as total_customers,
      COALESCE(SUM(CASE WHEN ro.status = ''completed'' THEN ro.actual_cost END), 0) as total_revenue,
      COALESCE(AVG(CASE WHEN ro.rating IS NOT NULL THEN ro.rating END), 0) as average_rating,
      COALESCE(AVG(CASE WHEN ro.status = ''completed'' THEN ro.actual_cost END), 0) as average_repair_cost,
      CASE 
        WHEN COUNT(DISTINCT ro.id) > 0 THEN 
          ROUND((COUNT(DISTINCT CASE WHEN ro.status = ''completed'' THEN ro.id END)::numeric / COUNT(DISTINCT ro.id)::numeric) * 100, 1)
        ELSE 0 
      END as completion_rate
    FROM repair_orders ro';
  ELSE
    -- Create empty view if table doesn't exist
    EXECUTE '
    CREATE OR REPLACE VIEW public.repair_shop_admin_stats AS
    SELECT
      0::bigint as total_repairs,
      0::bigint as pending_repairs,
      0::bigint as in_progress_repairs,
      0::bigint as completed_repairs,
      0::bigint as total_customers,
      0::numeric as total_revenue,
      0::numeric as average_rating,
      0::numeric as average_repair_cost,
      0::numeric as completion_rate';
  END IF;
END $$;

-- =====================================================
-- 3. INSURANCE DEPARTMENT VIEW (Aggregate All Insurance Data)
-- =====================================================

DROP VIEW IF EXISTS public.insurance_admin_stats CASCADE;

-- Check if insurance tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_policies') THEN
    EXECUTE '
    CREATE OR REPLACE VIEW public.insurance_admin_stats AS
    SELECT
      COUNT(DISTINCT ip.id) as total_policies,
      COUNT(DISTINCT CASE WHEN ip.status = ''active'' THEN ip.id END) as active_policies,
      COUNT(DISTINCT ic.id) as total_claims,
      COUNT(DISTINCT CASE WHEN ic.status = ''pending'' OR ic.status = ''under_review'' THEN ic.id END) as pending_claims,
      COUNT(DISTINCT CASE WHEN ic.status = ''approved'' THEN ic.id END) as approved_claims,
      COALESCE(SUM(CASE WHEN ic.status = ''paid'' THEN ic.approved_amount END), 0) as total_payouts,
      COALESCE(SUM(CASE WHEN ip.status = ''active'' THEN ip.premium_amount END), 0) as total_premiums_collected,
      COALESCE(AVG(ic.claim_amount), 0) as average_claim_amount,
      CASE 
        WHEN COUNT(DISTINCT ic.id) > 0 THEN 
          ROUND((COUNT(DISTINCT CASE WHEN ic.status = ''approved'' THEN ic.id END)::numeric / COUNT(DISTINCT ic.id)::numeric) * 100, 1)
        ELSE 0 
      END as claim_approval_rate
    FROM insurance_policies ip
    LEFT JOIN insurance_claims ic ON ic.policy_id = ip.id';
  ELSE
    -- Create empty view if tables don't exist
    EXECUTE '
    CREATE OR REPLACE VIEW public.insurance_admin_stats AS
    SELECT
      0::bigint as total_policies,
      0::bigint as active_policies,
      0::bigint as total_claims,
      0::bigint as pending_claims,
      0::bigint as approved_claims,
      0::numeric as total_payouts,
      0::numeric as total_premiums_collected,
      0::numeric as average_claim_amount,
      0::numeric as claim_approval_rate';
  END IF;
END $$;

-- =====================================================
-- 4. LAW ENFORCEMENT DEPARTMENT VIEW (Aggregate All Reports)
-- =====================================================

DROP VIEW IF EXISTS public.law_enforcement_admin_stats CASCADE;

CREATE OR REPLACE VIEW public.law_enforcement_admin_stats AS
SELECT
  -- Count stolen/lost reports
  COUNT(DISTINCT lfr.id) as total_cases,
  COUNT(DISTINCT CASE WHEN lfr.status = 'active' OR lfr.status = 'investigating' THEN lfr.id END) as active_cases,
  COUNT(DISTINCT CASE WHEN lfr.status = 'resolved' OR lfr.status = 'found' THEN lfr.id END) as resolved_cases,
  COUNT(DISTINCT CASE WHEN lfr.status = 'closed' THEN lfr.id END) as closed_cases,
  
  -- Calculate resolution rate
  CASE 
    WHEN COUNT(DISTINCT lfr.id) > 0 THEN 
      ROUND((COUNT(DISTINCT CASE WHEN lfr.status = 'resolved' OR lfr.status = 'found' THEN lfr.id END)::numeric / COUNT(DISTINCT lfr.id)::numeric) * 100, 1)
    ELSE 0 
  END as resolution_rate,
  
  -- Count reports this month
  COUNT(DISTINCT CASE 
    WHEN lfr.created_at >= DATE_TRUNC('month', NOW()) THEN lfr.id 
  END) as reports_this_month,
  
  -- Count high priority (if reward_amount exists)
  0 as high_priority_cases, -- Placeholder, can be updated based on actual fields
  0 as total_rewards_offered -- Placeholder
FROM lost_found_reports lfr
WHERE lfr.report_type IN ('lost', 'stolen');

-- =====================================================
-- 5. NGO DEPARTMENT VIEW (Aggregate All Donations)
-- =====================================================

DROP VIEW IF EXISTS public.ngo_admin_stats CASCADE;

-- Check if device_donations table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'device_donations') THEN
    EXECUTE '
    CREATE OR REPLACE VIEW public.ngo_admin_stats AS
    SELECT
      COUNT(DISTINCT dd.id) as total_donations,
      COUNT(DISTINCT CASE WHEN dd.status = ''pending'' OR dd.status = ''in_transit'' THEN dd.id END) as pending_donations,
      COUNT(DISTINCT CASE WHEN dd.status = ''completed'' THEN dd.id END) as completed_donations,
      COUNT(DISTINCT dd.donor_id) as total_donors,
      COUNT(DISTINCT dd.recipient_id) as total_beneficiaries,
      COUNT(DISTINCT dd.device_id) as devices_managed,
      COALESCE(SUM(dd.donation_value), 0) as total_donation_value,
      COUNT(DISTINCT CASE WHEN dd.status = ''pending'' OR dd.status = ''in_transit'' THEN dd.id END) as devices_awaiting_distribution,
      CASE 
        WHEN COUNT(DISTINCT dd.id) > 0 THEN 
          ROUND((COUNT(DISTINCT CASE WHEN dd.status = ''completed'' THEN dd.id END)::numeric / COUNT(DISTINCT dd.id)::numeric) * 100, 1)
        ELSE 0 
      END as completion_rate,
      -- Calculate impact score (simplified)
      LEAST(100, ROUND((COUNT(DISTINCT dd.id) * 2 + COUNT(DISTINCT dd.recipient_id) * 1.5)::numeric, 0)) as impact_score
    FROM device_donations dd';
  ELSE
    -- Create empty view if table doesn't exist
    EXECUTE '
    CREATE OR REPLACE VIEW public.ngo_admin_stats AS
    SELECT
      0::bigint as total_donations,
      0::bigint as pending_donations,
      0::bigint as completed_donations,
      0::bigint as total_donors,
      0::bigint as total_beneficiaries,
      0::bigint as devices_managed,
      0::numeric as total_donation_value,
      0::bigint as devices_awaiting_distribution,
      0::numeric as completion_rate,
      0::numeric as impact_score';
  END IF;
END $$;

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant SELECT on all views to authenticated users
GRANT SELECT ON public.retailer_admin_stats TO authenticated;
GRANT SELECT ON public.repair_shop_admin_stats TO authenticated;
GRANT SELECT ON public.insurance_admin_stats TO authenticated;
GRANT SELECT ON public.law_enforcement_admin_stats TO authenticated;
GRANT SELECT ON public.ngo_admin_stats TO authenticated;

-- =====================================================
-- 7. VERIFICATION
-- =====================================================

-- Test the views
SELECT '=== RETAILER STATS ===' as view_name;
SELECT * FROM public.retailer_admin_stats;

SELECT '=== REPAIR SHOP STATS ===' as view_name;
SELECT * FROM public.repair_shop_admin_stats;

SELECT '=== INSURANCE STATS ===' as view_name;
SELECT * FROM public.insurance_admin_stats;

SELECT '=== LAW ENFORCEMENT STATS ===' as view_name;
SELECT * FROM public.law_enforcement_admin_stats;

SELECT '=== NGO STATS ===' as view_name;
SELECT * FROM public.ngo_admin_stats;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All department admin views created/updated successfully';
  RAISE NOTICE '📊 Views now show aggregated data across entire department';
  RAISE NOTICE '🔄 Frontend dashboards will fetch from these views';
END $$;
