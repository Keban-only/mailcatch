/**
 * Plans — тести лімітів для різних планів.
 *
 * Тестовий юзер на free плані. Перевіряємо:
 * - Free: 1 API key max, 100 inboxes/month, webhooks заборонені
 * - Правильні error messages при перевищенні лімітів
 * - Usage counter не скидається при видаленні
 *
 * Для тестів pro/team потрібен admin endpoint для зміни плану.
 */

import { test, expect } from '../fixtures/test.fixture';
import { config } from '../fixtures/config';
import { AuthClient } from '../api/auth.client';
import { InboxClient } from '../api/inbox.client';
import { KeysClient } from '../api/keys.client';

test.describe('Plans — ліміти Free плану', () => {
  test('API Keys: Free = max 1 ключ, другий → 429 з повідомленням', async ({ keysClient }) => {
    // Default ключ вже існує (створюється при реєстрації)
    const res = await keysClient.create('Extra Key');

    expect(res.status).toBe(429);
    expect(res.body.error).toContain('limit');
    expect(res.body.limit).toBe(1);
    expect(res.body.current).toBe(1);
  });

  test('Webhooks: Free план → 403 заборона', async ({ request }) => {
    // Webhooks доступні тільки на pro/team
    const res = await request.post(`${config.baseUrl}/api/webhooks`, {
      headers: { Authorization: `Bearer ${config.testUser.token}` },
      data: { url: 'https://example.com/webhook' },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('free plan');
  });

  test('Inboxes: usage counter показує коректну кількість', async ({ inboxClient }) => {
    // Створюємо інбокс
    const create = await inboxClient.create('Usage Counter Test');
    expect(create.status).toBe(201);

    // Перевіряємо usage
    const list = await inboxClient.list();
    const usageBefore = list.body.usage.used;
    expect(usageBefore).toBeGreaterThan(0);

    // Видаляємо інбокс
    await inboxClient.remove(create.body.id);

    // Usage НЕ зменшується після видалення (рахується з usage_log)
    const listAfter = await inboxClient.list();
    expect(listAfter.body.usage.used).toBe(usageBefore);
  });

  test('Usage відповідь містить plan та limit', async ({ inboxClient }) => {
    const res = await inboxClient.list();

    expect(res.body.usage.plan).toBe('free');
    expect(res.body.usage.limit).toBe(100);
    expect(res.body.usage.used).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Plans — зміна плану (admin)', () => {
  let adminToken: string;
  let testUserId: string;

  test.beforeAll(async ({ request }) => {
    // Логінимось як admin (kabanchenkoval@gmail.com має admin роль)
    const res = await request.post(`${config.baseUrl}/api/auth/login`, {
      data: { email: 'kabanchenkoval@gmail.com', password: '12345678' },
    });
    if (res.status() === 200) {
      const body = await res.json();
      adminToken = body.token;
    }
    testUserId = config.testUser.userId;
  });

  test('Admin підвищує план до Pro → нові ліміти', async ({ request }) => {
    test.skip(!adminToken, 'Admin account not available');

    // Підвищуємо план
    const patchRes = await request.patch(
      `${config.baseUrl}/api/admin/users/${testUserId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { plan: 'pro' },
      }
    );

    if (patchRes.status() !== 200) {
      test.skip(true, 'Admin endpoint not available');
      return;
    }

    // Тепер можемо створити більше ключів
    const keysRes = await request.post(`${config.baseUrl}/api/keys`, {
      headers: { Authorization: `Bearer ${config.testUser.token}` },
      data: { name: 'Pro Plan Key' },
    });
    expect(keysRes.status()).toBe(201);

    // Webhooks тепер доступні
    const webhookRes = await request.post(`${config.baseUrl}/api/webhooks`, {
      headers: { Authorization: `Bearer ${config.testUser.token}` },
      data: { url: 'https://example.com/hook' },
    });
    expect(webhookRes.status()).toBe(201);

    // Cleanup: видаляємо webhook, ревокаємо ключ, повертаємо free
    const webhookBody = await webhookRes.json();
    await request.delete(`${config.baseUrl}/api/webhooks/${webhookBody.id}`, {
      headers: { Authorization: `Bearer ${config.testUser.token}` },
    });

    const keysBody = await keysRes.json();
    await request.delete(`${config.baseUrl}/api/keys/${keysBody.id}`, {
      headers: { Authorization: `Bearer ${config.testUser.token}` },
    });

    // Повертаємо free план
    await request.patch(
      `${config.baseUrl}/api/admin/users/${testUserId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { plan: 'free' },
      }
    );
  });

  test('Downgrade миттєво діє (auth читає план з БД)', async ({ request }) => {
    test.skip(!adminToken, 'Admin account not available');

    // Ставимо pro
    const patchRes = await request.patch(
      `${config.baseUrl}/api/admin/users/${testUserId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { plan: 'pro' },
      }
    );
    if (patchRes.status() !== 200) {
      test.skip(true, 'Admin endpoint not available');
      return;
    }

    // Перевіряємо що pro (без перелогіну — той самий API key)
    const proRes = await request.get(`${config.baseUrl}/api/inboxes`, {
      headers: { 'X-API-Key': config.apiKey },
    });
    const proBody = await proRes.json();
    expect(proBody.usage.plan).toBe('pro');
    expect(proBody.usage.limit).toBe(5000);

    // Повертаємо free — без перелогіну, миттєво
    await request.patch(
      `${config.baseUrl}/api/admin/users/${testUserId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { plan: 'free' },
      }
    );

    // Той самий запит — тепер free
    const freeRes = await request.get(`${config.baseUrl}/api/inboxes`, {
      headers: { 'X-API-Key': config.apiKey },
    });
    const freeBody = await freeRes.json();
    expect(freeBody.usage.plan).toBe('free');
    expect(freeBody.usage.limit).toBe(100);
  });
});
