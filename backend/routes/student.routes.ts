import { Router } from 'express';
import {
  getStudentProfile,
  getAvailableExams,
  getExamHistory,
  getLatestResult,
  getStudentAttemptDetails,
} from '../controllers/student.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

export const studentRouter = Router();

// Enforce JWT Authentication and STUDENT role across all student routes
studentRouter.use(authenticateToken);
studentRouter.use(requireRole('STUDENT'));

/**
 * @route   GET /api/student/profile
 * @desc    Retrieves profile information for the authenticated student
 * @access  Protected (Student)
 */
studentRouter.get('/profile', getStudentProfile);

/**
 * @route   GET /api/student/exams
 * @desc    Retrieves available examination tracks (Java, SQL)
 * @access  Protected (Student)
 */
studentRouter.get('/exams', getAvailableExams);

/**
 * @route   GET /api/student/history
 * @desc    Retrieves past exam attempts for the student
 * @access  Protected (Student)
 */
studentRouter.get('/history', getExamHistory);

/**
 * @route   GET /api/student/history/:attemptId
 * @desc    Retrieves single examination attempt details and itemized review for the student
 * @access  Protected (Student - Owner only)
 */
studentRouter.get('/history/:attemptId', getStudentAttemptDetails);

/**
 * @route   GET /api/student/latest-result
 * @desc    Retrieves most recent examination attempt score and status
 * @access  Protected (Student)
 */
studentRouter.get('/latest-result', getLatestResult);
