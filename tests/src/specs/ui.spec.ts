/**
 * UI тести — перевірка фронтенду через Playwright browser.
 *
 * Покриває:
 * - Login/Register форми з помилками
 * - Dashboard: лічильник usage, повідомлення про ліміт
 * - Модалка підтвердження видалення
 * - API Keys: "Protected" для Default, "Revoked" бейдж
 * - Redirect якщо вже залогінений
 */

import { test, expect } from '@playwright/test';
import { config } from '../fixtures/config';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('UI — Auth сторінки', () => {
  test('Login: невірний пароль → показує помилку', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/auth/login`);

    await page.fill('input[type="email"]', config.testUser.email);
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Очікуємо повідомлення про помилку
    const error = page.locator('text=Invalid email or password');
    await expect(error).toBeVisible({ timeout: 5000 });
  });

  test('Register: пустий email → форма не відправляється', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/auth/register`);

    // Не заповнюємо email, тільки пароль
    await page.fill('input[type="password"]', 'validpassword');
    await page.click('button[type="submit"]');

    // Форма не відправилась — залишаємось на /auth/register
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/auth/register');
  });

  test('Register: дублікат email → помилка', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/auth/register`);

    // Використовуємо email який вже існує
    await page.fill('input[type="email"]', config.testUser.email);
    await page.fill('input[type="password"]', 'validpassword123');
    await page.click('button[type="submit"]');

    const error = page.locator('text=already registered');
    await expect(error).toBeVisible({ timeout: 5000 });
  });
});

test.describe('UI — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Встановлюємо localStorage на домені перед переходом
    await page.goto(`${FRONTEND_URL}`);
    await page.evaluate((data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ plan: 'free' }));
    }, { token: config.testUser.token });
    await page.goto(`${FRONTEND_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
  });

  test('Показує лічильник usage (X inboxes created this month)', async ({ page }) => {
    // Шукаємо текст з usage counter
    const usage = page.locator('text=/Inboxes created this month/i');
    await expect(usage).toBeVisible({ timeout: 5000 });
  });

  test('Показує план бейдж в хедері', async ({ page }) => {
    const badge = page.locator('text=Free');
    await expect(badge).toBeVisible({ timeout: 5000 });
  });

  test('Кнопка + New Inbox існує', async ({ page }) => {
    const btn = page.locator('button', { hasText: /New Inbox/i });
    await expect(btn).toBeVisible({ timeout: 5000 });
  });

  test('Кнопка Refresh існує (іконка з title)', async ({ page }) => {
    const btn = page.locator('button[title="Refresh"]');
    await expect(btn).toBeVisible({ timeout: 5000 });
  });
});

test.describe('UI — API Keys сторінка', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}`);
    await page.evaluate((data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ plan: 'free' }));
    }, { token: config.testUser.token });
    await page.goto(`${FRONTEND_URL}/dashboard/keys`);
    await page.waitForLoadState('networkidle');
  });

  test('Default ключ показує "Protected" замість кнопки Revoke', async ({ page }) => {
    // Default ключ має бути з текстом Protected
    const protectedLabel = page.locator('text=Protected');
    await expect(protectedLabel).toBeVisible({ timeout: 5000 });
  });

  test('Показує key preview (mc_...)', async ({ page }) => {
    const keyPreview = page.locator('code', { hasText: /mc_/ });
    await expect(keyPreview).toBeVisible({ timeout: 5000 });
  });

  test('+ New Key кнопка відкриває форму', async ({ page }) => {
    const btn = page.locator('button', { hasText: '+ New Key' });
    await btn.click();

    // Має з'явитися форма з input
    const input = page.locator('input[placeholder*="Key name"]');
    await expect(input).toBeVisible({ timeout: 3000 });
  });
});

test.describe('UI — Модалки та помилки', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}`);
    await page.evaluate((data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ plan: 'free' }));
    }, { token: config.testUser.token });
  });

  test('Видалення інбоксу → з\'являється ConfirmModal', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`);

    // Чекаємо завантаження інбоксів
    await page.waitForTimeout(2000);

    // Якщо є чекбокс, вибираємо і натискаємо Delete
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();

      const deleteBtn = page.locator('button', { hasText: /delete/i });
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();

        // Має з'явитися модальне вікно (не browser confirm!)
        const modal = page.locator('[role="dialog"], .fixed.inset-0');
        await expect(modal).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('Upgrade модалка при лімітi (симуляція)', async ({ page }) => {
    // Ставимо usage на максимум через мок відповіді
    await page.route('**/api/inboxes*', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      // Підміняємо usage щоб показати що ліміт вичерпано
      body.usage = { used: 100, limit: 100, plan: 'free' };
      await route.fulfill({ json: body });
    });

    await page.goto(`${FRONTEND_URL}/dashboard`);
    await page.waitForTimeout(1000);

    // Натискаємо Create Inbox
    const createBtn = page.locator('button', { hasText: /create inbox/i });
    if (await createBtn.isVisible()) {
      await createBtn.click();

      // Має з'явитися upgrade модалка або помилка про ліміт
      const limitMsg = page.locator('text=/limit|upgrade|maximum/i');
      await expect(limitMsg).toBeVisible({ timeout: 5000 });
    }
  });
});
