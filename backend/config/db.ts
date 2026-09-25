import mysql, { Pool } from 'mysql2/promise';
import { ENV } from './env';

/**
 * MySQL Connection Pool Configuration
 * Using connection pools ensures high concurrency, efficient resource reuse,
 * and automatic connection recycling.
 */
let pool: Pool | null = null;
let isConnected = false;
let connectionErrorMessage = '';

try {
  pool = mysql.createPool({
    host: ENV.DB.HOST,
    port: ENV.DB.PORT,
    user: ENV.DB.USER,
    password: ENV.DB.PASSWORD,
    database: ENV.DB.NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000,
  });
} catch (error: any) {
  connectionErrorMessage = error?.message || 'Failed to initialize MySQL pool';
  console.warn('⚠️ [MySQL Pool Initialization Error]:', connectionErrorMessage);
}

/**
 * Tests database connectivity
 * Safe for development environments where MySQL might be provisioned later.
 */
export async function testDbConnection(): Promise<{
  connected: boolean;
  message: string;
  config: { host: string; port: number; database: string; user: string };
}> {
  const configSummary = {
    host: ENV.DB.HOST,
    port: ENV.DB.PORT,
    database: ENV.DB.NAME,
    user: ENV.DB.USER,
  };

  if (!pool) {
    return {
      connected: false,
      message: connectionErrorMessage || 'MySQL pool not initialized',
      config: configSummary,
    };
  }

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    connectionErrorMessage = '';
    console.log('✅ [MySQL Database] Connected successfully to ' + ENV.DB.NAME);
    return {
      connected: true,
      message: 'Database connection established successfully',
      config: configSummary,
    };
  } catch (err: any) {
    isConnected = false;
    connectionErrorMessage = err?.message || 'Database unreachable';
    console.warn('⚠️ [MySQL Database] Connection check:', connectionErrorMessage);
    return {
      connected: false,
      message: `Database connection pending: ${connectionErrorMessage}`,
      config: configSummary,
    };
  }
}

export function getDbPool(): Pool | null {
  return pool;
}

export function getDbStatus() {
  return {
    isConnected,
    lastError: connectionErrorMessage || null,
    config: {
      host: ENV.DB.HOST,
      port: ENV.DB.PORT,
      database: ENV.DB.NAME,
      user: ENV.DB.USER,
    },
  };
}
