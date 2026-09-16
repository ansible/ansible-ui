import { awxAPI } from '@ansible/playwright/commands/apiClient';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';
import { Inventory, Organization } from '@ansible/playwright/utils';
import {
  assertInvalidInputShowsPatternDescription,
  assertValidInputNoPatternError,
  expectPatternDescriptionHidden,
  expectPatternDescriptionVisible,
  findValueFailingPattern,
  openInventoryCreateForm,
  requireOptionsFieldPattern,
  waitForAwxOptionsResponse,
} from '@ansible/playwright/utils/optionsDrivenValidation';
import { PlatformOrganization as OrganizationType } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

/**
 * Simple flat ``optionsUrl`` form (/inventories/). Covers client blur validation and
 * representative server-side submit behavior. Nested survey_spec: job-template-survey-options-validation.spec.ts.
 */
test.describe('Inventory OPTIONS-driven validation', () => {
  let organization: OrganizationType;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
  });

  test.afterEach(async ({ page }) => {
    await Organization.api.delete(page, organization.id).catch(() => {});
  });

  test(
    'shows OPTIONS-driven validation error on blur for name field',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireOptionsFieldPattern(page, '/inventories/', 'name', testInfo);

      const optionsResponse = waitForAwxOptionsResponse(page, '/inventories/');
      await openInventoryCreateForm(page);
      await optionsResponse;

      const nameInput = page.getByPlaceholder('Enter inventory name');
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
      const nameField = await requireOptionsFieldPattern(page, '/inventories/', 'name', testInfo);

      await openInventoryCreateForm(page);

      const nameInput = page.getByPlaceholder('Enter inventory name');
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

  test(
    'grandfathers existing invalid values on edit form until the field is dirty',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireOptionsFieldPattern(page, '/inventories/', 'name', testInfo);
      const legacyName = findValueFailingPattern(nameField.pattern!, nameField.flags);
      testInfo.skip(!legacyName, 'Could not derive a sample value that fails the OPTIONS pattern');

      let legacyInventoryId: number | undefined;
      try {
        const created = await awxAPI.post<{ id: number }>(page, 'inventories/', {
          name: legacyName!,
          description: 'OPTIONS grandfather E2E',
          organization: organization.id,
        });
        legacyInventoryId = created?.id;
      } catch {
        testInfo.skip(
          true,
          'Backend rejects inventory names that fail the OPTIONS pattern on POST (no legacy row to grandfather)'
        );
      }

      try {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ filterLabel: 'Name', text: legacyName! }, page);
        await page.getByRole('button', { name: 'Edit inventory', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Edit inventory' })).toBeVisible();

        const nameInput = page.getByLabel('Name', { exact: true });
        await expect(nameInput).toHaveValue(legacyName!);
        await expectPatternDescriptionHidden(page, nameField.pattern_description!);

        await nameInput.focus();
        await nameInput.blur();
        await expectPatternDescriptionHidden(page, nameField.pattern_description!);

        const dirtyInvalid =
          findValueFailingPattern(nameField.pattern!, nameField.flags) ?? legacyName!;
        await nameInput.fill(dirtyInvalid);
        await nameInput.blur();
        await expectPatternDescriptionVisible(page, nameField.pattern_description!);
      } finally {
        if (legacyInventoryId) {
          await Inventory.api.delete(page, legacyInventoryId).catch(() => {});
        }
      }
    }
  );

  test(
    'shows server-side validation error on submit for duplicate name',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      await requireOptionsFieldPattern(page, '/inventories/', 'name', testInfo);
      const validName = createE2EName('inv-dup');

      const existing = await Inventory.api.create(page, {
        name: validName,
        organization: organization.id,
      });

      try {
        await openInventoryCreateForm(page);

        const nameInput = page.getByPlaceholder('Enter inventory name');
        await nameInput.fill(validName);
        await singleSelectByLabel('Organization', organization.name, page);

        const postResponse = page.waitForResponse(
          (response) =>
            response.request().method() === 'POST' &&
            response.url().includes('/inventories/') &&
            response.status() === 400
        );
        await page.getByRole('button', { name: 'Create inventory' }).click();
        const response = await postResponse;
        expect(response.status()).toBe(400);
        await expect(
          page.getByText(/Inventory with this Name and Organization already exists/i)
        ).toBeVisible();
      } finally {
        await Inventory.api.delete(page, existing.id).catch(() => {});
      }
    }
  );

  test(
    'blocks submit when client-side validation has errors',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireOptionsFieldPattern(page, '/inventories/', 'name', testInfo);
      const invalidValue = findValueFailingPattern(nameField.pattern!, nameField.flags);
      testInfo.skip(!invalidValue, 'Could not derive a sample value that fails the OPTIONS pattern');

      await openInventoryCreateForm(page);

      const nameInput = page.getByPlaceholder('Enter inventory name');
      await nameInput.fill(invalidValue!);
      await nameInput.blur();
      await expectPatternDescriptionVisible(page, nameField.pattern_description!);

      let inventoryPostMade = false;
      const onRequest = (request: { method: () => string; url: () => string }) => {
        if (
          request.method() === 'POST' &&
          request.url().includes('/inventories/') &&
          !request.url().includes('inventory_sources')
        ) {
          inventoryPostMade = true;
        }
      };
      page.on('request', onRequest);

      await page.getByRole('button', { name: 'Create inventory' }).click();
      await expect(page.getByRole('heading', { name: 'Create inventory' })).toBeVisible();
      expect(inventoryPostMade).toBe(false);
      await expectPatternDescriptionVisible(page, nameField.pattern_description!);

      page.off('request', onRequest);
    }
  );
});
