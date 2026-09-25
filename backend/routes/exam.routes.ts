import { Router } from 'express';
import {
  getExamDetails,
  getExamQuestions,
  submitExam,
  getExamResult,
} from '../controllers/exam.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

export const examRouter = Router();

// Enforce JWT authentication and student role on all examination endpoints
examRouter.use(authenticateToken);
examRouter.use(requireRole('STUDENT'));

/**
 * @route   GET /api/exam/details/:code
 * @desc    Fetch subject instructions, duration, and metadata
 * @access  Protected (Student)
 */
examRouter.get('/details/:code', getExamDetails);

/**
 * @route   GET /api/exam/questions/:code
 * @desc    Fetch examination questions (ZERO correct answer keys sent)
 * @access  Protected (Student)
 */
examRouter.get('/questions/:code', getExamQuestions);

/**
 * @route   POST /api/exam/submit
 * @desc    Submit candidate responses for server-authoritative evaluation
 * @access  Protected (Student)
 */
examRouter.post('/submit', submitExam);

/**
 * @route   GET /api/exam/result/:attemptId
 * @desc    Retrieve detailed scorecard and itemized review with post-exam explanations
 * @access  Protected (Student)
 */
examRouter.get('/result/:attemptId', getExamResult);
