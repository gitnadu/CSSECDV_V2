-- Seed Data Script for Enrollment System
-- Generated on: 2025-12-07
-- This script populates the database with initial test data
-- Run this after all migrations have been executed
--
-- Schema:
-- - 20 courses (abstract definitions)
-- - 20 sections (multiple sections for first 8 courses, 5 sections per faculty)
-- - 10 students + 4 faculty (each faculty teaches 5 non-conflicting sections)
-- - CCPROG1-A: Students 1-5 (FULL 5/5), CCPROG1-B: Students 6-8 (3/5)
-- - Each student has 2 graded historical enrollments
-- - Faculty schedules: MWF or TTh patterns with no time conflicts

-- NOTE: All users have the same password: pass123

-- Clear existing data (in order to respect foreign key constraints)
-- Grade service database
TRUNCATE TABLE enrollments CASCADE;

-- Auth service database (run separately if different DB)
-- TRUNCATE TABLE refresh_tokens CASCADE;
-- TRUNCATE TABLE users CASCADE;

-- Course service database
TRUNCATE TABLE sections CASCADE;
TRUNCATE TABLE courses CASCADE;

-- Reset sequences
ALTER SEQUENCE courses_id_seq RESTART WITH 1;
ALTER SEQUENCE sections_id_seq RESTART WITH 1;
ALTER SEQUENCE enrollments_id_seq RESTART WITH 1;

-- =====================================================
-- USERS
-- =====================================================
TRUNCATE TABLE refresh_tokens CASCADE;
TRUNCATE TABLE users CASCADE;
ALTER SEQUENCE users_id_seq RESTART WITH 1;

INSERT INTO users (id, username, password_hash, role, first_name, last_name, email) VALUES
(1, 'student1', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'student', 'Alice', 'Anderson', 'alice.anderson@university.edu'),
(2, 'student2', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'student', 'Benjamin', 'Brooks', 'benjamin.brooks@university.edu'),
(3, 'student3', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'student', 'Catherine', 'Chen', 'catherine.chen@university.edu'),
(4, 'student4', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'student', 'Daniel', 'Davis', 'daniel.davis@university.edu'),
(5, 'student5', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'student', 'Emma', 'Evans', 'emma.evans@university.edu'),
(6, 'student6', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'student', 'Frank', 'Foster', 'frank.foster@university.edu'),
(7, 'student7', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'student', 'Grace', 'Garcia', 'grace.garcia@university.edu'),
(8, 'student8', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'student', 'Henry', 'Harris', 'henry.harris@university.edu'),
(9, 'student9', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'student', 'Isabella', 'Ivanov', 'isabella.ivanov@university.edu'),
(10, 'student10', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'student', 'James', 'Jackson', 'james.jackson@university.edu'),
(11, 'faculty1', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'faculty', 'Robert', 'Smith', 'robert.smith@university.edu'),
(12, 'faculty2', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'faculty', 'Emily', 'Johnson', 'emily.johnson@university.edu'),
(13, 'faculty3', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'faculty', 'Michael', 'Williams', 'michael.williams@university.edu'),
(14, 'faculty4', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'faculty', 'Sarah', 'Martinez', 'sarah.martinez@university.edu'),
(15, 'admin', '$2a$10$pp0T5EeelJeHt6d43HSIfewPlJK9zq48QE4VjTp.5.N5kHhWD0oru', 'admin', 'System', 'Administrator', 'admin@university.edu');

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Professor IDs for sections:
-- faculty1 (Robert Smith) = 11
-- faculty2 (Emily Johnson) = 12
-- faculty3 (Michael Williams) = 13
-- faculty4 (Sarah Martinez) = 14


