/* eslint-disable no-restricted-exports */
import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';
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
// Use verbose configuration by default for better debugging
const isCI = !!process.env.CI;
const jobTimeoutMinutes = Number(process.env.TIMEOUT_MINUTES) || 120;
const config: PlaywrightTestConfig = {
  testDir: '.',
  fullyParallel: false,
  forbidOnly: false, // Allow test.only() for local development
  // Enable retries by default to catch flaky tests
  retries: 2,
  timeout: 60000,
  globalTimeout: isCI && jobTimeoutMinutes > 5 ? (jobTimeoutMinutes - 5) * 60 * 1000 : undefined,
  expect: {
    // timeout: 60 * 1000, // default of playwright is 5s
  },
  workers: isCI ? 1 : 1,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'results.xml' }],
    ['json', { outputFile: 'results.json' }],
    ['html', { outputFolder: 'playwright/html-report', open: 'never' }],
    // Add Currents.dev reporter when running in CI with credentials
    ...(process.env.CURRENTS_PROJECT_ID && process.env.CURRENTS_RECORD_KEY
      ? [['@currents/playwright'] as [string]]
      : []),
  ],

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

  use: {
    // baseURL: 'http://127.0.0.1:3000',
    ignoreHTTPSErrors: true,
    // Only collect trace/screenshots/video on failure to improve performance
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // fillMonacoEditor pastes via the clipboard (Ctrl+V). Chromium honors these
    // permissions; other browsers ignore unknown entries.
    permissions: ['clipboard-read', 'clipboard-write'],
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'live chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['coverage setup'],

      // Commenting this out for now to see if it is really needed
      // timeout: process.env.CI ? 30 * 1000 : 5 * 60 * 1000, // Tests should finish in 30s on CI (default)
      // To avoid timeouts in dev we set it to 5 minutes - dev is slower when using a vite dev build - consider running `npm run serve`
      // If you have a test that needs more time, you can set the timeout for that test only in the test (i.e. test.setTimeout(5 * 60 * 1000);)

      grepInvert: [
        /@upgrade/, // We should not run upgrade tests in this project
      ],
    },
    {
      name: 'mock chromium',
      use: { ...devices['Desktop Chrome'] },
      metadata: { mock: true },
      dependencies: ['coverage setup'],
      grepInvert: [
        /@not_mock/, // We should not run tests that are marked to not run againt a mock
      ],
    },
    {
      name: 'live firefox',
      use: { ...devices['Desktop Firefox'] },
      grepInvert: [
        /@upgrade/, // We should not run upgrade tests in this project
      ],
    },
    {
      name: 'mock firefox',
      use: { ...devices['Desktop Firefox'] },
      metadata: { mock: true },
      grepInvert: [
        /@not_mock/, // We should not run tests that are marked to not run againt a mock
      ],
    },
    {
      name: 'live webkit',
      use: { ...devices['Desktop Safari'] },
      grepInvert: [
        /@upgrade/, // We should not run upgrade tests in this project
      ],
    },
    {
      name: 'mock webkit',
      use: { ...devices['Desktop Safari'] },
      metadata: { mock: true },
      grepInvert: [
        /@not_mock/, // We should not run tests that are marked to not run againt a mock
        /@upgrade/, // We should not run upgrade tests in this project - Webkit does not support the needed 301 redirects
      ],
    },
    {
      name: 'live upgrade',
      use: { ...devices['Desktop Chrome'] },
      fullyParallel: false,
      grep: [
        /@upgrade/, // We should only wan tot run upgrade tests
      ],
      grepInvert: [
        /@not_mock/, // We should not run tests that are marked to not run againt a mock
      ],
    },
    {
      name: 'global setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'coverage setup',
      testMatch: /tests\/coverage-utils\/coverage\.setup\.ts/,
      teardown: 'coverage teardown',
      dependencies: ['global setup'],
    },
    {
      name: 'coverage teardown',
      testMatch: /tests\/coverage-utils\/coverage\.teardown\.ts/,
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
    {
      name: 'mock edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
      metadata: { mock: true },
      dependencies: ['coverage setup'],
      grepInvert: [
        /@not_mock/, // We should not run tests that are marked to not run againt a mock
      ],
    },
    {
      name: 'mock chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      metadata: { mock: true },
      dependencies: ['coverage setup'],
      grepInvert: [
        /@not_mock/, // We should not run tests that are marked to not run againt a mock
      ],
    },
  ],
  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
};

export default defineConfig(config);
