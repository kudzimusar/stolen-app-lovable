-- Complete fix for all missing columns in lost_found_reports table
-- Run this in Supabase SQL Editor

-- Add incident_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'incident_date'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN incident_date TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Added incident_date column to lost_found_reports table';
    ELSE
        RAISE NOTICE 'incident_date column already exists';
    END IF;
END $$;

-- Add documents column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'documents'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN documents TEXT[] DEFAULT '{}';
        
        RAISE NOTICE 'Added documents column to lost_found_reports table';
    ELSE
        RAISE NOTICE 'documents column already exists';
    END IF;
END $$;

-- Add photos column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'photos'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN photos TEXT[] DEFAULT '{}';
        
        RAISE NOTICE 'Added photos column to lost_found_reports table';
    ELSE
        RAISE NOTICE 'photos column already exists';
    END IF;
END $$;

-- Add reward_amount column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'reward_amount'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN reward_amount DECIMAL(10,2);
        
        RAISE NOTICE 'Added reward_amount column to lost_found_reports table';
    ELSE
        RAISE NOTICE 'reward_amount column already exists';
    END IF;
END $$;

-- Verify all columns exist
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'lost_found_reports'
AND column_name IN (
    'incident_date', 
    'documents', 
    'photos', 
    'contact_preferences', 
    'privacy_settings',
    'reward_amount',
    'location_lat',
    'location_lng',
    'location_address'
)
ORDER BY column_name;
