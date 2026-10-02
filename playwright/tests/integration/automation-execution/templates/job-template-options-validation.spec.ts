import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  assertInvalidInputShowsPatternDescription,
  assertValidInputNoPatternError,
  requireOptionsFieldPattern,
  waitForAwxOptionsResponse,
} from '@ansible/playwright/utils/optionsDrivenValidation';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

/**
 * Complex create form with many fields; OPTIONS validation plumbing is the same as simpler forms.
 */
test.describe('Job template OPTIONS-driven validation (create form)', () => {
  test(
    'shows OPTIONS-driven validation error on blur for name field',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireOptionsFieldPattern(page, '/job_templates/', 'name', testInfo);

      const optionsResponse = waitForAwxOptionsResponse(page, '/job_templates/');
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByText('Create template', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create job template' }).click();
      await expect(page.getByRole('heading', { name: 'Create job template' })).toBeVisible();
      await optionsResponse;

      const nameInput = page.getByPlaceholder('Enter job template name');
      await assertInvalidInputShowsPatternDescription(page, testInfo, nameField, {
        fill: async (value) => {
          await nameInput.fill(value);
        },
        blur: async () => {
          await nameInput.blur();
        },
      });
    }
  );

  test(
    'accepts valid input without validation error on blur',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireOptionsFieldPattern(page, '/job_templates/', 'name', testInfo);

      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByText('Create template', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create job template' }).click();
      await expect(page.getByRole('heading', { name: 'Create job template' })).toBeVisible();

      const nameInput = page.getByPlaceholder('Enter job template name');
      await assertValidInputNoPatternError(page, testInfo, nameField, {
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
