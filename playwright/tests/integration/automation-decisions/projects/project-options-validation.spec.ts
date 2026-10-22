import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  assertInvalidInputShowsPatternDescription,
  assertValidInputNoPatternError,
  openEdaProjectCreateForm,
  requireEdaOptionsFieldPattern,
  waitForEdaOptionsResponse,
} from '@ansible/playwright/utils/optionsDrivenValidation';
import { test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/projects' }));
test.afterEach(setupAfter);

/**
 * Representative EDA project create form (SCM URL, organization, credentials).
 */
test.describe('EDA project OPTIONS-driven validation (create form)', () => {
  test(
    'should show OPTIONS-driven validation error on blur for name field',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireEdaOptionsFieldPattern(page, 'projects/', 'name', testInfo);

      const optionsResponse = waitForEdaOptionsResponse(page, 'projects/');
      await openEdaProjectCreateForm(page);
      await optionsResponse;

      const nameInput = page.getByRole('textbox', { name: 'Name', exact: true });
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
    'should accept valid input without validation error on blur',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireEdaOptionsFieldPattern(page, 'projects/', 'name', testInfo);

      const optionsResponse = waitForEdaOptionsResponse(page, 'projects/');
      await openEdaProjectCreateForm(page);
      await optionsResponse;

      const nameInput = page.getByRole('textbox', { name: 'Name', exact: true });
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
