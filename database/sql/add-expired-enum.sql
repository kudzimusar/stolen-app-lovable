-- Step 4: Add 'expired' status for expired listings
-- Run this AFTER the rejected enum has been added and committed

ALTER TYPE listing_status ADD VALUE 'expired';

-- This completes the enum setup