-- =====================================================
-- COURSES (20 courses - abstract definitions)
-- =====================================================
INSERT INTO courses (id, code, name, description) VALUES
(1, 'CCPROG1', 'Logic Formulation and Introductory Programming', 'Introduction to programming logic and Python basics'),
(2, 'CCPROG2', 'Programming with Structured Data Types', 'Arrays, structs, and file handling'),
(3, 'CCPROG3', 'Object-Oriented Programming', 'OOP concepts with Java'),
(4, 'CCDSTRU', 'Discrete Structures', 'Mathematical foundations for computing'),
(5, 'CCDSALG', 'Data Structures and Algorithms', 'Common data structures and algorithm design'),
(6, 'CSOPESY', 'Operating Systems', 'OS concepts and system programming'),
(7, 'CSARCH1', 'Introduction to Computer Organization', 'Computer architecture basics'),
(8, 'CSARCH2', 'Computer Organization and Architecture', 'Advanced architecture concepts'),
(9, 'CSNETWK', 'Introduction to Computer Networks', 'Networking fundamentals'),
(10, 'CSSWENG', 'Software Engineering', 'Software development methodologies'),
(11, 'CSINTSY', 'Intelligent Systems', 'Introduction to AI and machine learning'),
(12, 'CSMODEL', 'Modeling and Simulation', 'Simulation techniques and modeling'),
(13, 'CSWEB01', 'Web Application Development', 'Frontend and backend web development'),
(14, 'CSMOBIL', 'Mobile Application Development', 'iOS and Android development'),
(15, 'CSSECDV', 'Secure Software Development', 'Security in software engineering'),
(16, 'CSTHEOF', 'Theory of Computation', 'Automata theory and formal languages'),
(17, 'CSGRAPH', 'Computer Graphics', '2D and 3D graphics programming'),
(18, 'CSBIGDT', 'Big Data Analytics', 'Large-scale data processing'),
(19, 'CSCLOUD', 'Cloud Computing', 'Cloud services and deployment'),
(20, 'CSBLOCK', 'Blockchain Technology', 'Distributed ledger technology');

SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses));


-- =====================================================
-- SECTIONS (20 sections - 5 sections per professor, no schedule conflicts)
-- Schedule blocks:
--   Morning: 7:30-9:00, 9:00-10:30, 10:30-12:00
--   Afternoon: 1:00-2:30, 2:30-4:00, 4:00-5:30
--   Evening: 6:00-7:30, 7:30-9:00
-- Each professor teaches 5 sections with non-overlapping times
-- =====================================================
INSERT INTO sections (id, course_id, section_name, professor_id, capacity, enrolled_count, schedule) VALUES
-- Robert Smith (faculty1, ID 11) - MWF schedule
(1, 1, 'A', 11, 5, 0, 'MWF 7:30-9:00'),
(2, 2, 'A', 11, 5, 0, 'MWF 9:00-10:30'),
(3, 3, 'A', 11, 5, 0, 'MWF 10:30-12:00'),
(4, 4, 'A', 11, 5, 0, 'MWF 1:00-2:30'),
(5, 5, 'A', 11, 5, 0, 'MWF 2:30-4:00'),

-- Emily Johnson (faculty2, ID 12) - TTh schedule
(6, 1, 'B', 12, 5, 0, 'TTh 7:30-9:00'),
(7, 2, 'B', 12, 5, 0, 'TTh 9:00-10:30'),
(8, 3, 'B', 12, 5, 0, 'TTh 10:30-12:00'),
(9, 4, 'B', 12, 5, 0, 'TTh 1:00-2:30'),
(10, 5, 'B', 12, 5, 0, 'TTh 2:30-4:00'),

-- Michael Williams (faculty3, ID 13) - MWF afternoon/evening
(11, 1, 'C', 13, 5, 0, 'MWF 4:00-5:30'),
(12, 2, 'C', 13, 5, 0, 'MWF 6:00-7:30'),
(13, 6, 'A', 13, 5, 0, 'MWF 7:30-9:00'),
(14, 7, 'A', 13, 5, 0, 'MWF 9:00-10:30'),
(15, 8, 'A', 13, 5, 0, 'MWF 10:30-12:00'),

-- Sarah Martinez (faculty4, ID 14) - TTh afternoon/evening
(16, 3, 'C', 14, 5, 0, 'TTh 4:00-5:30'),
(17, 4, 'C', 14, 5, 0, 'TTh 6:00-7:30'),
(18, 6, 'B', 14, 5, 0, 'TTh 7:30-9:00'),
(19, 7, 'B', 14, 5, 0, 'TTh 9:00-10:30'),
(20, 8, 'B', 14, 5, 0, 'TTh 10:30-12:00');

SELECT setval('sections_id_seq', (SELECT MAX(id) FROM sections));


-- =====================================================
-- ENROLLMENTS
-- Active enrollments: CCPROG1-A (section 1) = FULL (5/5), CCPROG1-B (section 6) = 3/5
-- Historical graded enrollments in CCPROG2, CCPROG3, CCDSTRU, and CCDSALG sections
-- =====================================================

