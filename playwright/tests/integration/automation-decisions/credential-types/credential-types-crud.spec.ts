import type { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { isSaaS } from '@ansible/playwright/commands/getTopologyType';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { fillMonacoEditor } from '@ansible/playwright/commands/fillMonacoEditor';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { EdaCredentialType, Organization } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.beforeAll(() => {
  if (isSaaS()) {
    test.skip(true, 'EDA credential types not available on SaaS deployments');
  }
});

test.beforeEach(setupBefore({ path: '/decisions/infrastructure/credential-types' }));
test.afterEach(setupAfter);

test.describe('EDA Credential Types - CRUD Operations', () => {
  test('should create and edit a credential type', { tag: ['@not_mock'] }, async ({ page }) => {
    const name = createE2EName('credential_type');

    try {
      await test.step('Navigate and start creation', async () => {
        await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credential Types');
        await expect(
          page.getByRole('heading', { name: 'Credential Types', exact: true })
        ).toBeVisible();
        await page.getByText('Create credential type').click();
      });

      await test.step('Verify error on invalid input configuration', async () => {
        await page.getByPlaceholder('Enter credential type name').fill(name);
        await page.getByPlaceholder('Enter description').fill('temp');
        await fillMonacoEditor(
          page,
          'random',
          page.locator('#inputs').getByRole('textbox', { name: 'Editor content' })
        );
        await page.getByRole('button', { name: 'Create credential type' }).click();
        await expect(page.getByText('schema must be in dict format')).toBeVisible();
      });

      await test.step('Fill valid form with JSON inputs', async () => {
        await page.getByPlaceholder('Enter credential type name').clear();
        await page.getByPlaceholder('Enter credential type name').fill(name);
        await page.getByPlaceholder('Enter description').clear();
        await page.getByPlaceholder('Enter description').fill('This is a custom Credential Type.');
        await fillMonacoEditor(
          page,
          JSON.stringify({
            fields: [{ id: 'username', type: 'string', label: 'Username' }],
          }),
          page.locator('#inputs').getByRole('textbox', { name: 'Editor content' })
        );
      });

      await test.step('Generate extra vars and verify injectors', async () => {
        await expect(page.getByRole('button', { name: 'Generate extra vars' })).toBeVisible({
          timeout: 15000,
        });
        await page.getByRole('button', { name: 'Generate extra vars' }).click();
        await expect(page.locator('#injectors .view-lines')).not.toHaveText('', {
          timeout: 10000,
        });
      });

      await test.step('Submit and verify details page', async () => {
        await page.getByRole('button', { name: 'Create credential type' }).click();
        await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();

        await expect(page.locator('#name')).toContainText(name);
        await expect(page.locator('#description')).toContainText(
          'This is a custom Credential Type.'
        );
      });

      await test.step('Open edit form', async () => {
        await page.getByRole('button', { name: 'Edit credential type' }).click();
        await expect(page.getByRole('heading', { name: `Edit ${name}` })).toBeVisible();
      });

      await test.step('Modify name and description', async () => {
        await page.getByPlaceholder('Enter credential type name').clear();
        await page.getByPlaceholder('Enter credential type name').fill(name + ' Edited');
        await page.getByPlaceholder('Enter description').clear();
        await page.getByPlaceholder('Enter description').fill('Updated description');
      });

      await test.step('Save and verify changes', async () => {
        await page.getByRole('button', { name: 'Save credential type' }).click();
        await expect(
          page.getByRole('heading', { name: name + ' Edited', exact: true })
        ).toBeVisible();
        await expect(page.locator('#name')).toContainText(name + ' Edited');
        await expect(page.locator('#description')).toContainText('Updated description');
      });
    } finally {
      await EdaCredentialType.api.deleteByName(page, name + ' Edited');
      await EdaCredentialType.api.deleteByName(page, name);
    }
  });

  test('should bulk delete credential types', { tag: ['@not_mock'] }, async ({ page }) => {
    let credType1: Awaited<ReturnType<typeof EdaCredentialType.api.create>> | undefined;
    let credType2: Awaited<ReturnType<typeof EdaCredentialType.api.create>> | undefined;

    try {
      credType1 = await EdaCredentialType.api.create(page);
      credType2 = await EdaCredentialType.api.create(page);

      await test.step('Navigate to credential types list', async () => {
        await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credential Types');
        await expect(
          page.getByRole('heading', { name: 'Credential Types', exact: true })
        ).toBeVisible();
      });

      await test.step('Select first credential type', async () => {
        await filterTable(
          { filterLabel: 'Name', filterValue: credType1!.name, clearFilters: true },
          page
        );
        const row1 = page.getByRole('row', { name: credType1!.name });
        await expect(row1).toBeVisible();
        await row1.getByRole('checkbox', { name: 'Select row' }).check();
      });

      await test.step('Select second credential type', async () => {
        await filterTable(
          { filterLabel: 'Name', filterValue: credType2!.name, clearFilters: true },
          page
        );
        const row2 = page.getByRole('row', { name: credType2!.name });
        await expect(row2).toBeVisible();
        await row2.getByRole('checkbox', { name: 'Select row' }).check();
      });

      await test.step('Bulk delete via toolbar action', async () => {
        await page.getByRole('button', { name: 'toolbar actions' }).click();
        await page.getByRole('menuitem', { name: 'Delete credential types' }).click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.locator('#confirm').click();
        await dialog.getByRole('button', { name: 'Delete credential types', exact: true }).click();

        await expect(dialog.getByText('Success').first()).toBeVisible({ timeout: 30000 });
      });
    } finally {
      if (credType1) await EdaCredentialType.api.delete(page, credType1.id);
      if (credType2) await EdaCredentialType.api.delete(page, credType2.id);
    }
  });
});

test.describe('EDA Credential Types - Custom Field Rendering', () => {
  let organization: PlatformOrganization | undefined;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
  });

  test.afterEach(async ({ page }) => {
    if (organization) {
      await Organization.api.delete(page, organization.id);
    }
  });

  test(
    'should render custom credential type fields correctly in credential form',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credType = await EdaCredentialType.api.create(page, {
        inputs: {
          fields: [
            { id: 'checkbox_field', type: 'boolean', label: 'Checkbox' },
            {
              id: 'username',
              type: 'string',
              label: 'Username',
              default: 'default_value',
            },
            { id: 'required_field', type: 'string', label: 'Required Field' },
          ],
          required: ['required_field'],
        },
      });

      try {
        await test.step('Navigate to credential creation and select custom type', async () => {
          await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
          await expect(
            page.getByRole('heading', { name: 'Credentials', exact: true })
          ).toBeVisible();
          await page.getByText('Create credential').click();
          await page.getByPlaceholder('Enter credential name').fill(createE2EName('credential'));
          await page.getByRole('button', { name: 'Credential type' }).click();
          await page.getByRole('textbox', { name: 'Search input' }).fill(credType.name);
          await page.getByRole('option', { name: credType.name }).click();
        });

        await test.step('Verify boolean field renders as checkbox', async () => {
          const checkboxField = page.getByRole('checkbox', { name: 'Checkbox' });
          await expect(checkboxField).toBeVisible();
        });

        await test.step('Verify default value is pre-populated', async () => {
          const usernameField = page.getByRole('textbox', { name: 'Username' });
          await expect(usernameField).toHaveValue('default_value');
        });

        await test.step('Verify required field validation', async () => {
          await page.getByRole('button', { name: 'Create credential' }).click();
          await expect(page.getByText('Required Field is required.')).toBeVisible();
        });
      } finally {
        await EdaCredentialType.api.delete(page, credType.id);
      }
    }
  );
});
