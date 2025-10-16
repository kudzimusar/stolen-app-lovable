-- Add enum values one by one to avoid transaction conflicts
-- PostgreSQL requires each enum value to be committed separately

-- Step 1: Add 'pending' status for listings awaiting admin review
ALTER TYPE listing_status ADD VALUE 'pending';

-- Wait for this to complete, then run the next script
