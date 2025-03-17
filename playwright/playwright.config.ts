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
const config: PlaywrightTestConfig = {
  testDir: '.',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0, // process.env.CI ? 2 : 0,
  expect: {
    // timeout: 60 * 1000, // default of playwright is 5s
  },
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['junit', { outputFile: 'results.xml' }],
    ['allure-playwright', { resultsDir: 'playwright/allure-results' }],
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
      dependencies: ['coverage setup'],

      // Commenting this out for now to see if it is really needed
      // timeout: process.env.CI ? 30 * 1000 : 5 * 60 * 1000, // Tests should finish in 30s on CI (default)
      // To avoid timeouts in dev we set it to 5 minutes - dev is slower when using a vite dev build - consider running `npm run serve`
      // If you have a test that needs more time, you can set the timeout for that test only in the test (i.e. test.setTimeout(5 * 60 * 1000);)

      grepInvert: [
        /@not_live/, // We should not run tests that are marked to not run againt a live
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
        /@not_live/, // We should not run tests that are marked to not run againt a live
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
        /@not_live/, // We should not run tests that are marked to not run againt a live
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
