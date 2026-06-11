import { Page } from '@playwright/test';

export const SettingsFeatureFlags = {
  mock: {
    /**
     * Mock the feature flags settings endpoint.
     * Used in tests to simulate RUNTIME_FEATURE_FLAGS being enabled or disabled.
     */
    settings: async (page: Page, options: { runtimeFeatureFlags: boolean }): Promise<void> => {
      await page.route(
        '**/api/gateway/v1/settings/feature_flags/',
        async (route) =>
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              RUNTIME_FEATURE_FLAGS: options.runtimeFeatureFlags,
            }),
          })
      );
    },
  },
} as const;
