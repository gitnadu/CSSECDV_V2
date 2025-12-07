-- Grade Service: Enrollments Table Migration
-- Creates enrollments table linking students to SECTIONS (not courses)
-- Implements: One-record-per-course rule via application logic

CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  section_id INTEGER NOT NULL,
  grade DECIMAL(2,1) CHECK (grade IS NULL OR grade IN (0.0, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0)),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP,
  CONSTRAINT unique_student_section UNIQUE(student_id, section_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_section_id ON enrollments(section_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_grade ON enrollments(grade);

-- Trigger to set graded_at when grade changes from NULL to a value
CREATE OR REPLACE FUNCTION set_graded_at()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.grade IS NULL AND NEW.grade IS NOT NULL THEN
        NEW.graded_at = CURRENT_TIMESTAMP;
    ELSIF NEW.grade IS NULL THEN
        NEW.graded_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_graded_at_trigger ON enrollments;

CREATE TRIGGER set_graded_at_trigger
BEFORE UPDATE ON enrollments
FOR EACH ROW EXECUTE FUNCTION set_graded_at();

-- Add comments
COMMENT ON TABLE enrollments IS 'Student enrollments in sections';
COMMENT ON COLUMN enrollments.student_id IS 'Reference to users.id (student)';
COMMENT ON COLUMN enrollments.section_id IS 'Reference to sections.id';
COMMENT ON COLUMN enrollments.grade IS 'Grade on 4.0 scale (NULL=not graded, 0.0-4.0)';
COMMENT ON COLUMN enrollments.enrolled_at IS 'When student enrolled';
COMMENT ON COLUMN enrollments.graded_at IS 'When grade was assigned';