INSERT INTO enrollments (id, student_id, section_id, grade, enrolled_at) VALUES
-- Active enrollments in CCPROG1
(1, 1, 1, NULL, NOW() - INTERVAL '11 days'),
(2, 2, 1, NULL, NOW() - INTERVAL '12 days'),
(3, 3, 1, NULL, NOW() - INTERVAL '13 days'),
(4, 4, 1, NULL, NOW() - INTERVAL '14 days'),
(5, 5, 1, NULL, NOW() - INTERVAL '15 days'),
(6, 6, 6, NULL, NOW() - INTERVAL '11 days'),
(7, 7, 6, NULL, NOW() - INTERVAL '12 days'),
(8, 8, 6, NULL, NOW() - INTERVAL '13 days'),

-- Historical graded enrollments (completed courses)
-- Student 1: CCPROG2-A (3.5), CCPROG3-A (1.5)
(9, 1, 2, 3.5, NOW() - INTERVAL '67 days'),
(10, 1, 3, 1.5, NOW() - INTERVAL '81 days'),

-- Student 2: CCPROG2-B (2.5), CCPROG3-B (2.0)
(11, 2, 7, 2.5, NOW() - INTERVAL '81 days'),
(12, 2, 8, 2.0, NOW() - INTERVAL '70 days'),

-- Student 3: CCPROG2-A (2.0), CCDSTRU-A (1.0)
(13, 3, 2, 2.0, NOW() - INTERVAL '60 days'),
(14, 3, 4, 1.0, NOW() - INTERVAL '68 days'),

-- Student 4: CCDSTRU-B (1.0), CCDSALG-A (3.5)
(15, 4, 9, 1.0, NOW() - INTERVAL '68 days'),
(16, 4, 5, 3.5, NOW() - INTERVAL '70 days'),

-- Student 5: CCPROG2-B (2.0), CCPROG3-A (1.5)
(17, 5, 7, 2.0, NOW() - INTERVAL '65 days'),
(18, 5, 3, 1.5, NOW() - INTERVAL '65 days'),

-- Student 6: CCDSTRU-B (4.0), CCDSALG-B (3.0)
(19, 6, 9, 4.0, NOW() - INTERVAL '71 days'),
(20, 6, 10, 3.0, NOW() - INTERVAL '77 days'),

-- Student 7: CCPROG2-A (3.0), CCDSALG-A (3.0)
(21, 7, 2, 3.0, NOW() - INTERVAL '73 days'),
(22, 7, 5, 3.0, NOW() - INTERVAL '63 days'),

-- Student 8: CCPROG3-B (4.0), CCDSTRU-A (3.5)
(23, 8, 8, 4.0, NOW() - INTERVAL '80 days'),
(24, 8, 4, 3.5, NOW() - INTERVAL '62 days'),

-- Student 9: CCPROG2-B (2.0), CCPROG3-A (3.0)
(25, 9, 7, 2.0, NOW() - INTERVAL '66 days'),
(26, 9, 3, 3.0, NOW() - INTERVAL '84 days'),

-- Student 10: CCDSTRU-B (1.0), CCDSALG-B (4.0)
(27, 10, 9, 1.0, NOW() - INTERVAL '74 days'),
(28, 10, 10, 4.0, NOW() - INTERVAL '89 days');

SELECT setval('enrollments_id_seq', (SELECT MAX(id) FROM enrollments));

-- Update enrolled_count for all sections
UPDATE sections s
SET enrolled_count = (
  SELECT COUNT(*) FROM enrollments e WHERE e.section_id = s.id
);


-- Verify data
DO $$
DECLARE
  course_count INTEGER;
  section_count INTEGER;
  enrollment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO course_count FROM courses;
  SELECT COUNT(*) INTO section_count FROM sections;
  SELECT COUNT(*) INTO enrollment_count FROM enrollments;

  RAISE NOTICE '✅ Seed data inserted successfully:';
  RAISE NOTICE '   - Courses: %', course_count;
  RAISE NOTICE '   - Sections: %', section_count;
  RAISE NOTICE '   - Enrollments: %', enrollment_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Test Credentials (all passwords: pass123):';
  RAISE NOTICE '   Students: student1 through student10';
  RAISE NOTICE '   Faculty: faculty1, faculty2';
END $$;

-- Display summary
SELECT 'Courses' as table_name, COUNT(*) as count FROM courses
UNION ALL
SELECT 'Sections', COUNT(*) FROM sections
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM enrollments;

-- Show section enrollment counts
SELECT
  c.code || '-' || s.section_name as section,
  s.enrolled_count || '/' || s.capacity as enrollment
FROM sections s
JOIN courses c ON s.course_id = c.id
ORDER BY c.code, s.section_name;