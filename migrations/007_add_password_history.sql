-- Migration: Add password history table to prevent password re-use
-- This table stores hashed versions of previous passwords for each user

CREATE TABLE IF NOT EXISTS password_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);

-- Create index for created_at to help with cleanup of old history
CREATE INDEX IF NOT EXISTS idx_password_history_created_at ON password_history(created_at);

-- Add current passwords to history for existing users
INSERT INTO password_history (user_id, password_hash, created_at)
SELECT id, password_hash, COALESCE(password_changed_at, created_at) 
FROM users 
WHERE password_hash IS NOT NULL;
