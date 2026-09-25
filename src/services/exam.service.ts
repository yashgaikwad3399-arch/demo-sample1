import api from './api';
import {
  ExamInstructionDetails,
  ExamQuestionsResponse,
  SubmitExamPayload,
  ExamSubmissionResult,
  ExamResultReviewResponse,
} from '../types';

export const examService = {
  /**
   * Fetches official examination track metadata, duration, and instructions
   */
  async getExamDetails(code: string): Promise<{ success: boolean; exam: ExamInstructionDetails }> {
    const response = await api.get<{ success: boolean; exam: ExamInstructionDetails }>(`/exam/details/${code}`);
    return response.data;
  },

  /**
   * Fetches examination questions for candidate test-taking.
   * STRICT SECURITY: Zero correct answers are returned by this endpoint.
   */
  async getExamQuestions(code: string): Promise<ExamQuestionsResponse> {
    const response = await api.get<ExamQuestionsResponse>(`/exam/questions/${code}`);
    return response.data;
  },

  /**
   * Submits candidate responses for server-authoritative evaluation and MySQL persistence.
   */
  async submitExam(payload: SubmitExamPayload): Promise<ExamSubmissionResult> {
    const response = await api.post<ExamSubmissionResult>('/exam/submit', payload);
    return response.data;
  },

  /**
   * Fetches comprehensive post-examination scorecard with itemized question review and explanations.
   */
  async getExamResult(attemptId: number): Promise<ExamResultReviewResponse> {
    const response = await api.get<ExamResultReviewResponse>(`/exam/result/${attemptId}`);
    return response.data;
  },
};
