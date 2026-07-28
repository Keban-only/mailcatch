/**
 * Security — перевірка захисту API.
 * Покриває: невалідні ключі, SQL injection, IDOR, JWT validation.
 */

import { test, expect } from '../fixtures/test.fixture';
import { config } from '../fixtures/config';

test.describe('Security — захист API', () => {
  test('Невалідний API ключ → 401', async ({ request }) => {
    const res = await request.get(`${config.baseUrl}/api/inboxes`, {
      headers: { 'X-API-Key': 'mc_totally_fake_key_123456' },
    });
    expect(res.status()).toBe(401);
  });

  test('Відсутній API ключ та токен → 401', async ({ request }) => {
    const res = await request.get(`${config.baseUrl}/api/inboxes`);
    expect(res.status()).toBe(401);
  });

  test('Невалідний JWT → 403', async ({ request }) => {
    const res = await request.get(`${config.baseUrl}/api/keys`, {
      headers: { Authorization: 'Bearer invalid.jwt.token' },
    });
    expect(res.status()).toBe(403);
  });

  test('SQL injection в query params → сервер не падає', async ({ inboxClient }) => {
    const res = await inboxClient.list("1; DROP TABLE inboxes;--" as any, 5);
    expect(res.status).not.toBe(500);
  });

  test('Неіснуючий інбокс → 404 (не розкриваємо існування)', async ({ inboxClient }) => {
    const res = await inboxClient.getById('a1111111-b111-c111-d111-e11111111111');
    expect(res.status).toBe(404);
  });

  test('Видалений інбокс → 404', async ({ inboxClient }) => {
    // Створюємо, видаляємо, перевіряємо що доступу немає
    const create = await inboxClient.create('Delete Test');
    expect(create.status).toBe(201);

    await inboxClient.remove(create.body.id);

    const res = await inboxClient.getById(create.body.id);
    expect(res.status).toBe(404);
  });

  test('Expired/fake JWT не дає доступу до ключів', async ({ request }) => {
    // Підроблений JWT з правильним форматом але невалідним підписом
    const fakeJwt = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyJ9.fake_signature';
    const res = await request.get(`${config.baseUrl}/api/keys`, {
      headers: { Authorization: `Bearer ${fakeJwt}` },
    });
    expect(res.status()).toBe(403);
  });
});
