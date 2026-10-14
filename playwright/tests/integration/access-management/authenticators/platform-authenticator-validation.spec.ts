import { gatewayAPI } from '@ansible/playwright/commands/apiClient';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  assertInvalidInputShowsPatternDescription,
  requireAuthenticatorPluginFieldPattern,
  requireOptionsFieldPattern,
  waitForAwxOptionsResponse,
} from '@ansible/playwright/utils/optionsDrivenValidation';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/access/authenticators' }));
test.afterEach(setupAfter);

/**
 * Create authentication form combines gateway OPTIONS (top-level ``name``) with
 * ``authenticator_plugins`` configuration_schema patterns (e.g. Azure AD Client ID).
 */
test.describe('Platform authenticator OPTIONS + plugin schema validation (create form)', () => {
  test(
    'shows validation on name from OPTIONS and on Client ID from plugin schema',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireOptionsFieldPattern(
        page,
        '/authenticators/',
        'name',
        testInfo,
        gatewayAPI
      );
      const clientIdField = await requireAuthenticatorPluginFieldPattern(
        page,
        'azuread',
        'KEY',
        testInfo,
        gatewayAPI
      );

      const optionsResponse = waitForAwxOptionsResponse(page, '/authenticators/');
      await navigateTo(page, 'Access Management', 'Authentication Methods');
      await page.getByRole('link', { name: 'Create authentication' }).click();
      await expect(page.getByRole('heading', { name: 'Create authentication' })).toBeVisible();
      await optionsResponse;

      const nameInput = page.getByTestId('name');
      await assertInvalidInputShowsPatternDescription(page, testInfo, nameField, {
        fill: async (value) => {
          await nameInput.fill(value);
        },
        blur: async () => {
          await nameInput.blur();
        },
      });

      await page.getByRole('button', { name: 'Local' }).click();
      await page.getByRole('option', { name: 'Azure AD', exact: true }).click();

      const clientIdInput = page.getByTestId('configuration-input-KEY');
      await expect(clientIdInput).toBeVisible();
      await assertInvalidInputShowsPatternDescription(page, testInfo, clientIdField, {
        fill: async (value) => {
          await clientIdInput.fill(value);
        },
        blur: async () => {
          await clientIdInput.blur();
        },
      });
    }
  );
});
