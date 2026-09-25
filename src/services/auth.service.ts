import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterStudentData, User } from '../types';

const api = axios.create({
  baseURL: '/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  /**
   * Register a new student candidate
   */
  async register(data: RegisterStudentData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/register', data);
    return response.data;
  },

  /**
   * Login user (Student or Admin)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', credentials);
    return response.data;
  },

  /**
   * Fetch current user profile
   */
  async getProfile(): Promise<{ success: boolean; user: User }> {
    const response = await api.get<{ success: boolean; user: User }>('/profile');
    return response.data;
  },

  /**
   * Quick token validity check
   */
  async verifyToken(): Promise<{ success: boolean; user: User }> {
    const response = await api.get<{ success: boolean; user: User }>('/verify');
    return response.data;
  },

  /**
   * Verify access to protected admin route
   */
  async checkAdminAccess(): Promise<any> {
    const response = await api.get('/admin-only');
    return response.data;
  },

  /**
   * Verify access to protected student route
   */
  async checkStudentAccess(): Promise<any> {
    const response = await api.get('/student-only');
    return response.data;
  },
};
