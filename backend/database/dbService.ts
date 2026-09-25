import { getDbPool, testDbConnection } from '../config/db';
import {
  SEED_USERS,
  SEED_SUBJECTS,
  SEED_QUESTIONS,
  SEED_ATTEMPTS,
  SEED_ANSWERS,
  SeedUser,
  SeedSubject,
  SeedQuestion,
  SeedAttempt,
  SeedAnswer,
} from './seedData';
import { SCHEMA_TABLES } from './schemaDefinition';

// Stateful in-memory fallback store to ensure zero-crash presentations
class InMemoryDatabase {
  users: SeedUser[] = JSON.parse(JSON.stringify(SEED_USERS));
  subjects: SeedSubject[] = JSON.parse(JSON.stringify(SEED_SUBJECTS));
  questions: SeedQuestion[] = JSON.parse(JSON.stringify(SEED_QUESTIONS));
  attempts: SeedAttempt[] = JSON.parse(JSON.stringify(SEED_ATTEMPTS));
  answers: SeedAnswer[] = JSON.parse(JSON.stringify(SEED_ANSWERS));

  reset() {
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.subjects = JSON.parse(JSON.stringify(SEED_SUBJECTS));
    this.questions = JSON.parse(JSON.stringify(SEED_QUESTIONS));
    this.attempts = JSON.parse(JSON.stringify(SEED_ATTEMPTS));
    this.answers = JSON.parse(JSON.stringify(SEED_ANSWERS));
  }
}

const memoryDb = new InMemoryDatabase();

/**
 * Unified Database Service
 * Provides queries against live MySQL with automatic fallback.
 */
export class DatabaseService {
  /**
   * Checks whether the active database backend is live MySQL
   */
  static async isLiveMySql(): Promise<boolean> {
    const status = await testDbConnection();
    return status.connected;
  }

