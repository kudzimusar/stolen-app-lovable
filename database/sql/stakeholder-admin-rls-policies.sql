-- Stakeholder Admin RLS Policies
-- Ensures role-based data filtering so stakeholder admins only see their own data
-- Super admins can see all data

-- =====================================================
-- DEVICES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS devices_stakeholder_policy ON public.devices;
DROP POLICY IF EXISTS devices_super_admin_policy ON public.devices;

-- Users see only their own devices, admins see all
CREATE POLICY devices_stakeholder_policy ON public.devices
  FOR ALL
  USING (
    current_owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- MARKETPLACE LISTINGS POLICIES
-- =====================================================

DROP POLICY IF EXISTS marketplace_stakeholder_policy ON public.marketplace_listings;

-- Stakeholders see only their listings, admins see all
CREATE POLICY marketplace_stakeholder_policy ON public.marketplace_listings
  FOR ALL
  USING (
    seller_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- LOST & FOUND REPORTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS lost_found_stakeholder_policy ON public.lost_found_reports;

-- Users see their own reports, law enforcement and admins see relevant reports
CREATE POLICY lost_found_stakeholder_policy ON public.lost_found_reports
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'law_enforcement')
    )
  );

-- =====================================================
-- STOLEN REPORTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS stolen_reports_stakeholder_policy ON public.stolen_reports;

-- Similar to lost_found_reports
CREATE POLICY stolen_reports_stakeholder_policy ON public.stolen_reports
  FOR ALL
  USING (
    reporter_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'law_enforcement')
    )
  );

-- =====================================================
-- TRANSACTIONS POLICIES
-- =====================================================

DROP POLICY IF EXISTS transactions_stakeholder_policy ON public.transactions;

-- Users see only their transactions, admins see all
CREATE POLICY transactions_stakeholder_policy ON public.transactions
  FOR SELECT
  USING (
    from_wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
    OR to_wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- WALLETS POLICIES
-- =====================================================

DROP POLICY IF EXISTS wallets_stakeholder_policy ON public.wallets;

-- Users see only their wallet, admins see all
CREATE POLICY wallets_stakeholder_policy ON public.wallets
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- USERS TABLE POLICIES (for stakeholder admins to see their customers)
-- =====================================================

DROP POLICY IF EXISTS users_stakeholder_admin_policy ON public.users;

-- Stakeholder admins can see users who interacted with them
-- Individuals see only themselves
-- Admins see all
CREATE POLICY users_stakeholder_admin_policy ON public.users
  FOR SELECT
  USING (
    id = auth.uid() -- User can see themselves
    OR EXISTS ( -- Admins see all
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
    )
    OR EXISTS ( -- Retailers see their customers (who bought from them)
      SELECT 1 FROM public.marketplace_transactions mt
      JOIN public.users u ON u.id = auth.uid()
      WHERE mt.seller_id = u.id
      AND mt.buyer_id = users.id
      AND u.role = 'retailer'
    )
    OR EXISTS ( -- Repair shops see their customers
      SELECT 1 FROM public.repair_orders ro
      JOIN public.users u ON u.id = auth.uid()
      WHERE ro.repair_shop_id = u.id
      AND ro.customer_id = users.id
      AND u.role = 'repair_shop'
    )
  );

-- =====================================================
-- ADMIN FILE OPERATIONS - Already has RLS policies
-- =====================================================

-- No changes needed - already implemented in migration

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Stakeholder admin RLS policies created successfully';
  RAISE NOTICE '🔒 All stakeholder admins can now only see their own data';
  RAISE NOTICE '👑 Super admins can see all data for support and audit';
END $$;

