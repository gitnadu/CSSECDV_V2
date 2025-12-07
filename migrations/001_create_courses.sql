-- Course Service: Courses Table Migration
-- Creates the ABSTRACT courses table (no capacity, no professor)

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for code lookups
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);

-- Add comments
COMMENT ON TABLE courses IS 'Abstract course definitions (e.g., CCPROG1, GEMATMW)';
COMMENT ON COLUMN courses.code IS 'Unique course code';
COMMENT ON COLUMN courses.name IS 'Course name/title';
COMMENT ON COLUMN courses.description IS 'Course description';
