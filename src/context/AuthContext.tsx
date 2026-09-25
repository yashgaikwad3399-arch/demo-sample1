import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterStudentData, AuthResponse } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterStudentData) => Promise<AuthResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await authService.getProfile();
      if (data && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Authentication token expired or invalid:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    // Try to load cached user while verifying in background
    const cachedUser = localStorage.getItem('auth_user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        // Ignore JSON parse error
      }
    }
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const res = await authService.login(credentials);
      if (res.success && res.token && res.user) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
      }
      return res;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const register = async (data: RegisterStudentData): Promise<AuthResponse> => {
    try {
      const res = await authService.register(data);
      if (res.success && res.token && res.user) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
      }
      return res;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please check your details.';
      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    isAdmin: user?.role === 'ADMIN',
    isStudent: user?.role === 'STUDENT',
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
