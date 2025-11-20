import { expect, test } from '@playwright/test';
import { navigateTo } from '../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import {
  createAwxCredential,
  deleteAwxCredential,
} from '../infrastructure/credentials/credential-utils';
import { createInventory, deleteInventory } from '../infrastructure/inventories/inventory-utils';

test.describe('Job Template Form - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await setupBefore({ path: '/' })({ page });
  });

  test.afterEach(async ({ page }) => {
    await setupAfter({ page });
  });

  test(
    'cannot create a job template with more than one machine credential',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);

      const inventoryName = await createInventory({}, page);
      const machineCredential1 = await createAwxCredential({ credentialType: 'Machine' }, page);
      const machineCredential2 = await createAwxCredential({ credentialType: 'Machine' }, page);

      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByRole('button', { name: 'dropdown toggle', exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create job template' }).click();

      await page.getByPlaceholder('Enter job template name').fill('Test Job Template');
      await page.getByRole('button', { name: 'Inventory' }).click();
      await page.getByRole('option', { name: inventoryName, exact: true }).click();

      const projectName = 'Demo Project';
      await page.locator('#project-select').click();
      await page.getByRole('option', { name: projectName }).click();

      // Verify playbook was auto-selected since Demo Project has only one playbook
      await expect(page.getByTestId('playbook-form-group').locator('input')).toHaveValue(
        'hello_world.yml'
      );

      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(machineCredential1);
      await page.getByRole('checkbox', { name: `${machineCredential1} | Machine` }).check();
      await page.getByRole('textbox', { name: 'Search input' }).fill(machineCredential2);
      await page.getByRole('checkbox', { name: `${machineCredential2} | Machine` }).check();

      // Try to submit the form - validation error should prevent submission
      await page.getByRole('button', { name: 'Create job template' }).click();

      // Validation error should appear specifically under the credential field, not as a generic form error
      const credentialFormGroup = page.getByTestId('credential-form-group');
      await expect(credentialFormGroup).toBeVisible();
      await expect(
        credentialFormGroup.getByText(
          'Cannot assign multiple credentials of the same type. Duplicated credential types are: Machine'
        )
      ).toBeVisible({ timeout: 10000 });

      await deleteAwxCredential(machineCredential1, page);
      await deleteAwxCredential(machineCredential2, page);
      await deleteInventory(inventoryName, page);
    }
  );

  test(
    'cannot create a job template with more than one vault credential with same vault_id',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);

      const inventoryName = await createInventory({}, page);
      const vaultCredential1 = await createAwxCredential(
        {
          credentialType: 'Vault',
          vaultId: 'test-vault-1',
        },
        page
      );
      const vaultCredential2 = await createAwxCredential(
        {
          credentialType: 'Vault',
          vaultId: 'test-vault-1',
        },
        page
      );

      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByRole('button', { name: 'dropdown toggle', exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create job template' }).click();

      await page.getByPlaceholder('Enter job template name').fill('Test Job Template');
      await page.getByRole('button', { name: 'Inventory' }).click();
      await page.getByRole('option', { name: inventoryName, exact: true }).click();

      const projectName = 'Demo Project';
      await page.locator('#project-select').click();
      await page.getByRole('option', { name: projectName }).click();

      // Verify playbook was auto-selected since Demo Project has only one playbook
      await expect(page.getByTestId('playbook-form-group').locator('input')).toHaveValue(
        'hello_world.yml'
      );

      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(vaultCredential1);
      await page.getByRole('checkbox', { name: `${vaultCredential1} | Vault` }).check();
      await page.getByRole('textbox', { name: 'Search input' }).fill(vaultCredential2);
      await page.getByRole('checkbox', { name: `${vaultCredential2} | Vault` }).check();

      // Try to submit the form - validation error should prevent submission
      await page.getByRole('button', { name: 'Create job template' }).click();

      // Validation error should appear specifically under the credential field, not as a generic form error
      const credentialFormGroup = page.getByTestId('credential-form-group');
      await expect(credentialFormGroup).toBeVisible();
      await expect(
        credentialFormGroup.getByText(
          'Cannot assign multiple vault credentials of the same vault id.'
        )
      ).toBeVisible({ timeout: 10000 });

      await deleteAwxCredential(vaultCredential1, page);
      await deleteAwxCredential(vaultCredential2, page);
      await deleteInventory(inventoryName, page);
    }
  );
});
