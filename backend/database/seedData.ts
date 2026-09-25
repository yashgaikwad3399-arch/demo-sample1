export interface SeedUser {
  id: number;
  name: string;
  roll_number: string | null;
  email: string;
  password_hash: string;
  role: 'STUDENT' | 'ADMIN';
  created_at?: string;
}

export interface SeedSubject {
  id: number;
  code: string;
  name: string;
  description: string;
  duration_minutes: number;
  passing_percentage: number;
  is_active: boolean;
}

export interface SeedQuestion {
  id: number;
  subject_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  explanation: string;
}

export interface SeedAttempt {
  id: number;
  user_id: number;
  subject_id: number;
  total_questions: number;
  correct_answers: number;
  score: number;
  total_marks: number;
  percentage: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT';
  start_time: string;
  end_time: string | null;
}

export interface SeedAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  is_correct: boolean;
  marks_awarded: number;
}

// Passwords generated with bcrypt 10 salt rounds:
// Admin password:   'Admin@123'
// Student password: 'Student@123'
export const SEED_USERS: SeedUser[] = [
  {
    id: 1,
    name: 'System Administrator',
    roll_number: null,
    email: 'admin@examportal.com',
    password_hash: '$2b$10$y7XEAvQl4B6yjqmqJCkXJuPmxRVIkElivD8XALpgUhDTZKN6YZqge',
    role: 'ADMIN',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Rahul Sharma',
    roll_number: 'IT2026-001',
    email: 'rahul.sharma@college.edu',
    password_hash: '$2b$10$LabnvxR.OL9aaMpXOAHWd.Roi6eoxPW99kvhis1UzAU3cER8.MZbi',
    role: 'STUDENT',
    created_at: '2026-09-02T11:30:00Z',
  },
  {
    id: 3,
    name: 'Priya Patel',
    roll_number: 'IT2026-002',
    email: 'priya.patel@college.edu',
    password_hash: '$2b$10$LabnvxR.OL9aaMpXOAHWd.Roi6eoxPW99kvhis1UzAU3cER8.MZbi',
    role: 'STUDENT',
    created_at: '2026-09-02T12:00:00Z',
  },
  {
    id: 4,
    name: 'Amit Verma',
    roll_number: 'IT2026-003',
    email: 'amit.verma@college.edu',
    password_hash: '$2b$10$LabnvxR.OL9aaMpXOAHWd.Roi6eoxPW99kvhis1UzAU3cER8.MZbi',
    role: 'STUDENT',
    created_at: '2026-09-03T09:15:00Z',
  },
];

export const SEED_SUBJECTS: SeedSubject[] = [
  {
    id: 1,
    code: 'JAVA',
    name: 'Core Java Programming',
    description: 'Object-Oriented Programming, Exception Handling, Collections Framework, JVM & Multithreading',
    duration_minutes: 30,
    passing_percentage: 50.0,
    is_active: true,
  },
  {
    id: 2,
    code: 'SQL',
    name: 'Database Management Systems (SQL)',
    description: 'Relational Algebra, DDL/DML, JOINs, Subqueries, Aggregate Functions, Normalization',
    duration_minutes: 30,
    passing_percentage: 50.0,
    is_active: true,
  },
];

