-- Step 2: Add 'approved' status for admin-approved listings
-- Run this AFTER the pending enum has been added and committed

ALTER TYPE listing_status ADD VALUE 'approved';

-- Wait for this to complete, then run the next script
