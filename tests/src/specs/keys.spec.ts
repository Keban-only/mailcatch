/**
 * API Keys — управління ключами доступу.
 * Покриває: список, ліміт плану, захист Default ключа.
 *
 * Тестовий юзер на free плані (1 ключ max), тому:
 * - Default ключ вже існує
 * - Створення другого → 429 (план ліміт)
 * - Default не можна ревокати → 403
 */

import { test, expect } from '../fixtures/test.fixture';

test.describe('API Keys — CRUD', () => {
  test('Список ключів → Default присутній і активний', async ({ keysClient }) => {
    const res = await keysClient.list();

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);

    const defaultKey = res.body.data.find(k => k.name === 'Default');
    expect(defaultKey).toBeDefined();
    expect(defaultKey!.is_active).toBe(true);
  });

  test('Free план: створення другого ключа → ліміт (429)', async ({ keysClient }) => {
    // Free план дозволяє тільки 1 ключ, Default вже існує
    const res = await keysClient.create('Should Fail Key');

    expect(res.status).toBe(429);
    expect(res.body.error).toContain('limit');
  });

  test('Default ключ не можна ревокати → 403', async ({ keysClient }) => {
    const list = await keysClient.list();
    const defaultKey = list.body.data.find(k => k.name === 'Default' && k.is_active);
    expect(defaultKey).toBeDefined();

    const res = await keysClient.revoke(defaultKey!.id);
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Cannot revoke the default');
  });
});
