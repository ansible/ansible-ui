import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { deleteResourceFromDetailsPage } from '@ansible/playwright/commands/deleteResourceFromDetailsPage';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from 'playwright/test';
import { CredentialType } from '@ansible/playwright/utils';

test.describe('Credential Types', { tag: ['@not_mock', '@local_debug'] }, () => {
  test.beforeEach(setupBefore({ path: '/execution/infrastructure/credential-types' }));
  test.afterEach(setupAfter);

  test.describe('Credential Types - Filtering', () => {
    test('can filter credential types by name', { tag: ['@not_mock'] }, async ({ page }) => {
      const credentialTypeName = await CredentialType.ui.create(page);

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
      await filterTable({ filterLabel: 'Name', filterValue: credentialTypeName }, page);

      // Should show at least 1 row (header) + 1 data row
      await expect(page.getByRole('row')).toHaveCount(2, { timeout: 10000 });
      await expect(page.getByRole('link', { name: credentialTypeName })).toBeVisible();

      await clearTableFilters(page);
      await deleteResourceFromDetailsPage(
        {
          resourceName: credentialTypeName,
          resourceType: 'credential type',
          navigationPath: ['Automation Execution', 'Infrastructure', 'Credential Types'],
        },
        page
      );
    });

    test('can filter credential types by description', { tag: ['@not_mock'] }, async ({ page }) => {
      const testDescription = `Unique Test Description ${Date.now()}`;
      const credentialTypeName = await CredentialType.ui.create(page, {
        description: testDescription,
      });

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');

      // Filter by description text (searches in description field, not displayed in table)
      await page.locator('#filter-input input[type="text"]').fill(testDescription);

      // Wait for filter to apply
      await page.waitForTimeout(1000);

      // Should show at least 1 matching result (the credential type we created)
      await expect(page.getByRole('link', { name: credentialTypeName })).toBeVisible();

      await clearTableFilters(page);
      await deleteResourceFromDetailsPage(
        {
          resourceName: credentialTypeName,
          resourceType: 'credential type',
          navigationPath: ['Automation Execution', 'Infrastructure', 'Credential Types'],
        },
        page
      );
    });

    test('can filter credential types by Created By', { tag: ['@not_mock'] }, async ({ page }) => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
      await filterTable({ filterLabel: 'Created by', filterValue: 'admin' }, page);

      // Should show results created by admin
      const rows = page.getByRole('row');
      await expect(rows).not.toHaveCount(1); // More than just header

      await clearTableFilters(page);
    });

    test('can filter credential types by Modified By', { tag: ['@not_mock'] }, async ({ page }) => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
      await filterTable({ filterLabel: 'Modified by', filterValue: 'admin' }, page);

      // Should show results modified by admin
      const rows = page.getByRole('row');
      await expect(rows).not.toHaveCount(1); // More than just header

      await clearTableFilters(page);
    });
  });

  test.describe('Credential Types - Navigation', () => {
    test(
      'can navigate to credential type details page and view credentials tab',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const credentialTypeName = await CredentialType.ui.create(page);

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
        await clickTableRow({ filterLabel: 'Name', text: credentialTypeName }, page);

        await expect(page).toHaveURL(/\/details$/);
        await expect(
          page.getByRole('heading', { name: credentialTypeName, exact: true })
        ).toBeVisible();

        await page.getByRole('tab', { name: 'Credentials' }).click();

        await expect(page.getByRole('tab', { name: 'Credentials' })).toHaveAttribute(
          'aria-selected',
          'true'
        );

        await deleteResourceFromDetailsPage(
          {
            resourceName: credentialTypeName,
            resourceType: 'credential type',
            navigationPath: ['Automation Execution', 'Infrastructure', 'Credential Types'],
          },
          page
        );
      }
    );
  });

  test.describe('Credential Types - Create Actions', () => {
    test(
      'can create a new credential type with no configs',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const credentialTypeName = await CredentialType.ui.create(page);

        await expect(
          page.getByRole('heading', { name: credentialTypeName, exact: true })
        ).toBeVisible();
        await expect(page).toHaveURL(/\/details$/);

        await deleteResourceFromDetailsPage(
          {
            resourceName: credentialTypeName,
            resourceType: 'credential type',
            navigationPath: ['Automation Execution', 'Infrastructure', 'Credential Types'],
          },
          page
        );
      }
    );

    test(
      'can create a credential type with input and injector configurations in JSON format',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const inputConfig = JSON.stringify({
          fields: [
            { id: 'username', type: 'string', label: 'Username' },
            { id: 'password', type: 'string', label: 'Password', secret: true },
          ],
        });

        const injectorConfig = JSON.stringify({
          env: {
            TEST_USERNAME: '{{ username }}',
            TEST_PASSWORD: '{{ password }}',
          },
        });

        const credentialTypeName = await CredentialType.ui.create(page, {
          inputConfiguration: inputConfig,
          injectorConfiguration: injectorConfig,
        });

        await expect(
          page.getByRole('heading', { name: credentialTypeName, exact: true })
        ).toBeVisible();
        await expect(page).toHaveURL(/\/details$/);

        await deleteResourceFromDetailsPage(
          {
            resourceName: credentialTypeName,
            resourceType: 'credential type',
            navigationPath: ['Automation Execution', 'Infrastructure', 'Credential Types'],
          },
          page
        );
      }
    );

    test(
      'creates a custom credential type with input and injector configurations in YAML mode in the Monaco editor',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const inputConfig = JSON.stringify({
          fields: [
            {
              id: 'api_key',
              type: 'string',
              label: 'API Key',
              secret: true,
            },
            {
              id: 'api_url',
              type: 'string',
              label: 'API URL',
              help_text: 'The base URL for the API endpoint',
            },
          ],
        });

        const injectorConfig = JSON.stringify({
          env: {
            MY_API_KEY: '{{ api_key }}',
            MY_API_URL: '{{ api_url }}',
          },
        });

        const credentialTypeName = await CredentialType.ui.create(page, {
          inputConfiguration: inputConfig,
          injectorConfiguration: injectorConfig,
        });

        await expect(
          page.getByRole('heading', { name: credentialTypeName, exact: true })
        ).toBeVisible();
        await expect(page).toHaveURL(/\/details$/);

        await deleteResourceFromDetailsPage(
          {
            resourceName: credentialTypeName,
            resourceType: 'credential type',
            navigationPath: ['Automation Execution', 'Infrastructure', 'Credential Types'],
          },
          page
        );
      }
    );
  });

  test.describe('Credential Types - Edit and Delete Actions', () => {
    test(
      'checks that editing a custom credential type which is being used by a credential and trying to add input/injector configs is not allowed',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        // Create a credential type without configs
        const credentialTypeName = await CredentialType.ui.create(page);

        // Create a credential using this credential type
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
        await page.getByText('Create credential').click();

        const credentialName = `E2E credential ${Date.now()}`;

        // Wait for form to load and fill credential name
        await expect(page.getByPlaceholder('Enter credential name')).toBeVisible();
        await page.getByPlaceholder('Enter credential name').fill(credentialName);

        // Select the credential type
        await page.getByRole('button', { name: 'Credential type' }).click();
        await expect(page.getByRole('textbox', { name: 'Search input' })).toBeVisible();
        await page.getByRole('textbox', { name: 'Search input' }).fill(credentialTypeName);

        // Wait for the option to appear and click it (use locator for more flexibility)
        const credTypeOption = page
          .locator(`[role="option"]:has-text("${credentialTypeName}")`)
          .first();
        await expect(credTypeOption).toBeVisible();
        await credTypeOption.click();

        await page.getByRole('button', { name: 'Create credential' }).click();
        await expect(
          page.getByRole('heading', { name: credentialName, exact: true })
        ).toBeVisible();

        // Now try to edit the credential type and add input configuration
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
        await clickTableRow({ filterLabel: 'Name', text: credentialTypeName }, page);
        await page.getByRole('button', { name: 'Edit credential type' }).click();

        await expect(
          page.getByRole('heading', { name: `Edit ${credentialTypeName}` })
        ).toBeVisible();

        // Try to add input configuration (Monaco editor)
        const inputConfig = JSON.stringify({
          fields: [{ id: 'api_key', type: 'string', label: 'API Key' }],
        });

        await page.locator('.view-lines').first().click();
        const inputEditor = page.locator('.monaco-editor').first().getByRole('textbox');
        await inputEditor.fill(inputConfig);

        await page.getByRole('button', { name: 'Save credential type' }).click();

        // Verify error message
        await expect(
          page.getByText(
            /Modifications to inputs are not allowed for credential types that are in use/
          )
        ).toBeVisible();

        // Cancel the edit
        await page.getByRole('button', { name: 'Cancel' }).click();

        // Cleanup: Delete the credential first, then the credential type
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
        await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
        await clickPageAction('Delete credential', page);
        await confirmAndAssertDeletion(page);

        await deleteResourceFromDetailsPage(
          {
            resourceName: credentialTypeName,
            resourceType: 'credential type',
            navigationPath: ['Automation Execution', 'Infrastructure', 'Credential Types'],
          },
          page
        );
      }
    );

    test(
      'checks that deleting a managed credential type is not allowed',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');

        // Try to select and delete Google Compute Engine (managed type)
        await selectTableRow({ filterLabel: 'Name', filterValue: 'Google Compute Engine' }, page);

        await page.getByRole('button', { name: 'Actions' }).click();
        await page.getByRole('menuitem', { name: 'Delete credential types' }).click();

        // Verify warning message
        await expect(
          page.getByText(
            /of the selected credential types cannot be deleted because (it is|they are) read-only/
          )
        ).toBeVisible();

        await page.getByRole('button', { name: 'Close' }).click();
      }
    );

    test(
      'can edit a credential type from the list row action and delete it using the kebab menu',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const credentialTypeName = await CredentialType.ui.create(page);

        // Edit the credential type
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
        await clickTableRow({ filterLabel: 'Name', text: credentialTypeName }, page);

        await clickPageAction('Edit credential type', page);
        await expect(
          page.getByRole('heading', { name: `Edit ${credentialTypeName}` })
        ).toBeVisible();

        const editedName = `${credentialTypeName} edited`;
        const editedDescription = 'This is a new description after editing';

        await page.getByPlaceholder('Enter credential type name').clear();
        await page.getByPlaceholder('Enter credential type name').fill(editedName);
        await page.getByPlaceholder('Enter description').clear();
        await page.getByPlaceholder('Enter description').fill(editedDescription);

        await page.getByRole('button', { name: 'Save credential type' }).click();

        await expect(page.getByRole('heading', { name: editedName, exact: true })).toBeVisible();
        await expect(page.getByTestId('description')).toContainText(editedDescription);

        // Delete using kebab menu from list
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
        await clickTableRowAction(
          {
            pageTitle: 'Credential Types',
            text: editedName,
            action: 'Delete credential type',
            inKebab: true,
          },
          page
        );
        await confirmAndAssertDeletion(page);
        await expect(page.getByText('No results found')).toBeVisible();
      }
    );

    test(
      'can edit and delete a credential type from the details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const credentialTypeName = await CredentialType.ui.create(page);

        // Navigate to details page
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
        await clickTableRow({ filterLabel: 'Name', text: credentialTypeName }, page);

        // Edit from details page
        await page.getByRole('button', { name: 'Edit credential type' }).click();
        await expect(
          page.getByRole('heading', { name: `Edit ${credentialTypeName}` })
        ).toBeVisible();

        const editedName = `${credentialTypeName} edited`;
        const editedDescription = 'This is a new description after editing';

        await page.getByPlaceholder('Enter credential type name').clear();
        await page.getByPlaceholder('Enter credential type name').fill(editedName);
        await page.getByPlaceholder('Enter description').clear();
        await page.getByPlaceholder('Enter description').fill(editedDescription);

        await page.getByRole('button', { name: 'Save credential type' }).click();

        await expect(page.getByRole('heading', { name: editedName, exact: true })).toBeVisible();
        await expect(page.getByTestId('description')).toContainText(editedDescription);

        // Delete from details page
        await clickPageAction('Delete credential type', page);
        await confirmAndAssertDeletion(page);

        await expect(page.getByRole('heading', { name: 'Credential Types' })).toBeVisible();
      }
    );

    test(
      'shows a bulk deletion dialog with warnings for managed credential types',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');

        // Select all credential types (including managed ones)
        await page.getByRole('checkbox', { name: 'Select all' }).check();

        await page.getByRole('button', { name: 'Actions' }).click();
        await page.getByRole('menuitem', { name: 'Delete credential types' }).click();

        // Verify warning about read-only types
        await expect(page.getByText(/cannot be deleted because they are read-only/)).toBeVisible();

        await page.getByRole('button', { name: 'Cancel' }).click();

        // Unselect all
        await page.getByRole('checkbox', { name: 'Select all' }).uncheck();
      }
    );

    test(
      'can delete a credential type from the list row action',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const credentialTypeName = await CredentialType.ui.create(page);

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
        await clickTableRowAction(
          {
            pageTitle: 'Credential Types',
            text: credentialTypeName,
            action: 'Delete credential type',
            inKebab: true,
          },
          page
        );
        await confirmAndAssertDeletion(page);

        await expect(page.getByText('No results found')).toBeVisible();
      }
    );

    test(
      'can bulk delete custom credential types from the list page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        // Create two credential types
        const credentialTypeName1 = await CredentialType.ui.create(page);
        const credentialTypeName2 = await CredentialType.ui.create(page);

        // Bulk delete both (confirmAndAssertDeletion verifies successful deletion)
        await CredentialType.ui.bulkDelete(page, [credentialTypeName1, credentialTypeName2]);
      }
    );
  });
});
