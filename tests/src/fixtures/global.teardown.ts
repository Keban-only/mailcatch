/**
 * Global Teardown — виконується один раз після всіх тестів.
 * Видаляє тестового юзера та його дані з БД.
 */

import { request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function globalTeardown() {
  const authPath = path.join(__dirname, '..', '..', '.auth.json');

  if (!fs.existsSync(authPath)) return;

  const authData = JSON.parse(fs.readFileSync(authPath, 'utf-8'));

  // Видаляємо тестового юзера через admin endpoint або напряму
  // Поки що просто прибираємо auth файл
  // В майбутньому: DELETE /api/auth/account з JWT
  const ctx = await request.newContext({ baseURL: BASE_URL });
  // Cleanup: видаляємо всі інбокси тестового юзера
  const inboxes = await ctx.get('/api/inboxes?limit=100', {
    headers: { 'X-API-Key': authData.apiKey },
  });

  if (inboxes.status() === 200) {
    const body = await inboxes.json();
    for (const inbox of body.data || []) {
      await ctx.delete(`/api/inboxes/${inbox.id}`, {
        headers: { 'X-API-Key': authData.apiKey },
      });
    }
  }

  await ctx.dispose();

  // Прибираємо auth файл
  fs.unlinkSync(authPath);
}

export default globalTeardown;
