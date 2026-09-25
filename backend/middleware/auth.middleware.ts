import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface AuthUserPayload {
  id: number;
  name: string;
  email: string;
  roll_number: string | null;
  role: 'STUDENT' | 'ADMIN';
}

// Extend Express Request object to hold authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

/**
 * Authentication Middleware
 * Validates the Authorization Bearer JWT token in the request header.
 * Attaches decoded user payload to req.user.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No authorization header provided. Please log in.',
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Expected: Bearer <token>',
    });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT.SECRET) as AuthUserPayload;
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      roll_number: decoded.roll_number,
      role: decoded.role,
    };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
        expired: true,
      });
      return;
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid or forged token. Authentication failed.',
    });
    return;
  }
};

/**
 * Role-Based Authorization Middleware (RBAC)
 * Ensures that the authenticated user possesses one of the allowed roles.
 * Must be executed AFTER authenticateToken.
 */
export const requireRole = (...allowedRoles: ('STUDENT' | 'ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required prior to permission check.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires role (${allowedRoles.join(' or ')}), but your account has role '${req.user.role}'.`,
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
};
