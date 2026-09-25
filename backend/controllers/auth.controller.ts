import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { DatabaseService } from '../database/dbService';

// Email validation helper using RFC 5322 regex
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export class AuthController {
  /**
   * Register a new student candidate
   * Validates required fields, email format, checks for duplicates,
   * hashes password with bcrypt (10 rounds), and issues a signed JWT.
   */
  static async registerStudent(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const rawRoll = req.body.roll_number || req.body.rollNumber;

      // 1. Validation of required fields
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Full name is required and must be at least 2 characters.',
        });
        return;
      }

      if (!email || typeof email !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Email address is required.',
        });
        return;
      }

      const trimmedEmail = email.trim().toLowerCase();
      if (!isValidEmail(trimmedEmail)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format. Please provide a valid email address.',
        });
        return;
      }

      if (!rawRoll || typeof rawRoll !== 'string' || rawRoll.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Roll number / Hall ticket number is required for student registration.',
        });
        return;
      }

      const trimmedRollNumber = rawRoll.trim().toUpperCase();

      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters in length.',
        });
        return;
      }

      // 2. Prevent duplicate email
      const existingUserByEmail = await DatabaseService.getUserByEmail(trimmedEmail);
      if (existingUserByEmail) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address is already registered.',
        });
        return;
      }

      // 3. Prevent duplicate roll number
      const existingUserByRoll = await DatabaseService.getUserByRollNumber(trimmedRollNumber);
      if (existingUserByRoll) {
        res.status(409).json({
          success: false,
          message: `Roll number '${trimmedRollNumber}' is already registered to an existing candidate.`,
        });
        return;
      }

      // 4. Hash password with bcrypt (10 rounds of salt)
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // 5. Create user record
      const newUser = await DatabaseService.createUser({
        name: name.trim(),
        roll_number: trimmedRollNumber,
        email: trimmedEmail,
        password_hash,
        role: 'STUDENT',
      });

      // 6. Generate signed JWT token
      const tokenPayload = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roll_number: newUser.roll_number,
        role: newUser.role,
      };

      const token = jwt.sign(tokenPayload, ENV.JWT.SECRET, {
        expiresIn: (ENV.JWT.EXPIRES_IN || '24h') as any,
      });

      // 7. Return success response (NEVER return password or password_hash)
      res.status(201).json({
        success: true,
        message: 'Student registration completed successfully.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          roll_number: newUser.roll_number,
          role: newUser.role,
          created_at: newUser.created_at,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration.',
        error: error?.message,
      });
    }
  }

  /**
   * User login (handles both Students and Administrators)
   * Authenticates against bcrypt password hash and generates a signed JWT.
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // 1. Validation
      if (!email || typeof email !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Email address is required.',
        });
        return;
      }

      if (!password || typeof password !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Password is required.',
        });
        return;
      }

      const trimmedEmail = email.trim().toLowerCase();

      // 2. Fetch user by email
      const user = await DatabaseService.getUserByEmail(trimmedEmail);
      if (!user) {
        // Generic response to mitigate user enumeration attacks
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
        return;
      }

      // 3. Compare password with bcrypt hash
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
        return;
      }

      // 4. Generate signed JWT token
      const tokenPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        roll_number: user.roll_number,
        role: user.role,
      };

      const token = jwt.sign(tokenPayload, ENV.JWT.SECRET, {
        expiresIn: (ENV.JWT.EXPIRES_IN || '24h') as any,
      });

      // 5. Return sanitized user and token
      res.status(200).json({
        success: true,
        message: `${user.role === 'ADMIN' ? 'Administrator' : 'Student'} logged in successfully.`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roll_number: user.roll_number,
          role: user.role,
          created_at: user.created_at,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during authentication.',
        error: error?.message,
      });
    }
  }

  /**
   * Fetch authenticated user's profile
   * Protected route: requires valid JWT.
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthenticated user.',
        });
        return;
      }

      // Fetch fresh record from database
      const user = await DatabaseService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User profile not found in database.',
        });
        return;
      }

      // Sanitize output (strictly exclude password_hash)
      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roll_number: user.roll_number,
          role: user.role,
          created_at: user.created_at,
        },
      });
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user profile.',
        error: error?.message,
      });
    }
  }

  /**
   * Protected Admin-Only Resource Verification
   */
  static async verifyAdminAccess(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Admin authorization verified. Access granted to administrative control plane.',
      requester: req.user,
      authorizedRole: 'ADMIN',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Protected Student-Only Resource Verification
   */
  static async verifyStudentAccess(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Student authorization verified. Access granted to candidate exam module.',
      requester: req.user,
      authorizedRole: 'STUDENT',
      timestamp: new Date().toISOString(),
    });
  }
}
