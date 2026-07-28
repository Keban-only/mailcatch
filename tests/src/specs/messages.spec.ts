/**
 * Messages API — прийом email через SMTP та робота з повідомленнями.
 * Покриває: SMTP delivery, OTP extraction, long polling, timeout.
 */

import { test, expect } from '../fixtures/test.fixture';
import { sleep } from '../helpers/wait.helper';
import { config } from '../fixtures/config';

test.describe('Messages — SMTP + API', () => {
  let inboxId: string;
  let inboxAddress: string;

  test('Setup: створення інбоксу', async ({ inboxClient }) => {
    const res = await inboxClient.create('Messages Test');
    expect(res.status).toBe(201);
    inboxId = res.body.id;
    inboxAddress = res.body.address;
  });

  test('Відправка email через SMTP → з\'являється в messages', async ({ messageClient, smtp }) => {
    await smtp.sendEmail({
      to: inboxAddress,
      subject: 'Hello from Playwright',
      body: 'This is an automated test email',
    });

    // Чекаємо доставку та збереження в БД
    await sleep(config.timeouts.smtp);

    const res = await messageClient.list(inboxId);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);

    const msg = res.body.data[0];
    expect(msg.subject).toBe('Hello from Playwright');
    expect(msg.from_address).toContain('test@example.com');
  });

  test('Повне повідомлення по ID → body_text', async ({ messageClient }) => {
    const list = await messageClient.list(inboxId);
    expect(list.body.data.length).toBeGreaterThan(0);
    const messageId = list.body.data[0].id;

    const res = await messageClient.getById(inboxId, messageId);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(messageId);
    expect(res.body.body_text || res.body.body_html).toBeDefined();
  });

  test('OTP extraction — код витягується автоматично', async ({ messageClient, smtp }) => {
    await smtp.sendOtpEmail(inboxAddress, '847293');
    await sleep(config.timeouts.smtp);

    const res = await messageClient.list(inboxId);
    const otpMsg = res.body.data.find(m => m.subject === 'Your verification code');

    expect(otpMsg).toBeDefined();
    expect(otpMsg!.otp_code).toBe('847293');
  });

  test('Long polling /wait — повертає нове повідомлення', async ({ messageClient, smtp }) => {
    const since = new Date().toISOString();

    // Запускаємо wait паралельно з відправкою
    const waitPromise = messageClient.waitForMessage(inboxId, {
      timeout: config.timeouts.longPoll,
      since,
    });

    // Через 3 секунди відправляємо email
    await sleep(3000);
    await smtp.sendEmail({
      to: inboxAddress,
      subject: 'Long poll delivery',
      body: 'Triggered by wait test',
    });

    const res = await waitPromise;
    expect(res.status).toBe(200);
    expect(res.body.subject).toBe('Long poll delivery');
  });

  test('Long polling timeout — нічого не прийшло → 408', async ({ messageClient }) => {
    const res = await messageClient.waitForMessage(inboxId, {
      timeout: 3,
      since: new Date().toISOString(),
    });
    expect(res.status).toBe(408);
  });

  test('Cleanup: видалення інбоксу', async ({ inboxClient }) => {
    const res = await inboxClient.remove(inboxId);
    expect(res.status).toBe(200);
  });
});
