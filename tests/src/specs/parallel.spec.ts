/**
 * Parallel — паралельна робота з кількома інбоксами.
 * Імітує реальний сценарій CI/CD: два тести одночасно чекають email.
 * Перевіряє ізоляцію — повідомлення не змішуються між інбоксами.
 */

import { test, expect } from '../fixtures/test.fixture';
import { sleep } from '../helpers/wait.helper';
import { config } from '../fixtures/config';

test.describe('Parallel — ізоляція інбоксів', () => {
  test('Два інбокси отримують тільки свої повідомлення', async ({ inboxClient, messageClient, smtp }) => {
    // Створюємо два інбокси одночасно
    const [res1, res2] = await Promise.all([
      inboxClient.create('Parallel A'),
      inboxClient.create('Parallel B'),
    ]);

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);

    const inbox1 = res1.body;
    const inbox2 = res2.body;

    // Відправляємо різні листи в різні інбокси
    await smtp.sendEmail({ to: inbox1.address, subject: 'For Inbox A', body: 'body-a' });
    await smtp.sendEmail({ to: inbox2.address, subject: 'For Inbox B', body: 'body-b' });

    await sleep(config.timeouts.smtp);

    // Отримуємо повідомлення паралельно
    const [msgs1, msgs2] = await Promise.all([
      messageClient.list(inbox1.id),
      messageClient.list(inbox2.id),
    ]);

    // Inbox A отримав тільки своє
    expect(msgs1.body.data.length).toBe(1);
    expect(msgs1.body.data[0].subject).toBe('For Inbox A');

    // Inbox B отримав тільки своє
    expect(msgs2.body.data.length).toBe(1);
    expect(msgs2.body.data[0].subject).toBe('For Inbox B');

    // Cleanup
    await Promise.all([
      inboxClient.remove(inbox1.id),
      inboxClient.remove(inbox2.id),
    ]);
  });

  test('Long poll на двох інбоксах паралельно', async ({ inboxClient, messageClient, smtp }) => {
    const [r1, r2] = await Promise.all([
      inboxClient.create('Poll A'),
      inboxClient.create('Poll B'),
    ]);

    const inbox1 = r1.body;
    const inbox2 = r2.body;
    const since = new Date().toISOString();

    // Стартуємо long poll на обох
    const wait1 = messageClient.waitForMessage(inbox1.id, { timeout: 15, since });
    const wait2 = messageClient.waitForMessage(inbox2.id, { timeout: 15, since });

    // Через 3 сек відправляємо листи
    await sleep(3000);
    await smtp.sendEmail({ to: inbox1.address, subject: 'Poll Result A', body: 'a' });
    await smtp.sendEmail({ to: inbox2.address, subject: 'Poll Result B', body: 'b' });

    // Обидва мають відповісти
    const [res1, res2] = await Promise.all([wait1, wait2]);

    expect(res1.status).toBe(200);
    expect(res1.body.subject).toBe('Poll Result A');

    expect(res2.status).toBe(200);
    expect(res2.body.subject).toBe('Poll Result B');

    // Cleanup
    await Promise.all([
      inboxClient.remove(inbox1.id),
      inboxClient.remove(inbox2.id),
    ]);
  });
});
