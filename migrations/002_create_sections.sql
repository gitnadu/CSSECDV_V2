-- Course Service: Sections Table Migration
-- Creates the CONCRETE sections table (has capacity, professor, schedule)

CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  section_name CHAR(1) NOT NULL,
  professor_id INTEGER,
  capacity INTEGER DEFAULT 5,
  enrolled_count INTEGER DEFAULT 0,
  schedule VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_course_section UNIQUE(course_id, section_name),
  CONSTRAINT valid_section_name CHECK (section_name >= 'A' AND section_name <= 'Z'),
  CONSTRAINT valid_capacity CHECK (capacity > 0),
  CONSTRAINT valid_enrolled_count CHECK (enrolled_count >= 0 AND enrolled_count <= capacity)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sections_course_id ON sections(course_id);
CREATE INDEX IF NOT EXISTS idx_sections_professor_id ON sections(professor_id);

-- Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add comments
COMMENT ON TABLE sections IS 'Concrete course sections (e.g., CCPROG1-A, CCPROG1-B)';
COMMENT ON COLUMN sections.section_name IS 'Section letter (A-Z)';
COMMENT ON COLUMN sections.professor_id IS 'Professor assigned to this section';
COMMENT ON COLUMN sections.capacity IS 'Maximum students (default 5)';
COMMENT ON COLUMN sections.enrolled_count IS 'Current enrollment count';
COMMENT ON COLUMN sections.schedule IS 'Schedule (e.g., MWF 9:00-10:00 AM)';
