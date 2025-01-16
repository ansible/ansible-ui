/* eslint-disable no-restricted-exports */
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
const __dirname = import.meta.dirname;
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: '.',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0, // process.env.CI ? 2 : 0,
  /** Increase default timeout of expect assertions from 5s to 30s */
  expect: {
    timeout: 30 * 1000,
  },
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'list',

  // Split TAGS by comma and create a regular expression that matches any of the tags
  grep: process.env.TAGS
    ? new RegExp(
        process.env.TAGS.split(',')
          .map((i) => i.trim())
          .join('|')
      )
    : undefined,

  grepInvert: process.env.NOT_TAGS
    ? new RegExp(
        process.env.NOT_TAGS.split(',')
          .map((i) => i.trim())
          .join('|')
      )
    : undefined,

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    ignoreHTTPSErrors: true,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'live chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/upgrades-tests/**',
      dependencies: ['coverage setup'],
    },
    {
      name: 'mock chromium',
      use: { ...devices['Desktop Chrome'] },
      metadata: { mock: true },
      dependencies: ['coverage setup'],
    },
    {
      name: 'live firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: '**/upgrades-tests/**',
    },
    {
      name: 'mock firefox',
      use: { ...devices['Desktop Firefox'] },
      metadata: { mock: true },
    },
    {
      name: 'live webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/upgrades-tests/**',
    },
    {
      name: 'mock webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/upgrades-tests/**', // Webkit does not support the needed 301 redirects
      metadata: { mock: true },
    },
    {
      name: 'live chromium upgrade tests',
      use: { ...devices['Desktop Chrome'] },
      fullyParallel: false,
      testIgnore: '**/tests/**',
    },
    {
      name: 'global setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'coverage setup',
      testMatch: /coverage\.setup\.ts/,
      teardown: 'coverage teardown',
      dependencies: ['global setup'],
    },
    {
      name: 'coverage teardown',
      testMatch: /coverage\.teardown\.ts/,
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
