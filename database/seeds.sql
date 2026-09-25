-- ==============================================================================
-- SMART EXAMINATION PORTAL - SAMPLE SEED DATA (MySQL)
-- Passwords are hashed with bcrypt (Cost Factor: 10 rounds)
-- Admin Password:   Admin@123
-- Student Password: Student@123
-- ==============================================================================

USE smart_exam_portal;

-- 1. Insert Initial Subjects
INSERT INTO subjects (id, code, name, description, duration_minutes, passing_percentage, is_active) VALUES
(1, 'JAVA', 'Core Java Programming', 'Object-Oriented Programming, Exception Handling, Collections, JVM & Multithreading', 30, 50.00, TRUE),
(2, 'SQL', 'Database Management Systems (SQL)', 'Relational Algebra, DDL/DML, JOINs, Subqueries, Aggregate Functions, Normalization', 30, 50.00, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Users (Admin & Students)
-- All passwords use bcrypt hash with 10 salt rounds:
-- 'Admin@123'   -> $2b$10$y7XEAvQl4B6yjqmqJCkXJuPmxRVIkElivD8XALpgUhDTZKN6YZqge
-- 'Student@123' -> $2b$10$LabnvxR.OL9aaMpXOAHWd.Roi6eoxPW99kvhis1UzAU3cER8.MZbi
INSERT INTO users (id, name, roll_number, email, password_hash, role) VALUES
(1, 'System Administrator', NULL, 'admin@examportal.com', '$2b$10$y7XEAvQl4B6yjqmqJCkXJuPmxRVIkElivD8XALpgUhDTZKN6YZqge', 'ADMIN'),
(2, 'Rahul Sharma', 'IT2026-001', 'rahul.sharma@college.edu', '$2b$10$LabnvxR.OL9aaMpXOAHWd.Roi6eoxPW99kvhis1UzAU3cER8.MZbi', 'STUDENT'),
(3, 'Priya Patel', 'IT2026-002', 'priya.patel@college.edu', '$2b$10$LabnvxR.OL9aaMpXOAHWd.Roi6eoxPW99kvhis1UzAU3cER8.MZbi', 'STUDENT'),
(4, 'Amit Verma', 'IT2026-003', 'amit.verma@college.edu', '$2b$10$LabnvxR.OL9aaMpXOAHWd.Roi6eoxPW99kvhis1UzAU3cER8.MZbi', 'STUDENT')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insert Java Questions (Subject ID = 1)
INSERT INTO questions (id, subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, marks, explanation) VALUES
(1, 1, 
 'Which of the following is NOT an Object-Oriented Programming (OOP) principle in Java?',
 'Polymorphism',
 'Encapsulation',
 'Compilation',
 'Inheritance',
 'C', 'EASY', 1, 
 'Compilation is the process of translating source code to bytecode, not an OOP pillar.'),

(2, 1, 
 'Why are Java Strings immutable in memory?',
 'To prevent garbage collection from running',
 'For security, thread-safety, and String Pool optimization',
 'Because the char array inside String is declared static',
 'Java does not support dynamic memory allocation',
 'B', 'MEDIUM', 1, 
 'Immutability ensures Strings cannot be altered when passed to network connections, protects HashMaps, and allows memory caching in the String Pool.'),

(3, 1, 
 'Which exception is thrown when an application attempts to divide an integer by zero in Java?',
 'NullPointerException',
 'ArithmeticException',
 'NumberFormatException',
 'ArrayIndexOutOfBoundsException',
 'B', 'EASY', 1, 
 'Division by zero on integer primitives in Java raises a runtime java.lang.ArithmeticException: / by zero.'),

(4, 1, 
 'Which Java Collection interface ensures unique elements and does not permit duplicates?',
 'List',
 'Set',
 'Queue',
 'Vector',
 'B', 'EASY', 1, 
 'Set (and implementations like HashSet and TreeSet) models the mathematical set abstraction with no duplicates.'),

(5, 1, 
 'What happens when the `finally` block is executed in a try-catch-finally statement in Java?',
 'It only executes if an uncaught exception is thrown',
 'It only executes if no exception is thrown',
 'It executes regardless of whether an exception is caught or uncaught (unless System.exit() is called)',
 'It prevents garbage collection of local variables',
 'C', 'MEDIUM', 1, 
 'The finally block always runs for cleanup (e.g. closing file descriptors or database sockets) unless the JVM halts abruptly.');

-- 4. Insert SQL Questions (Subject ID = 2)
INSERT INTO questions (id, subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, marks, explanation) VALUES
(6, 2, 
 'Which SQL clause is used to filter group-level records after aggregate functions (such as COUNT, SUM, AVG) are applied?',
 'WHERE',
 'HAVING',
 'ORDER BY',
 'GROUP BY',
 'B', 'EASY', 1, 
 'WHERE filters individual row records before grouping; HAVING filters aggregated groups.'),

(7, 2, 
 'What is the primary difference between `DELETE` and `TRUNCATE` in SQL?',
 'DELETE is DDL while TRUNCATE is DML',
 'DELETE removes specific rows and can be rolled back; TRUNCATE deallocates data pages as DDL and resets identity counters',
 'TRUNCATE only works on temporary tables',
 'DELETE cannot use a WHERE clause',
 'B', 'MEDIUM', 1, 
 'DELETE is a logged DML operation that fires row triggers; TRUNCATE is a minimally logged DDL operation that resets table storage.'),

(8, 2, 
 'Which type of SQL JOIN returns all records from the left table, and matching records from the right table, filling with NULL if no match exists?',
 'INNER JOIN',
 'LEFT (OUTER) JOIN',
 'RIGHT (OUTER) JOIN',
 'CROSS JOIN',
 'B', 'EASY', 1, 
 'LEFT JOIN preserves all rows from the primary left table regardless of whether the join condition finds a match on the right.'),

(9, 2, 
 'Which constraint uniquely identifies each record in a database table while strictly prohibiting NULL values?',
 'FOREIGN KEY',
 'UNIQUE',
 'PRIMARY KEY',
 'CHECK',
 'C', 'EASY', 1, 
 'A PRIMARY KEY enforces both uniqueness and NOT NULL on designated column(s). UNIQUE constraints allow NULL values depending on the SQL dialect.'),

(10, 2, 
 'Which of the following normal forms eliminates transitive dependencies between non-key attributes?',
 'First Normal Form (1NF)',
 'Second Normal Form (2NF)',
 'Third Normal Form (3NF)',
 'Boyce-Codd Normal Form (BCNF)',
 'C', 'MEDIUM', 1, 
 '3NF requires that the table is in 2NF and that no non-prime attribute is transitively dependent on the primary key.');

-- 5. Insert Sample Exam Attempt (Rahul Sharma took Core Java Exam)
INSERT INTO exam_attempts (id, user_id, subject_id, total_questions, correct_answers, score, total_marks, percentage, status, start_time, end_time) VALUES
(1, 2, 1, 5, 4, 4.00, 5.00, 80.00, 'COMPLETED', NOW() - INTERVAL 45 MINUTE, NOW() - INTERVAL 20 MINUTE)
ON DUPLICATE KEY UPDATE score=VALUES(score);

-- 6. Insert Sample Exam Answers for Attempt 1
INSERT INTO exam_answers (id, attempt_id, question_id, selected_option, is_correct, marks_awarded) VALUES
(1, 1, 1, 'C', TRUE, 1.00),
(2, 1, 2, 'B', TRUE, 1.00),
(3, 1, 3, 'B', TRUE, 1.00),
(4, 1, 4, 'B', TRUE, 1.00),
(5, 1, 5, 'A', FALSE, 0.00)
ON DUPLICATE KEY UPDATE is_correct=VALUES(is_correct);
