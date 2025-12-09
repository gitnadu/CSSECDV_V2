-- Migration: Add login tracking columns to users table
-- Tracks last successful and failed login attempts for security reporting

-- Add columns for tracking login activity
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_success BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_failed_login_at TIMESTAMP;

-- Add comment to explain the columns
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of the last login attempt (successful or failed)';
COMMENT ON COLUMN users.last_login_success IS 'Whether the last login attempt was successful';
COMMENT ON COLUMN users.last_failed_login_at IS 'Timestamp of the last failed login attempt';
