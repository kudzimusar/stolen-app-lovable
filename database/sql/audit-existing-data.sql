-- Comprehensive Database Audit
-- Check what data exists and how it's structured

-- =====================================================
-- 1. USERS BY ROLE
-- =====================================================
SELECT '=== USERS BY ROLE ===' as section;
SELECT 
  role::text as role, 
  COUNT(*) as count, 
  string_agg(email, ', ' ORDER BY email) as users 
FROM users 
GROUP BY role 
ORDER BY role;

-- =====================================================
-- 2. DEVICES
-- =====================================================
SELECT '=== DEVICES ===' as section;
SELECT 
  COUNT(*) as total_devices,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'stolen' THEN 1 END) as stolen,
  COUNT(CASE WHEN status = 'lost' THEN 1 END) as lost
FROM devices;

-- =====================================================
-- 3. MARKETPLACE LISTINGS
-- =====================================================
SELECT '=== MARKETPLACE LISTINGS ===' as section;
SELECT 
  COUNT(*) as total_listings,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
FROM marketplace_listings;

-- Check if listings are linked to retailer users
SELECT '=== LISTINGS BY SELLER ROLE ===' as section;
SELECT 
  u.role::text,
  COUNT(ml.id) as listing_count
FROM marketplace_listings ml
LEFT JOIN users u ON u.id = ml.seller_id
GROUP BY u.role;

-- =====================================================
-- 4. CHECK IF DEPARTMENT TABLES EXIST
-- =====================================================
SELECT '=== EXISTING TABLES ===' as section;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'repair_orders', 
    'insurance_policies', 
    'insurance_claims', 
    'stolen_reports', 
    'device_donations',
    'marketplace_transactions'
  )
ORDER BY table_name;

-- =====================================================
-- 5. CHECK IF DEPARTMENT VIEWS EXIST
-- =====================================================
SELECT '=== EXISTING VIEWS ===' as section;
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name LIKE '%admin_stats%'
ORDER BY table_name;

-- =====================================================
-- 6. LOST/FOUND REPORTS
-- =====================================================
SELECT '=== LOST/FOUND REPORTS ===' as section;
SELECT 
  report_type,
  COUNT(*) as count
FROM lost_found_reports
GROUP BY report_type;

-- =====================================================
-- 7. CHECK REPAIR ORDERS (if table exists)
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'repair_orders') THEN
    RAISE NOTICE '=== REPAIR ORDERS ===';
    PERFORM COUNT(*) FROM repair_orders;
  ELSE
    RAISE NOTICE 'Table repair_orders does not exist';
  END IF;
END $$;

-- =====================================================
-- 8. CHECK INSURANCE TABLES (if exist)
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_policies') THEN
    RAISE NOTICE '=== INSURANCE POLICIES ===';
    PERFORM COUNT(*) FROM insurance_policies;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_claims') THEN
    RAISE NOTICE '=== INSURANCE CLAIMS ===';
    PERFORM COUNT(*) FROM insurance_claims;
  END IF;
END $$;

-- =====================================================
-- 9. SUMMARY
-- =====================================================
SELECT '=== AUDIT COMPLETE ===' as section;
