import api from './api';
import { SeedQuestion } from '../types';

export interface AdminOverviewStats {
  totalStudents: number;
  totalQuestions: number;
  javaQuestions: number;
  sqlQuestions: number;
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  overallPassRate: number;
  avgScorePercentage: number;
  subjectsCount: number;
}

export interface AdminQuestionItem extends SeedQuestion {
  subjectCode: string;
  subjectName: string;
}

export interface AdminStudentItem {
  id: number;
  name: string;
  email: string;
  rollNumber: string;
  phone: string;
  department: string;
  semester: string;
  createdAt: string;
  stats: {
    totalAttempts: number;
    passedAttempts: number;
    failedAttempts: number;
    avgPercentage: number;
  };
}

export interface AdminAttemptItem {
  id: number;
  userId: number;
  studentName: string;
  rollNumber: string;
  email: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  totalMarks: number;
  percentage: number;
  status: string;
  passed: boolean;
  startTime: string;
  endTime: string;
}

export const adminService = {
  /**
   * Fetch system overview KPIs and counts
   */
  async getOverview(): Promise<{ success: boolean; stats: AdminOverviewStats }> {
    const res = await api.get('/admin/overview');
    return res.data;
  },

  /**
   * Fetch all questions in question bank with optional filters
   */
  async getQuestions(params?: {
    subject?: string;
    difficulty?: string;
  }): Promise<{ success: boolean; count: number; questions: AdminQuestionItem[] }> {
    const res = await api.get('/admin/questions', { params });
    return res.data;
  },

  /**
   * Add a new question to the bank
   */
  async createQuestion(questionData: {
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
  }): Promise<{ success: boolean; message: string; question: SeedQuestion }> {
    const res = await api.post('/admin/questions', questionData);
    return res.data;
  },

  /**
   * Update an existing question
   */
  async updateQuestion(
    id: number,
    questionData: Partial<{
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
  ): Promise<{ success: boolean; message: string; question: SeedQuestion }> {
    const res = await api.put(`/admin/questions/${id}`, questionData);
    return res.data;
  },

  /**
   * Delete a question from the question bank
   */
  async deleteQuestion(id: number): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/admin/questions/${id}`);
    return res.data;
  },

  /**
   * Fetch registered students directory and stats
   */
  async getStudents(): Promise<{ success: boolean; count: number; students: AdminStudentItem[] }> {
    const res = await api.get('/admin/students');
    return res.data;
  },

  /**
   * Fetch all exam attempts across student roster
   */
  async getAttempts(params?: {
    subject?: string;
    status?: string;
  }): Promise<{ success: boolean; count: number; attempts: AdminAttemptItem[] }> {
    const res = await api.get('/admin/attempts', { params });
    return res.data;
  },

  /**
   * Delete an exam attempt
   */
  async deleteAttempt(id: number): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/admin/attempts/${id}`);
    return res.data;
  },
};
