/**
 * Конфігурація тестового середовища.
 *
 * Auth credentials беруться з .auth.json (створюється global setup).
 * Для CI: env змінні перекривають defaults.
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuthData {
  email: string;
  password: string;
  token: string;
  apiKey: string;
  userId: string;
}

function loadAuth(): AuthData {
  const authPath = path.join(__dirname, '..', '..', '.auth.json');
  if (fs.existsSync(authPath)) {
    return JSON.parse(fs.readFileSync(authPath, 'utf-8'));
  }
  // Fallback для локального запуску без global setup
  return {
    email: process.env.TEST_USER_EMAIL || 'kabanchenkoval@gmail.com',
    password: process.env.TEST_USER_PASSWORD || '12345678',
    token: process.env.TEST_USER_TOKEN || '',
    apiKey: process.env.MAILCATCH_API_KEY || 'mc_9f4608c44c0997e0e0c14ca3949fcdbe648f5d193839a1b8',
    userId: process.env.TEST_USER_ID || '',
  };
}

const auth = loadAuth();

export const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  apiKey: auth.apiKey,
  testUser: {
    email: auth.email,
    password: auth.password,
    token: auth.token,
    userId: auth.userId,
  },
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '2525'),
  },
  timeouts: {
    smtp: 3000,
    longPoll: 15,
  },
};