export const SEED_QUESTIONS: SeedQuestion[] = [
  // --- Core Java (Subject ID = 1) ---
  {
    id: 1,
    subject_id: 1,
    question_text: 'Which of the following is NOT an Object-Oriented Programming (OOP) principle in Java?',
    option_a: 'Polymorphism',
    option_b: 'Encapsulation',
    option_c: 'Compilation',
    option_d: 'Inheritance',
    correct_option: 'C',
    difficulty: 'EASY',
    marks: 1,
    explanation: 'Compilation is the transformation of code into bytecode, not an OOP concept.',
  },
  {
    id: 2,
    subject_id: 1,
    question_text: 'Why are Java Strings immutable in memory?',
    option_a: 'To prevent garbage collection from executing',
    option_b: 'For security, thread-safety, and String Pool optimization',
    option_c: 'Because the character array inside String is declared static',
    option_d: 'Java does not support heap memory allocation',
    correct_option: 'B',
    difficulty: 'MEDIUM',
    marks: 1,
    explanation: 'Immutability prevents modification during network connections and enables String Pool reuse.',
  },
  {
    id: 3,
    subject_id: 1,
    question_text: 'Which exception is thrown when an application attempts to divide an integer primitive by zero in Java?',
    option_a: 'NullPointerException',
    option_b: 'ArithmeticException',
    option_c: 'NumberFormatException',
    option_d: 'ArrayIndexOutOfBoundsException',
    correct_option: 'B',
    difficulty: 'EASY',
    marks: 1,
    explanation: 'Integer division by zero in Java triggers runtime java.lang.ArithmeticException.',
  },
  {
    id: 4,
    subject_id: 1,
    question_text: 'Which Java Collection interface ensures all contained elements are unique and does not allow duplicates?',
    option_a: 'List',
    option_b: 'Set',
    option_c: 'Queue',
    option_d: 'Vector',
    correct_option: 'B',
    difficulty: 'EASY',
    marks: 1,
    explanation: 'Set represents the mathematical set abstraction with no duplicate items.',
  },
  {
    id: 5,
    subject_id: 1,
    question_text: 'What is the execution behavior of the `finally` block in a try-catch-finally statement in Java?',
    option_a: 'It only executes if an unhandled exception is thrown',
    option_b: 'It only executes if no exception is thrown',
    option_c: 'It executes regardless of whether an exception is caught or uncaught (unless System.exit is called)',
    option_d: 'It prevents garbage collection of method local variables',
    correct_option: 'C',
    difficulty: 'MEDIUM',
    marks: 1,
    explanation: 'The finally block always runs for cleanup (e.g., closing file/socket resources).',
  },

  // --- SQL Databases (Subject ID = 2) ---
  {
    id: 6,
    subject_id: 2,
    question_text: 'Which SQL clause is used to filter group-level records after aggregate functions (COUNT, SUM, AVG) have been applied?',
    option_a: 'WHERE',
    option_b: 'HAVING',
    option_c: 'ORDER BY',
    option_d: 'GROUP BY',
    correct_option: 'B',
    difficulty: 'EASY',
    marks: 1,
    explanation: 'WHERE filters individual row tuples before aggregation; HAVING filters aggregated groups.',
  },
  {
    id: 7,
    subject_id: 2,
    question_text: 'What is the primary architectural difference between `DELETE` and `TRUNCATE` in SQL?',
    option_a: 'DELETE is DDL while TRUNCATE is DML',
    option_b: 'DELETE removes specific rows and can be rolled back; TRUNCATE deallocates data pages as DDL and resets identity counters',
    option_c: 'TRUNCATE can only operate on temporary memory tables',
    option_d: 'DELETE cannot include a WHERE clause',
    correct_option: 'B',
    difficulty: 'MEDIUM',
    marks: 1,
    explanation: 'DELETE is logged DML firing triggers; TRUNCATE is DDL page deallocation.',
  },
  {
    id: 8,
    subject_id: 2,
    question_text: 'Which type of SQL JOIN returns all rows from the left table, and matched rows from the right table, filling with NULL if no match exists?',
    option_a: 'INNER JOIN',
    option_b: 'LEFT (OUTER) JOIN',
    option_c: 'RIGHT (OUTER) JOIN',
    option_d: 'CROSS JOIN',
    correct_option: 'B',
    difficulty: 'EASY',
    marks: 1,
    explanation: 'LEFT JOIN preserves every tuple from the left relation.',
  },
  {
    id: 9,
    subject_id: 2,
    question_text: 'Which constraint uniquely identifies each record in a database table while strictly prohibiting NULL values?',
    option_a: 'FOREIGN KEY',
    option_b: 'UNIQUE',
    option_c: 'PRIMARY KEY',
    option_d: 'CHECK',
    correct_option: 'C',
    difficulty: 'EASY',
    marks: 1,
    explanation: 'PRIMARY KEY enforces both uniqueness and NOT NULL on the column(s).',
  },
  {
    id: 10,
    subject_id: 2,
    question_text: 'Which normal form specifically eliminates transitive functional dependencies between non-key attributes?',
    option_a: 'First Normal Form (1NF)',
    option_b: 'Second Normal Form (2NF)',
    option_c: 'Third Normal Form (3NF)',
    option_d: 'Boyce-Codd Normal Form (BCNF)',
    correct_option: 'C',
    difficulty: 'MEDIUM',
    marks: 1,
    explanation: '3NF removes transitive dependencies where X -> Y and Y -> Z non-key.',
  },
];

