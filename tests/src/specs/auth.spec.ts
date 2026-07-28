/**
 * Auth API — тести авторизації.
 * Покриває: login, невалідні дані, захист ендпоінтів.
 *
 * Використовує тестового юзера створеного в global setup.
 */

import { test, expect } from '../fixtures/test.fixture';
import { config } from '../fixtures/config';

test.describe('Auth — JWT авторизація', () => {
  test('Логін з правильними даними → JWT + user', async ({ authClient }) => {
    const res = await authClient.login(config.testUser.email, config.testUser.password);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.token.length).toBeGreaterThan(20);
    expect(res.body.user.email).toBe(config.testUser.email);
    expect(res.body.user.plan).toBeDefined();
  });

  test('Невірний пароль → 401', async ({ authClient }) => {
    const res = await authClient.login(config.testUser.email, 'wrongpassword');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test('Неіснуючий email → 401', async ({ authClient }) => {
    const res = await authClient.login('nonexistent-user-xyz@nowhere.com', 'password123');
    expect(res.status).toBe(401);
  });

  test('Захищений ендпоінт без токена → 401', async ({ request }) => {
    const res = await request.get(`${config.baseUrl}/api/keys`);
    expect(res.status()).toBe(401);
  });

  test('/me з валідним токеном → user data', async ({ authClient }) => {
    const res = await authClient.me(config.testUser.token);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(config.testUser.email);
  });
});
