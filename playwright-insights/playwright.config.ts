import { defineConfig, devices } from '@playwright/test';

const APP_HOST = process.env.APP_HOST ?? 'stage.foo.redhat.com:1337';

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  retries: 2,
  timeout: 60_000,
  workers: 1,
  reporter: [['list'], ['junit', { outputFile: 'results.xml' }]],
  use: {
    baseURL: `https://${APP_HOST}`,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