export const SEED_ATTEMPTS: SeedAttempt[] = [
  {
    id: 1,
    user_id: 2, // Rahul Sharma
    subject_id: 1, // Core Java
    total_questions: 5,
    correct_answers: 4,
    score: 4.0,
    total_marks: 5.0,
    percentage: 80.0,
    status: 'COMPLETED',
    start_time: '2026-09-05T14:00:00Z',
    end_time: '2026-09-05T14:22:15Z',
  },
  {
    id: 2,
    user_id: 2, // Rahul Sharma
    subject_id: 2, // Database Management & SQL
    total_questions: 5,
    correct_answers: 3,
    score: 3.0,
    total_marks: 5.0,
    percentage: 60.0,
    status: 'COMPLETED',
    start_time: '2026-09-08T10:15:00Z',
    end_time: '2026-09-08T10:35:00Z',
  },
  {
    id: 3,
    user_id: 2, // Rahul Sharma
    subject_id: 1, // Core Java
    total_questions: 5,
    correct_answers: 5,
    score: 5.0,
    total_marks: 5.0,
    percentage: 100.0,
    status: 'COMPLETED',
    start_time: '2026-09-10T09:00:00Z',
    end_time: '2026-09-10T09:18:40Z',
  },
  {
    id: 4,
    user_id: 3, // Priya Patel (Different Student)
    subject_id: 2, // Database Management & SQL
    total_questions: 5,
    correct_answers: 4,
    score: 4.0,
    total_marks: 5.0,
    percentage: 80.0,
    status: 'COMPLETED',
    start_time: '2026-09-09T16:00:00Z',
    end_time: '2026-09-09T16:21:00Z',
  },
];

export const SEED_ANSWERS: SeedAnswer[] = [
  // Attempt 1 (Rahul - Java - 4/5)
  { id: 1, attempt_id: 1, question_id: 1, selected_option: 'C', is_correct: true, marks_awarded: 1.0 },
  { id: 2, attempt_id: 1, question_id: 2, selected_option: 'B', is_correct: true, marks_awarded: 1.0 },
  { id: 3, attempt_id: 1, question_id: 3, selected_option: 'B', is_correct: true, marks_awarded: 1.0 },
  { id: 4, attempt_id: 1, question_id: 4, selected_option: 'B', is_correct: true, marks_awarded: 1.0 },
  { id: 5, attempt_id: 1, question_id: 5, selected_option: 'A', is_correct: false, marks_awarded: 0.0 },

  // Attempt 2 (Rahul - SQL - 3/5)
  { id: 6, attempt_id: 2, question_id: 6, selected_option: 'C', is_correct: true, marks_awarded: 1.0 },
  { id: 7, attempt_id: 2, question_id: 7, selected_option: 'B', is_correct: true, marks_awarded: 1.0 },
  { id: 8, attempt_id: 2, question_id: 8, selected_option: 'B', is_correct: true, marks_awarded: 1.0 },
  { id: 9, attempt_id: 2, question_id: 9, selected_option: 'B', is_correct: false, marks_awarded: 0.0 },
  { id: 10, attempt_id: 2, question_id: 10, selected_option: 'A', is_correct: false, marks_awarded: 0.0 },

  // Attempt 3 (Rahul - Java - 5/5)
  { id: 11, attempt_id: 3, question_id: 1, selected_option: 'C', is_correct: true, marks_awarded: 1.0 },
  { id: 12, attempt_id: 3, question_id: 2, selected_option: 'B', is_correct: true, marks_awarded: 1.0 },
  { id: 13, attempt_id: 3, question_id: 3, selected_option: 'B', is_correct: true, marks_awarded: 1.0 },
  { id: 14, attempt_id: 3, question_id: 4, selected_option: 'B', is_correct: true, marks_awarded: 1.0 },
  { id: 15, attempt_id: 3, question_id: 5, selected_option: 'C', is_correct: true, marks_awarded: 1.0 },

  // Attempt 4 (Priya - SQL - 4/5)
  { id: 16, attempt_id: 4, question_id: 6, selected_option: 'C', is_correct: true, marks_awarded: 1.0 },
  { id: 17, attempt_id: 4, question_id: 7, selected_option: 'B', is_correct: true, marks_awarded: 1.0 },
  { id: 18, attempt_id: 4, question_id: 8, selected_option: 'B', is_correct: true, marks_awarded: 1.0 },
  { id: 19, attempt_id: 4, question_id: 9, selected_option: 'C', is_correct: true, marks_awarded: 1.0 },
  { id: 20, attempt_id: 4, question_id: 10, selected_option: 'B', is_correct: false, marks_awarded: 0.0 },
];
