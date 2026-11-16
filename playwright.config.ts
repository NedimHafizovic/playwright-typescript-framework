import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';
import type { TestOptions } from './src/fixtures/test';

export default defineConfig<TestOptions>({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: env.isCI
    ? [
        ['github'],
        ['list'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
      ]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: env.baseUrl,
    // The application under test exposes stable `data-test` hooks.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      testDir: './tests/ui',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: env.apiBaseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
