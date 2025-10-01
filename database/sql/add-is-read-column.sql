-- Add is_read column to user_notifications table
-- Run this in Supabase SQL Editor

-- 1. Add the is_read column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' AND column_name = 'is_read'
    ) THEN
        ALTER TABLE public.user_notifications 
        ADD COLUMN is_read BOOLEAN DEFAULT false;
        
        RAISE NOTICE '✅ Added is_read column to user_notifications table';
    ELSE
        RAISE NOTICE 'ℹ️ is_read column already exists';
    END IF;
END $$;

-- 2. Set all existing notifications as unread
UPDATE public.user_notifications
SET is_read = false
WHERE is_read IS NULL;

-- 3. Add related_id column for navigation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' AND column_name = 'related_id'
    ) THEN
        ALTER TABLE public.user_notifications 
        ADD COLUMN related_id UUID;
        
        RAISE NOTICE '✅ Added related_id column to user_notifications table';
    ELSE
        RAISE NOTICE 'ℹ️ related_id column already exists';
    END IF;
END $$;

-- 4. Add metadata column for additional data
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.user_notifications 
        ADD COLUMN metadata JSONB DEFAULT '{}';
        
        RAISE NOTICE '✅ Added metadata column to user_notifications table';
    ELSE
        RAISE NOTICE 'ℹ️ metadata column already exists';
    END IF;
END $$;

-- 5. Add title and message columns for easier access
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' AND column_name = 'title'
    ) THEN
        ALTER TABLE public.user_notifications 
        ADD COLUMN title TEXT;
        
        RAISE NOTICE '✅ Added title column to user_notifications table';
    ELSE
        RAISE NOTICE 'ℹ️ title column already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' AND column_name = 'message'
    ) THEN
        ALTER TABLE public.user_notifications 
        ADD COLUMN message TEXT;
        
        RAISE NOTICE '✅ Added message column to user_notifications table';
    ELSE
        RAISE NOTICE 'ℹ️ message column already exists';
    END IF;
END $$;

-- 6. Migrate existing data from preferences to new columns
UPDATE public.user_notifications
SET 
    title = preferences->>'title',
    message = preferences->>'message',
    related_id = (preferences->>'report_id')::uuid
WHERE preferences IS NOT NULL;

-- 7. Create index for faster is_read queries
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read 
ON public.user_notifications(user_id, is_read);

-- 8. Create index for faster queries by related_id
CREATE INDEX IF NOT EXISTS idx_user_notifications_related_id 
ON public.user_notifications(related_id);

-- 9. Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_notifications'
AND column_name IN ('is_read', 'related_id', 'metadata', 'title', 'message')
ORDER BY column_name;

-- 10. Show sample data
SELECT 
    id,
    user_id,
    notification_type,
    title,
    message,
    is_read,
    related_id,
    created_at
FROM public.user_notifications
ORDER BY created_at DESC
LIMIT 5;
