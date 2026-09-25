import axios from 'axios';
import { HealthStatus, SystemInfo } from '../types';

/**
 * Pre-configured Axios instance for all Portal REST APIs.
 * Automatically prepends '/api' and handles errors gracefully.
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (will attach JWT in Step 2)
api.interceptors.request.use(
  (config) => {
    // In future steps, token will be retrieved from localStorage or auth state
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for uniform error catching
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Health check service
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const response = await api.get<HealthStatus>('/health');
  return response.data;
}

/**
 * System metadata service
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  const response = await api.get<SystemInfo>('/info');
  return response.data;
}

/**
 * Database diagnostic and schema services (Step 2)
 */
export async function getDatabaseStatus() {
  const response = await api.get('/database/status');
  return response.data;
}

export async function getDatabaseSchema() {
  const response = await api.get('/database/schema');
  return response.data;
}

export async function getDatabaseSampleData() {
  const response = await api.get('/database/sample-data');
  return response.data;
}

export async function testDatabaseConnection() {
  const response = await api.post('/database/test-connection');
  return response.data;
}

export async function initializeDatabase() {
  const response = await api.post('/database/initialize');
  return response.data;
}

export default api;
