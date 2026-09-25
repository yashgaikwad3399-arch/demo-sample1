import { Request, Response } from 'express';
import { testDbConnection, getDbStatus } from '../config/db';
import { DatabaseService } from '../database/dbService';
import { SCHEMA_TABLES } from '../database/schemaDefinition';

export class DatabaseController {
  /**
   * GET /api/database/status
   * Tests the database connection and returns configuration status
   */
  static async getStatus(req: Request, res: Response) {
    try {
      const connTest = await testDbConnection();
      const stats = await DatabaseService.getDatabaseStats();

      res.json({
        success: true,
        connection: connTest,
        poolStatus: getDbStatus(),
        databaseStats: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve database status',
        error: error?.message,
      });
    }
  }

  /**
   * GET /api/database/schema
   * Returns metadata for all normalized tables, keys, constraints, and relationships
   */
  static async getSchema(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        databaseName: 'smart_exam_portal',
        normalForm: 'Third Normal Form (3NF)',
        tables: SCHEMA_TABLES,
        erdSummary: [
          { from: 'users', to: 'exam_attempts', type: '1:N', key: 'user_id -> users(id)', onAction: 'ON DELETE CASCADE' },
          { from: 'subjects', to: 'questions', type: '1:N', key: 'subject_id -> subjects(id)', onAction: 'ON DELETE RESTRICT' },
          { from: 'subjects', to: 'exam_attempts', type: '1:N', key: 'subject_id -> subjects(id)', onAction: 'ON DELETE RESTRICT' },
          { from: 'exam_attempts', to: 'exam_answers', type: '1:N', key: 'attempt_id -> exam_attempts(id)', onAction: 'ON DELETE CASCADE' },
          { from: 'questions', to: 'exam_answers', type: '1:N', key: 'question_id -> questions(id)', onAction: 'ON DELETE RESTRICT' },
        ],
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve schema definitions',
        error: error?.message,
      });
    }
  }

  /**
   * GET /api/database/sample-data
   * Returns sample data across users, subjects, questions, and attempts
   */
  static async getSampleData(req: Request, res: Response) {
    try {
      const users = await DatabaseService.getUsers();
      const subjects = await DatabaseService.getSubjects();
      const questions = await DatabaseService.getQuestions();
      const attempts = await DatabaseService.getAttempts();

      res.json({
        success: true,
        data: {
          users: users.map((u) => ({
            id: u.id,
            name: u.name,
            roll_number: u.roll_number,
            email: u.email,
            password_hash: u.password_hash,
            role: u.role,
            is_password_encrypted: u.password_hash.startsWith('$2b$') || u.password_hash.startsWith('$2a$'),
          })),
          subjects,
          questions: questions.map((q) => ({
            ...q,
            subject_name: q.subject_id === 1 ? 'Core Java' : 'SQL Databases',
          })),
          attempts,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve sample data',
        error: error?.message,
      });
    }
  }

  /**
   * POST /api/database/test-connection
   * Actively runs ping against MySQL
   */
  static async testConnection(req: Request, res: Response) {
    try {
      const result = await testDbConnection();
      res.json({
        success: result.connected,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        connected: false,
        message: error?.message || 'Connection test failed',
      });
    }
  }

  /**
   * POST /api/database/initialize
   * Runs schema migration & sample seeding
   */
  static async initializeDatabase(req: Request, res: Response) {
    try {
      const result = await DatabaseService.initializeMySqlSchema();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Initialization failed',
      });
    }
  }
}
