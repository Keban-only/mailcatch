/**
 * Inboxes API — CRUD операції з інбоксами.
 * Покриває: створення, список, пагінація, отримання по ID, видалення, 404.
 */

import { test, expect } from '../fixtures/test.fixture';

test.describe('Inboxes — CRUD', () => {
  let createdInboxId: string;
  let createdAddress: string;

  test('Створення інбоксу → отримуємо address', async ({ inboxClient }) => {
    const res = await inboxClient.create('Playwright E2E Test');

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.address).toContain('@mailcatch.dev');
    expect(res.body.name).toBe('Playwright E2E Test');

    createdInboxId = res.body.id;
    createdAddress = res.body.address;
  });

  test('Список інбоксів → створений в списку', async ({ inboxClient }) => {
    const res = await inboxClient.list();

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination.total).toBeGreaterThan(0);
    expect(res.body.usage).toBeDefined();
    expect(res.body.usage.plan).toBeDefined();

    const found = res.body.data.find(i => i.id === createdInboxId);
    expect(found).toBeDefined();
  });

  test('Пагінація — limit=5', async ({ inboxClient }) => {
    const res = await inboxClient.list(1, 5);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.pagination.limit).toBe(5);
  });

  test('Отримання по ID', async ({ inboxClient }) => {
    const res = await inboxClient.getById(createdInboxId);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdInboxId);
    expect(res.body.address).toBe(createdAddress);
  });

  test('Неіснуючий ID → 404', async ({ inboxClient }) => {
    const res = await inboxClient.getById('a1111111-b111-c111-d111-e11111111111');
    expect(res.status).toBe(404);
  });

  test('Видалення інбоксу', async ({ inboxClient }) => {
    const res = await inboxClient.remove(createdInboxId);

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);

    // Перевірка — після видалення 404
    const check = await inboxClient.getById(createdInboxId);
    expect(check.status).toBe(404);
  });
});
