import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    {
      name: 'ui',
      testMatch: 'ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        baseURL: 'https://www.saucedemo.com',
        testIdAttribute: 'data-test',
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
      },
    },
    {
      name: 'api',
      testMatch: 'api/**/*.spec.ts',
      use: {
        baseURL: 'https://reqres.in',
        extraHTTPHeaders: {
          'x-api-key': process.env.REQRES_API_KEY?.trim() ?? '',
        },
        // API request headers contain a secret: do not record API traces.
        trace: 'off',
      },
    },
  ],
});
