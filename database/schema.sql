-- ==============================================================================
-- SMART EXAMINATION PORTAL - RELATIONAL DATABASE SCHEMA (MySQL)
-- Normalized to Third Normal Form (3NF)
-- Compatible with MySQL 8.0+ / MariaDB 10.4+
-- ==============================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS smart_exam_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smart_exam_portal;

-- Disable foreign key checks during initialization
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables to allow clean re-runs
DROP TABLE IF EXISTS exam_answers;
DROP TABLE IF EXISTS exam_attempts;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- TABLE 1: users
-- Purpose: Stores student candidates and portal administrators with bcrypt passwords
-- Role: 'STUDENT' or 'ADMIN'
-- ==============================================================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(50) NULL UNIQUE COMMENT 'Unique identifier for students; NULL for admins',
    email VARCHAR(150) NOT NULL UNIQUE COMMENT 'Unique email address used for login',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Secure bcrypt hash (never plain text)',
    role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT' COMMENT 'Role-based access control',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- TABLE 2: subjects
-- Purpose: Normalizes examination subject categories (Java, SQL) and settings
-- ==============================================================================
CREATE TABLE subjects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Short code like JAVA or SQL',
    name VARCHAR(100) NOT NULL COMMENT 'Display name of the course/subject',
    description TEXT NULL COMMENT 'Curriculum and syllabus description',
    duration_minutes INT UNSIGNED NOT NULL DEFAULT 30 COMMENT 'Allocated examination time',
    passing_percentage DECIMAL(5,2) NOT NULL DEFAULT 50.00 COMMENT 'Minimum percentage required to pass',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Toggle availability for testing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- TABLE 3: questions
-- Purpose: Question bank containing MCQs with 4 options and server answer keys
-- Note: 'correct_option' is confidential and NEVER sent to the client during exams
-- ==============================================================================
CREATE TABLE questions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_id INT UNSIGNED NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option ENUM('A', 'B', 'C', 'D') NOT NULL COMMENT 'Confidential server answer key',
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    marks INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Marks awarded for correct answer',
    explanation TEXT NULL COMMENT 'Reasoning shown only during post-exam review',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    INDEX idx_questions_subject (subject_id),
    INDEX idx_questions_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- TABLE 4: exam_attempts
-- Purpose: Records candidate examination sessions, timestamps, score & status
-- ==============================================================================
CREATE TABLE exam_attempts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    subject_id INT UNSIGNED NOT NULL,
    total_questions INT UNSIGNED NOT NULL DEFAULT 0,
    correct_answers INT UNSIGNED NOT NULL DEFAULT 0,
    score DECIMAL(6,2) NOT NULL DEFAULT 0.00 COMMENT 'Total marks obtained',
    total_marks DECIMAL(6,2) NOT NULL DEFAULT 0.00 COMMENT 'Maximum achievable marks',
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '(score / total_marks) * 100',
    status ENUM('IN_PROGRESS', 'COMPLETED', 'TIMED_OUT') NOT NULL DEFAULT 'IN_PROGRESS',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    CONSTRAINT fk_attempts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_attempts_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    INDEX idx_attempts_user (user_id),
    INDEX idx_attempts_subject (subject_id),
    INDEX idx_attempts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- TABLE 5: exam_answers
-- Purpose: Itemized student choices for each question in an attempt session
-- ==============================================================================
CREATE TABLE exam_answers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    selected_option ENUM('A', 'B', 'C', 'D') NULL COMMENT 'NULL if student skipped question',
    is_correct BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Computed by backend server evaluation',
    marks_awarded DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_answers_attempt
        FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_answers_question
        FOREIGN KEY (question_id) REFERENCES questions(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    INDEX idx_answers_attempt (attempt_id),
    INDEX idx_answers_question (question_id),
    UNIQUE KEY uq_attempt_question (attempt_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
