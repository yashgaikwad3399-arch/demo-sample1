export interface ColumnDefinition {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  foreignReference?: string;
  isUnique?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
  description: string;
}

export interface TableDefinition {
  name: string;
  purpose: string;
  primaryKey: string;
  foreignKeys: string[];
  relationships: string[];
  columns: ColumnDefinition[];
}

export const SCHEMA_TABLES: TableDefinition[] = [
  {
    name: 'users',
    purpose: 'Stores authentication credentials and identities for Students and Administrators. Passwords are saved as bcrypt hashes.',
    primaryKey: 'id',
    foreignKeys: [],
    relationships: [
      '1:N with exam_attempts (One user can attempt multiple exams)'
    ],
    columns: [
      { name: 'id', type: 'INT UNSIGNED', isPrimary: true, isNullable: false, description: 'Auto-incrementing surrogate primary key' },
      { name: 'name', type: 'VARCHAR(100)', isNullable: false, description: 'Full legal name of student or administrator' },
      { name: 'roll_number', type: 'VARCHAR(50)', isUnique: true, isNullable: true, description: 'Unique candidate roll number (NULL for Admins)' },
      { name: 'email', type: 'VARCHAR(150)', isUnique: true, isNullable: false, description: 'Unique email address used for login and notifications' },
      { name: 'password_hash', type: 'VARCHAR(255)', isNullable: false, description: '60-character bcrypt salted password hash (never plaintext)' },
      { name: 'role', type: "ENUM('STUDENT','ADMIN')", isNullable: false, defaultValue: "'STUDENT'", description: 'Role for Role-Based Access Control (RBAC)' },
      { name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP', description: 'Record creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP ON UPDATE', description: 'Last profile update timestamp' },
    ]
  },
  {
    name: 'subjects',
    purpose: 'Maintains distinct examination tracks (Java and SQL) with allocated durations and passing criteria.',
    primaryKey: 'id',
    foreignKeys: [],
    relationships: [
      '1:N with questions (One subject contains many questions)',
      '1:N with exam_attempts (One subject has multiple student attempts)'
    ],
    columns: [
      { name: 'id', type: 'INT UNSIGNED', isPrimary: true, isNullable: false, description: 'Subject ID' },
      { name: 'code', type: 'VARCHAR(20)', isUnique: true, isNullable: false, description: 'Subject code identifier (JAVA, SQL)' },
      { name: 'name', type: 'VARCHAR(100)', isNullable: false, description: 'Display name of curriculum track' },
      { name: 'description', type: 'TEXT', isNullable: true, description: 'Syllabus and topics covered' },
      { name: 'duration_minutes', type: 'INT UNSIGNED', defaultValue: '30', description: 'Exam duration limit in minutes' },
      { name: 'passing_percentage', type: 'DECIMAL(5,2)', defaultValue: '50.00', description: 'Minimum pass threshold percentage' },
      { name: 'is_active', type: 'BOOLEAN', defaultValue: 'TRUE', description: 'Whether students can take exams in this subject' },
      { name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP', description: 'Creation timestamp' },
    ]
  },
  {
    name: 'questions',
    purpose: 'Question bank containing MCQs with 4 options and server answer keys. correct_option is confidential.',
    primaryKey: 'id',
    foreignKeys: ['subject_id -> subjects(id)'],
    relationships: [
      'N:1 with subjects (Belongs to a specific subject)',
      '1:N with exam_answers (Answered across multiple exam sessions)'
    ],
    columns: [
      { name: 'id', type: 'INT UNSIGNED', isPrimary: true, isNullable: false, description: 'Unique question identifier' },
      { name: 'subject_id', type: 'INT UNSIGNED', isForeign: true, foreignReference: 'subjects(id)', isNullable: false, description: 'References subject category' },
      { name: 'question_text', type: 'TEXT', isNullable: false, description: 'Question prompt stem' },
      { name: 'option_a', type: 'TEXT', isNullable: false, description: 'Choice A text' },
      { name: 'option_b', type: 'TEXT', isNullable: false, description: 'Choice B text' },
      { name: 'option_c', type: 'TEXT', isNullable: false, description: 'Choice C text' },
      { name: 'option_d', type: 'TEXT', isNullable: false, description: 'Choice D text' },
      { name: 'correct_option', type: "ENUM('A','B','C','D')", isNullable: false, description: 'Confidential correct answer key (never sent to client before submission)' },
      { name: 'difficulty', type: "ENUM('EASY','MEDIUM','HARD')", defaultValue: "'MEDIUM'", description: 'Question complexity rating' },
      { name: 'marks', type: 'INT UNSIGNED', defaultValue: '1', description: 'Score marks awarded for correct answer' },
      { name: 'explanation', type: 'TEXT', isNullable: true, description: 'Post-exam educational explanation' },
      { name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP', description: 'Creation timestamp' },
    ]
  },
  {
    name: 'exam_attempts',
    purpose: 'Records a candidate examination session, timer start/end, total score, percentage, and completion status.',
    primaryKey: 'id',
    foreignKeys: ['user_id -> users(id)', 'subject_id -> subjects(id)'],
    relationships: [
      'N:1 with users (Initiated by a student candidate)',
      'N:1 with subjects (Belongs to a specific subject)',
      '1:N with exam_answers (Comprises individual question answers)'
    ],
    columns: [
      { name: 'id', type: 'INT UNSIGNED', isPrimary: true, isNullable: false, description: 'Unique attempt session identifier' },
      { name: 'user_id', type: 'INT UNSIGNED', isForeign: true, foreignReference: 'users(id)', isNullable: false, description: 'Foreign key to users table' },
      { name: 'subject_id', type: 'INT UNSIGNED', isForeign: true, foreignReference: 'subjects(id)', isNullable: false, description: 'Foreign key to subjects table' },
      { name: 'total_questions', type: 'INT UNSIGNED', isNullable: false, description: 'Total questions presented in this exam' },
      { name: 'correct_answers', type: 'INT UNSIGNED', defaultValue: '0', description: 'Count of correct answers computed by backend' },
      { name: 'score', type: 'DECIMAL(6,2)', defaultValue: '0.00', description: 'Total marks obtained' },
      { name: 'total_marks', type: 'DECIMAL(6,2)', defaultValue: '0.00', description: 'Maximum possible marks' },
      { name: 'percentage', type: 'DECIMAL(5,2)', defaultValue: '0.00', description: 'Calculated percentage: (score / total_marks) * 100' },
      { name: 'status', type: "ENUM('IN_PROGRESS','COMPLETED','TIMED_OUT')", defaultValue: "'IN_PROGRESS'", description: 'Lifecycle state of attempt' },
      { name: 'start_time', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP', description: 'Time student started the exam' },
      { name: 'end_time', type: 'TIMESTAMP', isNullable: true, description: 'Time student submitted or timed out' },
    ]
  },
  {
    name: 'exam_answers',
    purpose: 'Itemized audit log of each question answered by a candidate in an attempt session.',
    primaryKey: 'id',
    foreignKeys: ['attempt_id -> exam_attempts(id)', 'question_id -> questions(id)'],
    relationships: [
      'N:1 with exam_attempts (Belongs to a parent attempt)',
      'N:1 with questions (Refers to the question answered)'
    ],
    columns: [
      { name: 'id', type: 'INT UNSIGNED', isPrimary: true, isNullable: false, description: 'Unique answer record ID' },
      { name: 'attempt_id', type: 'INT UNSIGNED', isForeign: true, foreignReference: 'exam_attempts(id)', isNullable: false, description: 'Parent attempt session ID' },
      { name: 'question_id', type: 'INT UNSIGNED', isForeign: true, foreignReference: 'questions(id)', isNullable: false, description: 'Question answered ID' },
      { name: 'selected_option', type: "ENUM('A','B','C','D')", isNullable: true, description: 'Option chosen by candidate (NULL if skipped)' },
      { name: 'is_correct', type: 'BOOLEAN', defaultValue: 'FALSE', description: 'Verdict calculated by server evaluation' },
      { name: 'marks_awarded', type: 'DECIMAL(4,2)', defaultValue: '0.00', description: 'Marks awarded for this answer' },
    ]
  }
];
