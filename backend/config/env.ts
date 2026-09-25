import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'smart_exam_portal',
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_exam_portal_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  }
};
