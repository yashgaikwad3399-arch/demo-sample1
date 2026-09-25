import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

export const authRouter = Router();

/**
 * Public Authentication Endpoints
 */

// Student Registration
authRouter.post('/register', AuthController.registerStudent);

// Student & Admin Login
authRouter.post('/login', AuthController.login);

/**
 * Protected Endpoints (Requires valid JWT Bearer Token)
 */

// Authenticated user profile
authRouter.get('/profile', authenticateToken, AuthController.getProfile);

// Token verification
authRouter.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid.',
    user: req.user,
  });
});

/**
 * Role-Restricted Protected Endpoints (RBAC)
 */

// Admin-only test endpoint (Students receive 403 Forbidden)
authRouter.get(
  '/admin-only',
  authenticateToken,
  requireRole('ADMIN'),
  AuthController.verifyAdminAccess
);

// Student-only test endpoint (Admins receive 403 Forbidden)
authRouter.get(
  '/student-only',
  authenticateToken,
  requireRole('STUDENT'),
  AuthController.verifyStudentAccess
);