  /**
   * Runs an arbitrary SQL query on MySQL if available, else handles in fallback
   */
  static async executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const pool = getDbPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(sql, params);
        return rows as T[];
      } catch (err) {
        console.warn('⚠️ [MySQL Query Execution Failed - Falling back to stateful store]:', (err as Error).message);
      }
    }
    return [] as T[];
  }

  /**
   * Initializes MySQL schema and inserts seed data if connected
   */
  static async initializeMySqlSchema(): Promise<{ success: boolean; message: string; logs: string[] }> {
    const pool = getDbPool();
    const logs: string[] = [];

    if (!pool) {
      logs.push('MySQL pool is not configured.');
      return { success: false, message: 'MySQL pool unavailable', logs };
    }

    try {
      const conn = await pool.getConnection();
      logs.push('Obtained MySQL connection from pool.');

      // 1. Create tables
      await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          roll_number VARCHAR(50) NULL UNIQUE,
          email VARCHAR(150) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      logs.push('Table `users` verified/created.');

      await conn.query(`
        CREATE TABLE IF NOT EXISTS subjects (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(20) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          description TEXT NULL,
          duration_minutes INT UNSIGNED NOT NULL DEFAULT 30,
          passing_percentage DECIMAL(5,2) NOT NULL DEFAULT 50.00,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      logs.push('Table `subjects` verified/created.');

      await conn.query(`
        CREATE TABLE IF NOT EXISTS questions (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          subject_id INT UNSIGNED NOT NULL,
          question_text TEXT NOT NULL,
          option_a TEXT NOT NULL,
          option_b TEXT NOT NULL,
          option_c TEXT NOT NULL,
          option_d TEXT NOT NULL,
          correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
          difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
          marks INT UNSIGNED NOT NULL DEFAULT 1,
          explanation TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_questions_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      logs.push('Table `questions` verified/created.');

      await conn.query(`
        CREATE TABLE IF NOT EXISTS exam_attempts (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL,
          subject_id INT UNSIGNED NOT NULL,
          total_questions INT UNSIGNED NOT NULL DEFAULT 0,
          correct_answers INT UNSIGNED NOT NULL DEFAULT 0,
          score DECIMAL(6,2) NOT NULL DEFAULT 0.00,
          total_marks DECIMAL(6,2) NOT NULL DEFAULT 0.00,
          percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
          status ENUM('IN_PROGRESS', 'COMPLETED', 'TIMED_OUT') NOT NULL DEFAULT 'IN_PROGRESS',
          start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          end_time TIMESTAMP NULL,
          CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_attempts_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      logs.push('Table `exam_attempts` verified/created.');

      await conn.query(`
        CREATE TABLE IF NOT EXISTS exam_answers (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          attempt_id INT UNSIGNED NOT NULL,
          question_id INT UNSIGNED NOT NULL,
          selected_option ENUM('A', 'B', 'C', 'D') NULL,
          is_correct BOOLEAN NOT NULL DEFAULT FALSE,
          marks_awarded DECIMAL(4,2) NOT NULL DEFAULT 0.00,
          CONSTRAINT fk_answers_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
          CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      logs.push('Table `exam_answers` verified/created.');

      // 2. Seed Subjects
      for (const s of SEED_SUBJECTS) {
        await conn.execute(
          `INSERT INTO subjects (id, code, name, description, duration_minutes, passing_percentage, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)`,
          [s.id, s.code, s.name, s.description, s.duration_minutes, s.passing_percentage, s.is_active]
        );
      }
      logs.push(`Seeded ${SEED_SUBJECTS.length} subjects (JAVA, SQL).`);

      // 3. Seed Users
      for (const u of SEED_USERS) {
        await conn.execute(
          `INSERT INTO users (id, name, roll_number, email, password_hash, role)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [u.id, u.name, u.roll_number, u.email, u.password_hash, u.role]
        );
      }
      logs.push(`Seeded ${SEED_USERS.length} users (1 Admin, 3 Students).`);

      // 4. Seed Questions
      for (const q of SEED_QUESTIONS) {
        await conn.execute(
          `INSERT INTO questions (id, subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, marks, explanation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE question_text=VALUES(question_text)`,
          [q.id, q.subject_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.difficulty, q.marks, q.explanation]
        );
      }
      logs.push(`Seeded ${SEED_QUESTIONS.length} questions (5 Java, 5 SQL).`);

      // 5. Seed Attempts
      for (const a of SEED_ATTEMPTS) {
        await conn.execute(
          `INSERT INTO exam_attempts (id, user_id, subject_id, total_questions, correct_answers, score, total_marks, percentage, status, start_time, end_time)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE score=VALUES(score)`,
          [a.id, a.user_id, a.subject_id, a.total_questions, a.correct_answers, a.score, a.total_marks, a.percentage, a.status, new Date(a.start_time), a.end_time ? new Date(a.end_time) : null]
        );
      }
      logs.push(`Seeded ${SEED_ATTEMPTS.length} sample exam attempts.`);

      // 6. Seed Answers
      for (const ans of SEED_ANSWERS) {
        await conn.execute(
          `INSERT INTO exam_answers (id, attempt_id, question_id, selected_option, is_correct, marks_awarded)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE is_correct=VALUES(is_correct)`,
          [ans.id, ans.attempt_id, ans.question_id, ans.selected_option, ans.is_correct, ans.marks_awarded]
        );
      }
      logs.push(`Seeded ${SEED_ANSWERS.length} itemized answers.`);

      conn.release();
      return {
        success: true,
        message: 'Successfully migrated MySQL schema and populated sample seed data',
        logs,
      };
    } catch (err: any) {
      logs.push(`Migration error: ${err?.message}`);
      return {
        success: false,
        message: `MySQL migration failed: ${err?.message}`,
        logs,
      };
    }
  }

  // ==========================================
  // High-Level Model Queries (Users, Questions, etc.)
  // ==========================================

  static async getUsers(): Promise<SeedUser[]> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const rows = await this.executeQuery<SeedUser>('SELECT id, name, roll_number, email, password_hash, role, created_at FROM users ORDER BY id ASC');
      if (rows && rows.length > 0) return rows;
    }
    return memoryDb.users;
  }

  static async getUserByEmail(email: string): Promise<SeedUser | null> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const rows = await this.executeQuery<SeedUser>('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
      if (rows && rows.length > 0) return rows[0];
    }
    return memoryDb.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  static async getUserById(id: number): Promise<SeedUser | null> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const rows = await this.executeQuery<SeedUser>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      if (rows && rows.length > 0) return rows[0];
    }
    return memoryDb.users.find((u) => u.id === id) || null;
  }

  static async getUserByRollNumber(rollNumber: string): Promise<SeedUser | null> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const rows = await this.executeQuery<SeedUser>('SELECT * FROM users WHERE roll_number = ? LIMIT 1', [rollNumber]);
      if (rows && rows.length > 0) return rows[0];
    }
    return memoryDb.users.find((u) => u.roll_number?.toLowerCase() === rollNumber.toLowerCase()) || null;
  }

  static async createUser(userData: {
    name: string;
    roll_number?: string | null;
    email: string;
    password_hash: string;
    role: 'STUDENT' | 'ADMIN';
  }): Promise<SeedUser> {
    const isLive = await this.isLiveMySql();
    let newId = memoryDb.users.length > 0 ? Math.max(...memoryDb.users.map((u) => u.id)) + 1 : 1;

    if (isLive) {
      const pool = getDbPool();
      if (pool) {
        try {
          const [result]: any = await pool.execute(
            'INSERT INTO users (name, roll_number, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [
              userData.name,
              userData.roll_number || null,
              userData.email.toLowerCase(),
              userData.password_hash,
              userData.role,
            ]
          );
          if (result && result.insertId) {
            newId = result.insertId;
          }
        } catch (err) {
          console.warn('⚠️ [MySQL Insert User Failed - Syncing with in-memory store]:', (err as Error).message);
        }
      }
    }

    const newUser: SeedUser = {
      id: newId,
      name: userData.name,
      roll_number: userData.roll_number || null,
      email: userData.email.toLowerCase(),
      password_hash: userData.password_hash,
      role: userData.role,
      created_at: new Date().toISOString(),
    };

    memoryDb.users.push(newUser);
    return newUser;
  }

  static async getSubjects(): Promise<SeedSubject[]> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const rows = await this.executeQuery<SeedSubject>('SELECT * FROM subjects ORDER BY id ASC');
      if (rows && rows.length > 0) return rows;
    }
    return memoryDb.subjects;
  }

  static async getQuestions(subjectId?: number): Promise<SeedQuestion[]> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const sql = subjectId
        ? 'SELECT * FROM questions WHERE subject_id = ? ORDER BY id ASC'
        : 'SELECT * FROM questions ORDER BY id ASC';
      const rows = await this.executeQuery<SeedQuestion>(sql, subjectId ? [subjectId] : []);
      if (rows && rows.length > 0) return rows;
    }
    if (subjectId) {
      return memoryDb.questions.filter((q) => q.subject_id === subjectId);
    }
    return memoryDb.questions;
  }

  static async getAttempts(): Promise<any[]> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const sql = `
        SELECT ea.*, u.name as student_name, u.roll_number, s.name as subject_name, s.code as subject_code
        FROM exam_attempts ea
        JOIN users u ON ea.user_id = u.id
        JOIN subjects s ON ea.subject_id = s.id
        ORDER BY ea.id DESC
      `;
      const rows = await this.executeQuery(sql);
      if (rows && rows.length > 0) return rows;
    }

    return memoryDb.attempts.map((a) => {
      const user = memoryDb.users.find((u) => u.id === a.user_id);
      const subject = memoryDb.subjects.find((s) => s.id === a.subject_id);
      return {
        ...a,
        student_name: user?.name || 'Unknown Student',
        roll_number: user?.roll_number || 'N/A',
        subject_name: subject?.name || 'Unknown Subject',
        subject_code: subject?.code || 'N/A',
      };
    });
  }

  static async getAttemptsByUserId(userId: number): Promise<any[]> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const sql = `
        SELECT ea.*, s.name as subject_name, s.code as subject_code, s.passing_percentage
        FROM exam_attempts ea
        JOIN subjects s ON ea.subject_id = s.id
        WHERE ea.user_id = ?
        ORDER BY ea.id DESC
      `;
      const rows = await this.executeQuery(sql, [userId]);
      if (rows && rows.length > 0) return rows;
    }

    return memoryDb.attempts
      .filter((a) => a.user_id === userId)
      .sort((a, b) => b.id - a.id)
      .map((a) => {
        const subject = memoryDb.subjects.find((s) => s.id === a.subject_id);
        return {
          ...a,
          subject_name: subject?.name || 'Unknown Subject',
          subject_code: subject?.code || 'N/A',
          passing_percentage: subject?.passing_percentage || 50.0,
        };
      });
  }

  static async getLatestAttemptByUserId(userId: number): Promise<any | null> {
    const attempts = await this.getAttemptsByUserId(userId);
    return attempts.length > 0 ? attempts[0] : null;
  }

  static async getAvailableExams(): Promise<any[]> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const sql = `
        SELECT s.*, COUNT(q.id) as question_count, COALESCE(SUM(q.marks), 0) as total_possible_marks
        FROM subjects s
        LEFT JOIN questions q ON s.id = q.subject_id
        WHERE s.is_active = TRUE
        GROUP BY s.id
        ORDER BY s.id ASC
      `;
      const rows = await this.executeQuery(sql);
      if (rows && rows.length > 0) return rows;
    }

    return memoryDb.subjects
      .filter((s) => s.is_active)
      .map((s) => {
        const qList = memoryDb.questions.filter((q) => q.subject_id === s.id);
        const totalMarks = qList.reduce((acc, q) => acc + q.marks, 0);
        return {
          ...s,
          question_count: qList.length,
          total_possible_marks: totalMarks,
        };
      });
  }

  static async getAnswersForAttempt(attemptId: number): Promise<any[]> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const sql = `
        SELECT ea.*, q.question_text, q.correct_option, q.explanation
        FROM exam_answers ea
        JOIN questions q ON ea.question_id = q.id
        WHERE ea.attempt_id = ?
        ORDER BY ea.id ASC
      `;
      const rows = await this.executeQuery(sql, [attemptId]);
      if (rows && rows.length > 0) return rows;
    }

    return memoryDb.answers
      .filter((ans) => ans.attempt_id === attemptId)
      .map((ans) => {
        const q = memoryDb.questions.find((quest) => quest.id === ans.question_id);
        return {
          ...ans,
          question_text: q?.question_text || '',
          correct_option: q?.correct_option || '',
          explanation: q?.explanation || '',
        };
      });
  }

  static async getSubjectByCode(code: string): Promise<SeedSubject | null> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const rows = await this.executeQuery<SeedSubject>(
        'SELECT * FROM subjects WHERE UPPER(code) = ? LIMIT 1',
        [code.toUpperCase()]
      );
      if (rows && rows.length > 0) return rows[0];
    }
    return (
      memoryDb.subjects.find((s) => s.code.toUpperCase() === code.toUpperCase()) || null
    );
  }

  /**
   * SECURITY CRITICAL: Retrieve exam questions for candidates.
   * Strictly excludes `correct_option` and `explanation` so no answer leakage occurs.
   */
  static async getQuestionsForExamSafe(subjectId: number) {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const sql = `
        SELECT id, subject_id, question_text, option_a, option_b, option_c, option_d, difficulty, marks
        FROM questions
        WHERE subject_id = ?
        ORDER BY id ASC
      `;
      const rows = await this.executeQuery<any>(sql, [subjectId]);
      if (rows && rows.length > 0) return rows;
    }

    return memoryDb.questions
      .filter((q) => q.subject_id === subjectId)
      .map(({ correct_option, explanation, ...safeQuestion }) => safeQuestion);
  }

  /**
   * INTERNAL EVALUATION ONLY: Retrieve full question records with correct answer keys
   * and score weights to evaluate candidate submissions server-side.
   */
  static async getQuestionsForEvaluation(subjectId: number): Promise<SeedQuestion[]> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const sql = 'SELECT * FROM questions WHERE subject_id = ? ORDER BY id ASC';
      const rows = await this.executeQuery<SeedQuestion>(sql, [subjectId]);
      if (rows && rows.length > 0) return rows;
    }
    return memoryDb.questions.filter((q) => q.subject_id === subjectId);
  }

  /**
   * Persists an exam attempt session in MySQL and memory store
   */
  static async saveAttempt(data: {
    user_id: number;
    subject_id: number;
    total_questions: number;
    correct_answers: number;
    score: number;
    total_marks: number;
    percentage: number;
    status: 'COMPLETED' | 'TIMED_OUT';
    start_time: string;
    end_time: string;
  }): Promise<number> {
    const isLive = await this.isLiveMySql();
    let newAttemptId = memoryDb.attempts.length > 0 ? Math.max(...memoryDb.attempts.map((a) => a.id)) + 1 : 1;

    if (isLive) {
      const pool = getDbPool();
      if (pool) {
        try {
          const [result]: any = await pool.execute(
            `INSERT INTO exam_attempts (user_id, subject_id, total_questions, correct_answers, score, total_marks, percentage, status, start_time, end_time)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.user_id,
              data.subject_id,
              data.total_questions,
              data.correct_answers,
              data.score,
              data.total_marks,
              data.percentage,
              data.status,
              new Date(data.start_time),
              new Date(data.end_time),
            ]
          );
          if (result && result.insertId) {
            newAttemptId = result.insertId;
          }
        } catch (err) {
          console.warn('⚠️ [MySQL Save Attempt Failed - Syncing memory store]:', (err as Error).message);
        }
      }
    }

    const newRecord = {
      id: newAttemptId,
      user_id: data.user_id,
      subject_id: data.subject_id,
      total_questions: data.total_questions,
      correct_answers: data.correct_answers,
      score: data.score,
      total_marks: data.total_marks,
      percentage: data.percentage,
      status: data.status,
      start_time: data.start_time,
      end_time: data.end_time,
    };

    memoryDb.attempts.unshift(newRecord);
    return newAttemptId;
  }

  /**
   * Persists individual candidate question answers in MySQL and memory store
   */
  static async saveAnswerRecords(
    answers: {
      attempt_id: number;
      question_id: number;
      selected_option: string | null;
      is_correct: boolean;
      marks_awarded: number;
    }[]
  ): Promise<void> {
    const isLive = await this.isLiveMySql();

    if (isLive) {
      const pool = getDbPool();
      if (pool) {
        try {
          for (const ans of answers) {
            await pool.execute(
              `INSERT INTO exam_answers (attempt_id, question_id, selected_option, is_correct, marks_awarded)
               VALUES (?, ?, ?, ?, ?)`,
              [ans.attempt_id, ans.question_id, ans.selected_option, ans.is_correct, ans.marks_awarded]
            );
          }
        } catch (err) {
          console.warn('⚠️ [MySQL Save Answers Failed - Syncing memory store]:', (err as Error).message);
        }
      }
    }

    let nextAnsId = memoryDb.answers.length > 0 ? Math.max(...memoryDb.answers.map((a) => a.id)) + 1 : 1;
    for (const ans of answers) {
      memoryDb.answers.push({
        id: nextAnsId++,
        attempt_id: ans.attempt_id,
        question_id: ans.question_id,
        selected_option: ans.selected_option as 'A' | 'B' | 'C' | 'D' | null,
        is_correct: ans.is_correct,
        marks_awarded: ans.marks_awarded,
      });
    }
  }

  /**
   * ADMIN: Retrieve all attempts across all students with subject and user joins
   */
  static async getAllAttemptsWithDetails(): Promise<any[]> {
    const isLive = await this.isLiveMySql();
    if (isLive) {
      const rows = await this.executeQuery<any>(
        `SELECT ea.*, s.name as subject_name, s.code as subject_code, s.passing_percentage, u.name as student_name, u.roll_number, u.email as student_email
         FROM exam_attempts ea
         JOIN subjects s ON ea.subject_id = s.id
         JOIN users u ON ea.user_id = u.id
         ORDER BY ea.id DESC`
      );
      if (rows && rows.length > 0) return rows;
    }

    const users = memoryDb.users;
    const subjects = memoryDb.subjects;

    return memoryDb.attempts
      .map((att) => {
        const user = users.find((u) => u.id === att.user_id);
        const subject = subjects.find((s) => s.id === att.subject_id);
        return {
          id: att.id,
          user_id: att.user_id,
          student_name: user?.name || 'Unknown Candidate',
          roll_number: user?.roll_number || 'N/A',
          student_email: user?.email || '',
          subject_id: att.subject_id,
          subject_name: subject?.name || 'General Subject',
          subject_code: subject?.code || 'GEN',
          passing_percentage: subject?.passing_percentage || 50,
          total_questions: att.total_questions,
          correct_answers: att.correct_answers,
          score: att.score,
          total_marks: att.total_marks,
          percentage: att.percentage,
          status: att.status,
          start_time: att.start_time,
          end_time: att.end_time,
        };
      })
      .sort((a, b) => b.id - a.id);
  }

  /**
   * Retrieves comprehensive attempt details including itemized question breakdown for post-exam review.
   * Verifies user_id to prevent cross-candidate access.
   */
  static async getAttemptWithReview(attemptId: number, userId: number): Promise<any | null> {
    const isLive = await this.isLiveMySql();
    let attemptRecord: any = null;

    if (isLive) {
      const attemptRows = await this.executeQuery<any>(
        `SELECT ea.*, s.name as subject_name, s.code as subject_code, s.passing_percentage, u.name as student_name, u.roll_number
         FROM exam_attempts ea
         JOIN subjects s ON ea.subject_id = s.id
         JOIN users u ON ea.user_id = u.id
         WHERE ea.id = ? AND ea.user_id = ?
         LIMIT 1`,
        [attemptId, userId]
      );
      if (attemptRows && attemptRows.length > 0) {
        attemptRecord = attemptRows[0];
      }
    }

    if (!attemptRecord) {
      const found = memoryDb.attempts.find((a) => a.id === attemptId && a.user_id === userId);
      if (!found) return null;
      const subject = memoryDb.subjects.find((s) => s.id === found.subject_id);
      const user = memoryDb.users.find((u) => u.id === found.user_id);
      attemptRecord = {
        ...found,
        subject_name: subject?.name || 'Unknown Subject',
        subject_code: subject?.code || 'N/A',
        passing_percentage: subject?.passing_percentage || 50.0,
        student_name: user?.name || 'Candidate',
        roll_number: user?.roll_number || 'N/A',
      };
    }

    // Now get the itemized answers with question texts & explanations
    let itemizedAnswers: any[] = [];
    if (isLive) {
      const answerRows = await this.executeQuery<any>(
        `SELECT ea.id as answer_id, ea.question_id, ea.selected_option, ea.is_correct, ea.marks_awarded,
                q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation, q.marks as max_marks
         FROM exam_answers ea
         JOIN questions q ON ea.question_id = q.id
         WHERE ea.attempt_id = ?
         ORDER BY q.id ASC`,
        [attemptId]
      );
      if (answerRows && answerRows.length > 0) {
        itemizedAnswers = answerRows;
      }
    }

    if (itemizedAnswers.length === 0) {
      const answers = memoryDb.answers.filter((ans) => ans.attempt_id === attemptId);
      itemizedAnswers = answers.map((ans) => {
        const q = memoryDb.questions.find((quest) => quest.id === ans.question_id);
        return {
          answer_id: ans.id,
          question_id: ans.question_id,
          selected_option: ans.selected_option,
          is_correct: ans.is_correct,
          marks_awarded: ans.marks_awarded,
          question_text: q?.question_text || '',
          option_a: q?.option_a || '',
          option_b: q?.option_b || '',
          option_c: q?.option_c || '',
          option_d: q?.option_d || '',
          correct_option: q?.correct_option || '',
          explanation: q?.explanation || '',
          max_marks: q?.marks || 1,
        };
      });
    }

    return {
      attempt: {
        id: attemptRecord.id,
        userId: attemptRecord.user_id,
        studentName: attemptRecord.student_name,
        rollNumber: attemptRecord.roll_number,
        subjectId: attemptRecord.subject_id,
        subjectName: attemptRecord.subject_name,
        subjectCode: attemptRecord.subject_code,
        totalQuestions: attemptRecord.total_questions,
        correctAnswers: attemptRecord.correct_answers,
        score: Number(attemptRecord.score),
        totalMarks: Number(attemptRecord.total_marks),
        percentage: Number(attemptRecord.percentage),
        status: attemptRecord.status,
        passed: Number(attemptRecord.percentage) >= (attemptRecord.passing_percentage || 50.0),
        passingPercentage: attemptRecord.passing_percentage || 50.0,
        startTime: attemptRecord.start_time,
        endTime: attemptRecord.end_time,
      },
      itemizedReview: itemizedAnswers.map((item) => ({
        questionId: item.question_id,
        questionText: item.question_text,
        options: {
          A: item.option_a,
          B: item.option_b,
          C: item.option_c,
          D: item.option_d,
        },
        selectedOption: item.selected_option,
        correctOption: item.correct_option,
        isCorrect: Boolean(item.is_correct),
        marksAwarded: Number(item.marks_awarded),
        maxMarks: Number(item.max_marks),
        explanation: item.explanation,
      })),
    };
  }

  /**
   * ADMIN: Add a new question to the Question Bank
   */
  static async addQuestion(data: {
    subject_id: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: 'A' | 'B' | 'C' | 'D';
    marks?: number;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    explanation?: string;
  }): Promise<SeedQuestion> {
    const isLive = await this.isLiveMySql();
    let newId = memoryDb.questions.length > 0 ? Math.max(...memoryDb.questions.map((q) => q.id)) + 1 : 1;
    const marks = data.marks ?? 1;
    const difficulty = data.difficulty ?? 'MEDIUM';
    const explanation = data.explanation || '';

    if (isLive) {
      const pool = getDbPool();
      if (pool) {
        try {
          const [result]: any = await pool.execute(
            `INSERT INTO questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, difficulty, explanation)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.subject_id,
              data.question_text,
              data.option_a,
              data.option_b,
              data.option_c,
              data.option_d,
              data.correct_option,
              marks,
              difficulty,
              explanation,
            ]
          );
          if (result && result.insertId) {
            newId = result.insertId;
          }
        } catch (err) {
          console.warn('⚠️ [MySQL Insert Question Failed - Falling back to store]:', (err as Error).message);
        }
      }
    }

    const created: SeedQuestion = {
      id: newId,
      subject_id: data.subject_id,
      question_text: data.question_text,
      option_a: data.option_a,
      option_b: data.option_b,
      option_c: data.option_c,
      option_d: data.option_d,
      correct_option: data.correct_option,
      marks,
      difficulty,
      explanation,
    };

    memoryDb.questions.push(created);
    return created;
  }

  /**
   * ADMIN: Update an existing question
   */
  static async updateQuestion(
    questionId: number,
    data: Partial<{
      subject_id: number;
      question_text: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_option: 'A' | 'B' | 'C' | 'D';
      marks: number;
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      explanation: string;
    }>
  ): Promise<SeedQuestion | null> {
    const isLive = await this.isLiveMySql();
    const existingIndex = memoryDb.questions.findIndex((q) => q.id === questionId);

    if (existingIndex === -1 && !isLive) {
      return null;
    }

    if (isLive) {
      const pool = getDbPool();
      if (pool) {
        try {
          const fields: string[] = [];
          const values: any[] = [];
          for (const [key, val] of Object.entries(data)) {
            if (val !== undefined) {
              fields.push(`${key} = ?`);
              values.push(val);
            }
          }
          if (fields.length > 0) {
            values.push(questionId);
            await pool.execute(`UPDATE questions SET ${fields.join(', ')} WHERE id = ?`, values);
          }
        } catch (err) {
          console.warn('⚠️ [MySQL Update Question Failed]:', (err as Error).message);
        }
      }
    }

    if (existingIndex !== -1) {
      memoryDb.questions[existingIndex] = {
        ...memoryDb.questions[existingIndex],
        ...data,
      };
      return memoryDb.questions[existingIndex];
    }

    return null;
  }

  /**
   * ADMIN: Delete a question
   */
  static async deleteQuestion(questionId: number): Promise<boolean> {
    const isLive = await this.isLiveMySql();

    if (isLive) {
      const pool = getDbPool();
      if (pool) {
        try {
          // Delete dependent student answers first if foreign key cascade not active
          await pool.execute('DELETE FROM exam_answers WHERE question_id = ?', [questionId]);
          await pool.execute('DELETE FROM questions WHERE id = ?', [questionId]);
        } catch (err) {
          console.warn('⚠️ [MySQL Delete Question Failed]:', (err as Error).message);
        }
      }
    }

    // Delete in memory store
    memoryDb.answers = memoryDb.answers.filter((a) => a.question_id !== questionId);
    const initialLen = memoryDb.questions.length;
    memoryDb.questions = memoryDb.questions.filter((q) => q.id !== questionId);
    return memoryDb.questions.length < initialLen;
  }

  /**
   * ADMIN: Delete an exam attempt and associated answer logs
   */
  static async deleteExamAttempt(attemptId: number): Promise<boolean> {
    const isLive = await this.isLiveMySql();

    if (isLive) {
      const pool = getDbPool();
      if (pool) {
        try {
          await pool.execute('DELETE FROM exam_answers WHERE attempt_id = ?', [attemptId]);
          await pool.execute('DELETE FROM exam_attempts WHERE id = ?', [attemptId]);
        } catch (err) {
          console.warn('⚠️ [MySQL Delete Attempt Failed]:', (err as Error).message);
        }
      }
    }

    memoryDb.answers = memoryDb.answers.filter((a) => a.attempt_id !== attemptId);
    const initialLen = memoryDb.attempts.length;
    memoryDb.attempts = memoryDb.attempts.filter((a) => a.id !== attemptId);
    return memoryDb.attempts.length < initialLen;
  }

  /**
   * ADMIN: Fetch all student accounts with performance metrics
   */
  static async getAllStudentsWithStats() {
    const users = await this.getUsers();
    const attempts = await this.getAttempts();

    const students = users.filter((u) => u.role === 'STUDENT');

    return students.map((s) => {
      const studentAttempts = attempts.filter((a) => a.user_id === s.id);
      const totalAttempts = studentAttempts.length;
      const passedAttempts = studentAttempts.filter(
        (a) => Number(a.percentage) >= 50
      ).length;
      const avgPercentage =
        totalAttempts > 0
          ? Math.round(
              studentAttempts.reduce((sum, a) => sum + Number(a.percentage), 0) / totalAttempts
            )
          : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        rollNumber: s.roll_number || 'N/A',
        phone: (s as any).phone || 'N/A',
        department: (s as any).department || 'Computer Science',
        semester: (s as any).semester || 'Final Year (Semester VIII)',
        createdAt: s.created_at,
        stats: {
          totalAttempts,
          passedAttempts,
          failedAttempts: totalAttempts - passedAttempts,
          avgPercentage,
        },
      };
    });
  }

  static async getDatabaseStats() {
    const isLive = await this.isLiveMySql();
    const users = await this.getUsers();
    const subjects = await this.getSubjects();
    const questions = await this.getQuestions();
    const attempts = await this.getAttempts();

    const javaQuestions = questions.filter((q) => q.subject_id === 1).length;
    const sqlQuestions = questions.filter((q) => q.subject_id === 2).length;
    const students = users.filter((u) => u.role === 'STUDENT').length;
    const admins = users.filter((u) => u.role === 'ADMIN').length;

    return {
      backendEngine: isLive ? 'MySQL (Live Connection Pool)' : 'MySQL-Compatible Relational Store (Fallback)',
      isLiveMySql: isLive,
      counts: {
        totalUsers: users.length,
        students,
        admins,
        subjects: subjects.length,
        totalQuestions: questions.length,
        javaQuestions,
        sqlQuestions,
        examAttempts: attempts.length,
      },
      tables: SCHEMA_TABLES.map((t) => ({
        name: t.name,
        purpose: t.purpose,
        columnCount: t.columns.length,
        primaryKey: t.primaryKey,
        foreignKeys: t.foreignKeys,
      })),
    };
  }
}

export const dbService = DatabaseService;

