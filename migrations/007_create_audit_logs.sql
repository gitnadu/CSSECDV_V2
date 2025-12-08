-- Audit Logging Table Migration
-- Tracks validation failures, authentication attempts, and access control failures

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'VALIDATION_FAILURE',    -- Invalid input (out of range, incorrect chars, etc.)
    'AUTH_SUCCESS',          -- Successful login
    'AUTH_FAILURE',          -- Failed login attempt
    'AUTH_LOCKOUT',          -- Account lockout due to failed attempts
    'ACCESS_DENIED',         -- Access control failure (unauthorized resource access)
    'PASSWORD_CHANGE',       -- Successful password change
    'ACCOUNT_CREATED',       -- New account registration
    'ROLE_CHANGE',           -- User role modification
    'DATA_MODIFICATION'      -- Data create/update/delete actions
  )),
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  resource VARCHAR(255),           -- API endpoint or resource accessed
  action VARCHAR(50),              -- GET, POST, PUT, DELETE, etc.
  details JSONB,                   -- Flexible details object (reason, validation errors, etc.)
  status VARCHAR(50),              -- SUCCESS, FAILURE, BLOCKED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_username ON audit_logs(username);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Comment
COMMENT ON TABLE audit_logs IS 'Audit trail for security events: validation failures, auth attempts, and access control violations';
COMMENT ON COLUMN audit_logs.details IS 'JSONB object with event-specific details (e.g., validation errors, lockout count, denied reason)';
