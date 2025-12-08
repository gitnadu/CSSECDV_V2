-- Migration: Add admin role to users table
-- This migration updates the CHECK constraint to include 'admin' role
-- Run this if you already have an existing database with the old constraint

-- 1. Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Add the new constraint with admin role included
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'faculty', 'admin'));

-- 3. Optionally, add an admin user if it doesn't exist
-- Password is 'pass123' (same as other test users)
INSERT INTO users (username, password_hash, role, first_name, last_name, email) 
VALUES ('admin', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'admin', 'System', 'Administrator', 'admin@university.edu')
ON CONFLICT (username) DO NOTHING;

COMMENT ON CONSTRAINT users_role_check ON users IS 'Valid roles: student, faculty, admin';
