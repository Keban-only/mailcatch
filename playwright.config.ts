import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/src/specs',
  timeout: 60_000,
  retries: 0,
  fullyParallel: false,
  workers: 1,
  globalSetup: './tests/src/fixtures/global.setup.ts',
  globalTeardown: './tests/src/fixtures/global.teardown.ts',
  reporter: [
    ['list'],
    ['html', { outputFolder: './tests/reports/html', open: 'never' }],
  ],
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
  },
  projects: [
    {
      name: 'api',
      testMatch: /\/(auth|inboxes|keys|messages|parallel|security|plans)\.spec\.ts$/,
    },
    {
      name: 'ui',
      testMatch: /\/ui\.spec\.ts$/,
      use: {
        browserName: 'chromium',
        headless: true,
      },
    },
  ],
});
