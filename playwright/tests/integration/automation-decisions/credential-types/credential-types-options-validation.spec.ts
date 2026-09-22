import { isSaaS } from '@ansible/playwright/commands/getTopologyType';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  assertInvalidInputShowsPatternDescription,
  assertValidInputNoPatternError,
  openEdaCredentialTypeCreateForm,
  requireEdaOptionsFieldPattern,
  waitForEdaOptionsResponse,
} from '@ansible/playwright/utils/optionsDrivenValidation';
import { test } from '@playwright/test';

test.beforeAll(() => {
  if (isSaaS()) {
    test.skip(true, 'EDA credential types not available on SaaS deployments');
  }
});

test.beforeEach(setupBefore({ path: '/decisions/infrastructure/credential-types' }));
test.afterEach(setupAfter);

/**
 * Representative EDA access create form with Monaco input/injector configuration fields.
 */
test.describe('EDA credential type OPTIONS-driven validation (create form)', () => {
  test(
    'should show OPTIONS-driven validation error on blur for name field',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireEdaOptionsFieldPattern(
        page,
        'credential-types/',
        'name',
        testInfo
      );

      const optionsResponse = waitForEdaOptionsResponse(page, 'credential-types/');
      await openEdaCredentialTypeCreateForm(page);
      await optionsResponse;

      const nameInput = page.getByPlaceholder('Enter credential type name');
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
      const nameField = await requireEdaOptionsFieldPattern(
        page,
        'credential-types/',
        'name',
        testInfo
      );

      await openEdaCredentialTypeCreateForm(page);

      const nameInput = page.getByPlaceholder('Enter credential type name');
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
