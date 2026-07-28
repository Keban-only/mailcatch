/**
 * Playwright Fixtures — кастомні клієнти для кожного тесту.
 *
 * Аналог Page Object для API тестів:
 * - authClient → AuthClient (login/register)
 * - inboxClient → InboxClient (CRUD інбоксів через API Key)
 * - messageClient → MessageClient (повідомлення + long poll)
 * - keysClient → KeysClient (управління ключами через JWT)
 * - smtp → SmtpHelper (відправка тестових листів)
 *
 * Credentials беруться з .auth.json (global setup створює тест-юзера).
 */

import { test as base } from '@playwright/test';
import { AuthClient } from '../api/auth.client';
import { InboxClient } from '../api/inbox.client';
import { MessageClient } from '../api/message.client';
import { KeysClient } from '../api/keys.client';
import { SmtpHelper } from '../helpers/smtp.helper';
import { config } from './config';

type TestFixtures = {
  authClient: AuthClient;
  inboxClient: InboxClient;
  messageClient: MessageClient;
  keysClient: KeysClient;
  smtp: SmtpHelper;
};

export const test = base.extend<TestFixtures>({
  authClient: async ({ request }, use) => {
    await use(new AuthClient(request, config.baseUrl));
  },

  inboxClient: async ({ request }, use) => {
    await use(new InboxClient(request, config.baseUrl, config.apiKey));
  },

  messageClient: async ({ request }, use) => {
    await use(new MessageClient(request, config.baseUrl, config.apiKey));
  },

  keysClient: async ({ request }, use) => {
    // Використовуємо token з global setup (вже готовий, без login запиту)
    await use(new KeysClient(request, config.baseUrl, config.testUser.token));
  },

  smtp: async ({}, use) => {
    await use(new SmtpHelper(config.smtp.host, config.smtp.port));
  },
});

export { expect } from '@playwright/test';
