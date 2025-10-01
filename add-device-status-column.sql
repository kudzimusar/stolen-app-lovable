-- Add device status column for tracking recovery progress
-- Run this in Supabase SQL Editor

-- Add status column with proper constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.lost_found_reports 
        ADD COLUMN status TEXT DEFAULT 'active' 
        CHECK (status IN ('active', 'contacted', 'pending_verification', 'reunited', 'closed'));
        
        RAISE NOTICE '✓ Added status column to lost_found_reports table';
    ELSE
        RAISE NOTICE '✓ status column already exists';
    END IF;
END $$;

-- Update existing records to have 'active' status
UPDATE public.lost_found_reports
SET status = 'active'
WHERE status IS NULL;

-- Verify the column exists
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns
WHERE table_name = 'lost_found_reports'
AND column_name = 'status';

-- Show current status distribution
SELECT 
    status,
    report_type,
    COUNT(*) as count
FROM lost_found_reports
GROUP BY status, report_type
ORDER BY status, report_type;
