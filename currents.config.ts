/**
 * Currents.dev configuration for Playwright test reporting
 *
 * This configuration integrates with the existing Playwright setup
 * and provides enhanced test result reporting and analytics.
 *
 * Note: When using @currents/playwright, most configuration is handled
 * through environment variables and the reporter itself.
 *
 * @see https://currents.dev/readme/integration-with-playwright/currents-playwright
 */
export const currentsConfig = {
  // Project configuration - these are the main settings needed
  projectId: process.env.CURRENTS_PROJECT_ID,
  recordKey: process.env.CURRENTS_RECORD_KEY,

  // Build configuration for better organization
  ciBuildId: process.env.CURRENTS_CI_BUILD_ID || `local-${Date.now()}`,

  // Test result metadata for better organization
  tags: {
    // Add Git information to test results
    branch: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME,
    commit: process.env.GITHUB_SHA,
    author: process.env.GITHUB_ACTOR,

    // Environment information
    environment: process.env.NODE_ENV || 'test',
    platform: process.env.PLATFORM_SERVER || 'localhost',

    // Build information
    buildNumber: process.env.GITHUB_RUN_NUMBER,
    workflow: process.env.GITHUB_WORKFLOW,
  },

  // Integration settings
  integration: {
    slack: {
      enabled: !!process.env.SLACK_WEBHOOK_URL,
      webhook: process.env.SLACK_WEBHOOK_URL,
      onlyOnFailure: true,
    },

    github: {
      enabled: !!process.env.GITHUB_TOKEN,
      token: process.env.GITHUB_TOKEN,
      prComments: true,
      commitStatus: true,
    },
  },
};
