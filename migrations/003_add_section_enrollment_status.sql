-- Add enrollment status to sections
-- Allows professors to close enrollment even if not at capacity

ALTER TABLE sections 
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT TRUE;

-- Update existing sections to be open by default
UPDATE sections SET is_open = TRUE WHERE is_open IS NULL;

-- Add comment
COMMENT ON COLUMN sections.is_open IS 'Whether enrollment is open for this section (can be closed by professor even if not at capacity)';

-- Create index for querying open sections
CREATE INDEX IF NOT EXISTS idx_sections_is_open ON sections(is_open);
