-- Step 3: Add 'rejected' status for admin-rejected listings
-- Run this AFTER the approved enum has been added and committed

ALTER TYPE listing_status ADD VALUE 'rejected';

-- Wait for this to complete, then run the next script
