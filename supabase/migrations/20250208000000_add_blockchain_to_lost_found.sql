-- Add blockchain anchoring columns to lost_found_reports table
-- This migration adds support for blockchain integration in Lost & Found feature

-- Add blockchain-related columns to lost_found_reports table
ALTER TABLE lost_found_reports 
ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS blockchain_anchored BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blockchain_anchored_at TIMESTAMP WITH TIME ZONE;

-- Create index for blockchain lookups
CREATE INDEX IF NOT EXISTS idx_lost_found_reports_blockchain_tx 
ON lost_found_reports(blockchain_tx_hash) 
WHERE blockchain_tx_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lost_found_reports_blockchain_anchored 
ON lost_found_reports(blockchain_anchored) 
WHERE blockchain_anchored = TRUE;

-- Add comment
COMMENT ON COLUMN lost_found_reports.blockchain_tx_hash IS 'Blockchain transaction hash for immutable record';
COMMENT ON COLUMN lost_found_reports.blockchain_anchored IS 'Whether this report has been anchored to blockchain';
COMMENT ON COLUMN lost_found_reports.blockchain_anchored_at IS 'Timestamp when report was anchored to blockchain';

-- Grant permissions
GRANT SELECT ON lost_found_reports TO anon, authenticated;
GRANT UPDATE (blockchain_tx_hash, blockchain_anchored, blockchain_anchored_at) ON lost_found_reports TO authenticated;

