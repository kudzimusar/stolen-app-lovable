-- COMPREHENSIVE MARKETPLACE DIAGNOSTIC SCRIPT
-- Run this to understand the current state of your marketplace data

-- ==================================================
-- SECTION 1: TABLE EXISTENCE CHECK
-- ==================================================
SELECT '=== TABLE EXISTENCE CHECK ===' as section;

SELECT 
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'marketplace_listings'
    ) as marketplace_listings_exists,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'devices'
    ) as devices_exists;

-- ==================================================
-- SECTION 2: LISTING COUNT BY STATUS
-- ==================================================
SELECT '=== LISTING COUNT BY STATUS ===' as section;

SELECT 
    COUNT(*) as total_listings,
    COUNT(CASE WHEN status::text = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status::text = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status::text = 'rejected' THEN 1 END) as rejected,
    COUNT(CASE WHEN status::text = 'active' THEN 1 END) as active,
    COUNT(CASE WHEN status::text = 'sold' THEN 1 END) as sold,
    COUNT(CASE WHEN status::text = 'cancelled' THEN 1 END) as cancelled,
    COUNT(CASE WHEN status::text = 'expired' THEN 1 END) as expired
FROM public.marketplace_listings;

-- ==================================================
-- SECTION 3: ALL LISTINGS DETAILS
-- ==================================================
SELECT '=== ALL LISTINGS (FULL DETAILS) ===' as section;

SELECT 
    ml.id as listing_id,
    ml.device_id,
    ml.seller_id,
    ml.title,
    ml.price,
    ml.status::text as listing_status,
    ml.featured,
    ml.created_at,
    ml.updated_at,
    d.id as device_exists,
    d.device_name,
    d.brand,
    d.model,
    d.current_owner_id as device_owner_id,
    CASE 
        WHEN d.id IS NULL THEN '❌ Device not found'
        WHEN ml.seller_id != d.current_owner_id THEN '⚠️ Seller is not device owner'
        ELSE '✅ OK'
    END as validation_status
FROM public.marketplace_listings ml
LEFT JOIN public.devices d ON ml.device_id = d.id
ORDER BY ml.created_at DESC;

-- ==================================================
-- SECTION 4: USER-SPECIFIC LISTINGS
-- ==================================================
SELECT '=== LISTINGS FOR USER f67127ff-3fee-4949-b60f-28b16e1027d3 ===' as section;

SELECT 
    ml.id,
    ml.title,
    ml.price,
    ml.status::text,
    ml.created_at,
    d.device_name
FROM public.marketplace_listings ml
LEFT JOIN public.devices d ON ml.device_id = d.id
WHERE ml.seller_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
ORDER BY ml.created_at DESC;

-- ==================================================
-- SECTION 5: RLS POLICIES
-- ==================================================
SELECT '=== RLS POLICIES ON marketplace_listings ===' as section;

SELECT 
    policyname as policy_name,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'marketplace_listings'
ORDER BY policyname;

-- ==================================================
-- SECTION 6: ENUM VALUES CHECK
-- ==================================================
SELECT '=== LISTING_STATUS ENUM VALUES ===' as section;

SELECT 
    enumlabel as allowed_status_value,
    enumsortorder as sort_order
FROM pg_enum
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'listing_status'
)
ORDER BY enumsortorder;

-- ==================================================
-- SECTION 7: RECENT DEVICE REGISTRATIONS
-- ==================================================
SELECT '=== RECENT DEVICES (POTENTIAL LISTING SOURCES) ===' as section;

SELECT 
    d.id as device_id,
    d.device_name,
    d.brand,
    d.model,
    d.current_owner_id,
    d.status as device_status,
    d.created_at,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.marketplace_listings ml 
            WHERE ml.device_id = d.id
        ) THEN '✅ Has listing'
        ELSE '⚠️ No listing'
    END as listing_status
FROM public.devices d
WHERE d.current_owner_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
ORDER BY d.created_at DESC
LIMIT 5;

-- ==================================================
-- SECTION 8: SCHEMA COMPATIBILITY CHECK
-- ==================================================
SELECT '=== MARKETPLACE_LISTINGS COLUMNS ===' as section;

SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'marketplace_listings'
ORDER BY ordinal_position;

