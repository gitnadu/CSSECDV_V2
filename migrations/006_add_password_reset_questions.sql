-- Add password reset questions and answers for account recovery
-- Uses questions with sufficiently random answers to prevent guessing attacks

CREATE TABLE IF NOT EXISTS password_reset_questions (
  id SERIAL PRIMARY KEY,
  question_text VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_security_answers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES password_reset_questions(id) ON DELETE CASCADE,
  answer_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_question UNIQUE(user_id, question_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_security_answers_user_id ON user_security_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_answers_question_id ON user_security_answers(question_id);

-- Insert security questions with sufficiently random answers
-- These questions are designed to have unique, personal answers that are hard to guess
INSERT INTO password_reset_questions (question_text) VALUES
('What is the full name of your first childhood friend?'),
('What was the name and breed of your first pet?'),
('What is the name of the hospital where you were born?'),
('What was the make and model of your first car?'),
('What is your mother''s full maiden name?'),
('In what city and country did your parents meet?'),
('What was the full name of your favorite teacher in elementary school?'),
('What is the street address of your childhood home?'),
('What was the name of the company where you had your first job?'),
('What is the full name of your oldest cousin?')
ON CONFLICT (question_text) DO NOTHING;

-- Add comments
COMMENT ON TABLE password_reset_questions IS 'Security questions for password reset with sufficiently random answers';
COMMENT ON TABLE user_security_answers IS 'Hashed security answers for user password recovery';
COMMENT ON COLUMN user_security_answers.answer_hash IS 'Bcrypt hashed security answer (case-insensitive, trimmed before hashing)';
