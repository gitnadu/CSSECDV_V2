-- Add password_changed_at column to track when password was last changed
-- This is used to enforce the policy that passwords must be at least one day old before changing

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing users to have password_changed_at set to their created_at date
UPDATE users SET password_changed_at = created_at WHERE password_changed_at IS NULL;

-- Add comment
COMMENT ON COLUMN users.password_changed_at IS 'Timestamp of when the password was last changed. Used to enforce minimum password age policy.';
