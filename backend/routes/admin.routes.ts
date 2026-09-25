import { Router } from 'express';
import {
  getAdminOverview,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllStudents,
  getAllExamAttempts,
  deleteExamAttempt,
} from '../controllers/admin.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

export const adminRouter = Router();

// Strict RBAC Middleware: Enforce JWT authentication and ADMIN role on all /api/admin/* endpoints
adminRouter.use(authenticateToken);
adminRouter.use(requireRole('ADMIN'));

// Administrative KPIs & Overview
adminRouter.get('/overview', getAdminOverview);

// Question Bank CRUD
adminRouter.get('/questions', getAllQuestions);
adminRouter.post('/questions', createQuestion);
adminRouter.put('/questions/:id', updateQuestion);
adminRouter.delete('/questions/:id', deleteQuestion);

// Student Roster & Academic Logs
adminRouter.get('/students', getAllStudents);

// Exam Attempts Oversight & Auditing
adminRouter.get('/attempts', getAllExamAttempts);
adminRouter.delete('/attempts/:id', deleteExamAttempt);
