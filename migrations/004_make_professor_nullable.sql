-- Migration: Make professor_id nullable in sections table
-- Allows creating sections without assigning a professor initially

ALTER TABLE sections
ALTER COLUMN professor_id DROP NOT NULL;
