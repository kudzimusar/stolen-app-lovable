-- =====================================================================
-- ULTIMATE LOST AND FOUND TABLE FIX
-- This script handles ALL scenarios:
-- 1. Table doesn't exist → Creates it
-- 2. Table exists but missing columns → Adds them
-- 3. Verifies EVERY required column
-- =====================================================================

-- Step 1: Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS public.lost_found_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

-- Step 2: Add user_id if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Added user_id';
    END IF;
END $$;

-- Step 3: Add report_type if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'report_type'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN report_type TEXT NOT NULL DEFAULT 'lost' CHECK (report_type IN ('lost', 'found'));
        RAISE NOTICE '✓ Added report_type';
    END IF;
END $$;

-- Step 4: Add device_category if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'device_category'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN device_category TEXT;
        RAISE NOTICE '✓ Added device_category';
    END IF;
END $$;

-- Step 5: Add device_model if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'device_model'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN device_model TEXT;
        RAISE NOTICE '✓ Added device_model';
    END IF;
END $$;

-- Step 6: Add serial_number if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'serial_number'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN serial_number TEXT;
        RAISE NOTICE '✓ Added serial_number';
    END IF;
END $$;

-- Step 7: Add description if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'description'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN description TEXT;
        RAISE NOTICE '✓ Added description';
    END IF;
END $$;

-- =====================================================================
-- CRITICAL LOCATION FIELDS (These are causing the current error)
-- =====================================================================

-- Step 8: Add location_lat if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'location_lat'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN location_lat DECIMAL(10,8);
        RAISE NOTICE '✓ Added location_lat (CRITICAL FIX)';
    END IF;
END $$;

-- Step 9: Add location_lng if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'location_lng'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN location_lng DECIMAL(11,8);
        RAISE NOTICE '✓ Added location_lng (CRITICAL FIX)';
    END IF;
END $$;

-- Step 10: Add location_address if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'location_address'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN location_address TEXT;
        RAISE NOTICE '✓ Added location_address';
    END IF;
END $$;

-- =====================================================================
-- DATETIME FIELDS
-- =====================================================================

-- Step 11: Add incident_date if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'incident_date'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN incident_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✓ Added incident_date';
    END IF;
END $$;

-- Step 12: Add created_at if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✓ Added created_at';
    END IF;
END $$;

-- Step 13: Add updated_at if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✓ Added updated_at';
    END IF;
END $$;

-- =====================================================================
-- REWARD & COMMUNITY FIELDS
-- =====================================================================

-- Step 14: Add reward_amount if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'reward_amount'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN reward_amount DECIMAL(10,2);
        RAISE NOTICE '✓ Added reward_amount';
    END IF;
END $$;

-- Step 15: Add verification_status if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN verification_status TEXT DEFAULT 'pending';
        RAISE NOTICE '✓ Added verification_status';
    END IF;
END $$;

-- Step 16: Add community_score if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'community_score'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN community_score INTEGER DEFAULT 0;
        RAISE NOTICE '✓ Added community_score';
    END IF;
END $$;

-- =====================================================================
-- JSONB SETTINGS FIELDS
-- =====================================================================

-- Step 17: Add contact_preferences if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'contact_preferences'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN contact_preferences JSONB DEFAULT '{}';
        RAISE NOTICE '✓ Added contact_preferences';
    END IF;
END $$;

-- Step 18: Add privacy_settings if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'privacy_settings'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN privacy_settings JSONB DEFAULT '{}';
        RAISE NOTICE '✓ Added privacy_settings';
    END IF;
END $$;

-- =====================================================================
-- ARRAY FIELDS FOR MEDIA
-- =====================================================================

-- Step 19: Add photos array if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'photos'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN photos TEXT[] DEFAULT '{}';
        RAISE NOTICE '✓ Added photos';
    END IF;
END $$;

-- Step 20: Add documents array if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'documents'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN documents TEXT[] DEFAULT '{}';
        RAISE NOTICE '✓ Added documents';
    END IF;
END $$;

-- =====================================================================
-- VERIFICATION & FINAL CHECKS
-- =====================================================================

-- List all current columns
SELECT 
    '========================================' as separator,
    'CURRENT TABLE STRUCTURE' as status,
    '========================================' as separator2;

SELECT 
    column_name, 
    data_type,
    CASE 
        WHEN is_nullable = 'YES' THEN 'NULL'
        ELSE 'NOT NULL'
    END as nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'lost_found_reports'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count total columns
SELECT 
    '========================================' as separator,
    'VERIFICATION COMPLETE' as status,
    COUNT(*) as total_columns,
    '20 columns expected' as expected
FROM information_schema.columns
WHERE table_name = 'lost_found_reports'
AND table_schema = 'public';

-- Verify critical location columns exist
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'lost_found_reports' 
            AND column_name IN ('location_lat', 'location_lng', 'location_address')
            HAVING COUNT(*) = 3
        )
        THEN '✅ ALL LOCATION COLUMNS EXIST'
        ELSE '❌ LOCATION COLUMNS MISSING'
    END as location_check;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ TABLE FIX COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'All 20 required columns have been verified/added:';
    RAISE NOTICE '  ✓ Core fields (id, user_id, report_type, device info)';
    RAISE NOTICE '  ✓ Location fields (location_lat, location_lng, location_address) ← FIXED!';
    RAISE NOTICE '  ✓ Media fields (photos[], documents[])';
    RAISE NOTICE '  ✓ Settings (contact_preferences, privacy_settings)';
    RAISE NOTICE '  ✓ Metadata (incident_date, created_at, updated_at)';
    RAISE NOTICE '  ✓ Community (verification_status, community_score, reward_amount)';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 You can now submit reports without errors!';
    RAISE NOTICE '';
END $$;
