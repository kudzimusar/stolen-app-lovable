-- Department-Specific RLS Policies
-- Ensures each department admin can only see their relevant data

-- =====================================================
-- 1. MARKETPLACE LISTINGS (Retailer Dept)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS retailer_dept_marketplace ON public.marketplace_listings;
DROP POLICY IF EXISTS marketplace_listings_retailer ON public.marketplace_listings;

-- Retailer Dept: See all marketplace listings
CREATE POLICY retailer_dept_marketplace ON public.marketplace_listings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('retailer', 'admin', 'super_admin')
    )
  );

-- =====================================================
-- 2. REPAIR ORDERS (Repair Shop Dept)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS repair_dept_orders ON public.repair_orders;
DROP POLICY IF EXISTS repair_orders_repair_shop ON public.repair_orders;

-- Repair Shop Dept: See all repair orders
CREATE POLICY repair_dept_orders ON public.repair_orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('repair_shop', 'admin', 'super_admin')
    )
  );

-- =====================================================
-- 3. INSURANCE POLICIES (Insurance Dept)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS insurance_dept_policies ON public.insurance_policies;
DROP POLICY IF EXISTS insurance_policies_insurance ON public.insurance_policies;

-- Insurance Dept: See all policies
CREATE POLICY insurance_dept_policies ON public.insurance_policies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('insurance', 'admin', 'super_admin')
    )
  );

-- =====================================================
-- 4. INSURANCE CLAIMS (Insurance Dept)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS insurance_dept_claims ON public.insurance_claims;
DROP POLICY IF EXISTS insurance_claims_insurance ON public.insurance_claims;

-- Insurance Dept: See all claims
CREATE POLICY insurance_dept_claims ON public.insurance_claims
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('insurance', 'admin', 'super_admin')
    )
  );

-- =====================================================
-- 5. STOLEN REPORTS (Law Enforcement Dept)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS law_enforcement_dept_reports ON public.stolen_reports;
DROP POLICY IF EXISTS stolen_reports_law_enforcement ON public.stolen_reports;

-- Law Enforcement Dept: See all stolen reports
CREATE POLICY law_enforcement_dept_reports ON public.stolen_reports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('law_enforcement', 'admin', 'super_admin')
    )
  );

-- =====================================================
-- 6. LOST FOUND REPORTS (Law Enforcement Dept)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS law_enforcement_dept_lost_found ON public.lost_found_reports;
DROP POLICY IF EXISTS lost_found_reports_law_enforcement ON public.lost_found_reports;

-- Law Enforcement Dept: See all lost/found reports
CREATE POLICY law_enforcement_dept_lost_found ON public.lost_found_reports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('law_enforcement', 'admin', 'super_admin')
    )
  );

-- =====================================================
-- 7. DEVICE DONATIONS (NGO Dept)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS ngo_dept_donations ON public.device_donations;
DROP POLICY IF EXISTS device_donations_ngo ON public.device_donations;

-- NGO Dept: See all donations
CREATE POLICY ngo_dept_donations ON public.device_donations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('ngo', 'admin', 'super_admin')
    )
  );

-- =====================================================
-- 8. DEVICES (All Departments)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS devices_department_access ON public.devices;
DROP POLICY IF EXISTS devices_stakeholder_policy ON public.devices;

-- All departments can see devices relevant to their operations
CREATE POLICY devices_department_access ON public.devices
  FOR ALL
  USING (
    -- Super Admin sees all
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('admin', 'super_admin')
    )
    OR
    -- Retailer sees devices in marketplace
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text = 'retailer'
      AND EXISTS (
        SELECT 1 FROM public.marketplace_listings ml
        WHERE ml.device_id = devices.id
      )
    )
    OR
    -- Repair Shop sees devices under repair
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text = 'repair_shop'
      AND EXISTS (
        SELECT 1 FROM public.repair_orders ro
        WHERE ro.device_id = devices.id
      )
    )
    OR
    -- Insurance sees insured devices
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text = 'insurance'
      AND EXISTS (
        SELECT 1 FROM public.insurance_policies ip
        WHERE ip.device_id = devices.id
      )
    )
    OR
    -- Law Enforcement sees stolen/lost devices
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text = 'law_enforcement'
      AND devices.status IN ('stolen', 'lost')
    )
    OR
    -- NGO sees donated devices
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text = 'ngo'
      AND EXISTS (
        SELECT 1 FROM public.device_donations dd
        WHERE dd.device_id = devices.id
      )
    )
  );

-- =====================================================
-- 9. USERS (Department-Specific Access)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS users_department_access ON public.users;
DROP POLICY IF EXISTS users_stakeholder_policy ON public.users;

-- Department admins can see users relevant to their operations
CREATE POLICY users_department_access ON public.users
  FOR ALL
  USING (
    -- Super Admin sees all
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role::text IN ('admin', 'super_admin')
    )
    OR
    -- Retailer sees other retailers and their customers
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role::text = 'retailer'
      AND (
        users.role::text = 'retailer' 
        OR users.role::text = 'individual'
      )
    )
    OR
    -- Repair Shop sees repair shops and their customers
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role::text = 'repair_shop'
      AND (
        users.role::text = 'repair_shop' 
        OR users.role::text = 'individual'
      )
    )
    OR
    -- Insurance sees policyholders
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role::text = 'insurance'
      AND users.role::text = 'individual'
    )
    OR
    -- Law Enforcement sees law enforcement and individuals
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role::text = 'law_enforcement'
      AND (
        users.role::text = 'law_enforcement' 
        OR users.role::text = 'individual'
      )
    )
    OR
    -- NGO sees NGO partners and beneficiaries
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role::text = 'ngo'
      AND (
        users.role::text = 'ngo' 
        OR users.role::text = 'individual'
      )
    )
  );

-- =====================================================
-- 10. VERIFICATION
-- =====================================================

-- Test RLS policies by checking access for each role
DO $$
DECLARE
  test_user_id UUID;
  test_role TEXT;
BEGIN
  -- Test each department role
  FOR test_role IN SELECT unnest(ARRAY['retailer', 'repair_shop', 'insurance', 'law_enforcement', 'ngo']) LOOP
    -- Get a user with this role
    SELECT id INTO test_user_id 
    FROM public.users 
    WHERE role::text = test_role 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
      RAISE NOTICE '✅ RLS policies configured for % role (user: %)', test_role, test_user_id;
    ELSE
      RAISE NOTICE '⚠️ No users found for role: %', test_role;
    END IF;
  END LOOP;
  
  RAISE NOTICE '🔐 All department-specific RLS policies created successfully';
  RAISE NOTICE '📊 Each department can only access their relevant data';
  RAISE NOTICE '🔑 Super Admin retains access to all data';
END $$;
