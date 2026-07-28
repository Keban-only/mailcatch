/**
 * Global Setup — виконується один раз перед усіма тестами.
 *
 * 1. Реєструє тестового юзера (унікальний email на кожний прогін)
 * 2. Зберігає credentials в .env.test для fixtures
 * 3. Global teardown видалить цього юзера
 *
 * Це гарантує що тести не залежать від стану БД.
 */

import { request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function globalSetup() {
  const ctx = await request.newContext({ baseURL: BASE_URL });
  const uniqueId = Date.now();

  const email = `playwright-${uniqueId}@test.mailcatch.dev`;
  const password = 'PlaywrightTest123!';

  // Реєструємо тестового юзера
  const res = await ctx.post('/api/auth/register', {
    data: { email, password, name: 'Playwright Test' },
  });

  if (res.status() !== 201) {
    const body = await res.text();
    throw new Error(`Global Setup: failed to register test user (${res.status()}): ${body}`);
  }

  const body = await res.json();

  // Зберігаємо auth data для тестів (shared через файл)
  const authData = {
    email,
    password,
    token: body.token,
    apiKey: body.api_key,
    userId: body.user.id,
  };

  const authPath = path.join(__dirname, '..', '..', '.auth.json');
  fs.writeFileSync(authPath, JSON.stringify(authData, null, 2));

  await ctx.dispose();
}

export default globalSetup;
