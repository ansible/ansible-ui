import { gatewayAPI } from '@ansible/playwright/commands/apiClient';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  assertValidInputNoPatternError,
  expectPatternDescriptionVisible,
  findValueFailingPattern,
  requireOptionsFieldPattern,
  waitForAwxOptionsResponse,
} from '@ansible/playwright/utils/optionsDrivenValidation';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

/**
 * Platform organization creation wizard with merged gateway + controller OPTIONS.
 * Tests that pattern validation from merged OPTIONS prevents wizard progression.
 */
test.describe('Platform organization OPTIONS-driven validation (wizard)', () => {
  test(
    'shows OPTIONS-driven validation error on organization name field',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const gatewayNameField = await requireOptionsFieldPattern(
        page,
        '/organizations/',
        'name',
        testInfo,
        gatewayAPI
      );

      const optionsResponse = waitForAwxOptionsResponse(page, '/organizations/');
      await navigateTo(page, 'Access Management', 'Organizations');
      await page.getByText('Create organization', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Organization details' })).toBeVisible();
      await optionsResponse;

      const nameInput = page.getByPlaceholder('Enter organization name');
      const invalidValue = findValueFailingPattern(
        gatewayNameField.pattern!,
        gatewayNameField.flags
      );
      testInfo.skip(
        !invalidValue,
        'Could not derive a sample value that fails the OPTIONS pattern'
      );

      await nameInput.fill(invalidValue!);
      await nameInput.blur();
      await expectPatternDescriptionVisible(page, gatewayNameField.pattern_description!);

      const nextButton = page.getByRole('button').filter({ hasText: /^Next/ });
      await nextButton.click();

      // Verify we're still on the Organization details step (clicking Next should have been blocked)
      await expect(page.getByRole('heading', { name: 'Organization details' })).toBeVisible();
    }
  );

  test(
    'accepts valid organization name without validation error',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const gatewayNameField = await requireOptionsFieldPattern(
        page,
        '/organizations/',
        'name',
        testInfo,
        gatewayAPI
      );

      await navigateTo(page, 'Access Management', 'Organizations');
      await page.getByText('Create organization', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Organization details' })).toBeVisible();

      const nameInput = page.getByPlaceholder('Enter organization name');
      await assertValidInputNoPatternError(page, testInfo, gatewayNameField, {
        fill: async (value) => {
          await nameInput.fill(value);
        },
        blur: async () => {
          await nameInput.blur();
        },
      });
    }
  );
});
