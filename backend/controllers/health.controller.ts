import { Request, Response } from 'express';
import { getDbStatus, testDbConnection } from '../config/db';

export async function getHealthCheck(req: Request, res: Response): Promise<void> {
  // Trigger a fresh connection check
  const dbHealth = await testDbConnection();

  const healthData = {
    status: 'online',
    server: {
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    },
    database: {
      status: dbHealth.connected ? 'connected' : 'disconnected',
      details: dbHealth.message,
      target: `${dbHealth.config.user}@${dbHealth.config.host}:${dbHealth.config.port}/${dbHealth.config.database}`,
    },
    api: {
      version: '1.0.0',
      activeStage: 'STEP 1: Initial Architecture & Scaffolding',
    },
  };

  res.status(200).json(healthData);
}

export function getSystemInfo(req: Request, res: Response): void {
  res.status(200).json({
    name: 'Smart Examination Portal',
    roleSupport: ['STUDENT', 'ADMIN'],
    supportedSubjects: [
      { code: 'JAVA', name: 'Core Java Programming' },
      { code: 'SQL', name: 'Database Management Systems (SQL)' }
    ],
    architecture: {
      frontend: 'React 19, React Router, Tailwind CSS, Lucide Icons, Axios',
      backend: 'Node.js, Express.js, JWT, bcrypt',
      database: 'MySQL Relational Database',
      security: 'Zero-leak server-side evaluation, bcrypt hashing, parameterized queries',
    },
    roadmap: {
      currentStep: 'STEP 1: Scaffolding, Express Server, DB Pool, React Router, Health API',
      nextStep: 'STEP 2: MySQL Schemas, Migrations, JWT Auth & Role-Based Access Control',
    }
  });
}
