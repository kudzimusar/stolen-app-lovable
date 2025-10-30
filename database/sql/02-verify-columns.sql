-- STEP 2: VERIFY COLUMNS EXIST
-- Run this to verify all columns were created successfully

-- Check if all required columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at') 
        THEN '✅ Required' 
        ELSE '❌ Missing' 
    END as status
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at')
ORDER BY column_name;

-- Count how many columns were added
SELECT 
    COUNT(*) as columns_added,
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ All columns added successfully'
        ELSE '❌ Some columns missing'
    END as status
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at');



