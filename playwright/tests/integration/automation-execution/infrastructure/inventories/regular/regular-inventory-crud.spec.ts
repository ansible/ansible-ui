import { expect, test } from '@playwright/test';
import { clickPageAction } from '../../../../../../commands/clickPageAction';
import { clickTableRowAction } from '../../../../../../commands/clickTableRowAction';
import { clearTableFilters } from '../../../../../../commands/clearTableFilters';
import { confirmAndAssertDeletion } from '../../../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../../../commands/createE2EName';
import { fillMonacoEditor } from '../../../../../../commands/fillMonacoEditor';
import { setupAfter, setupBefore } from '../../../../../../commands/setup';
import { Organization, Inventory, InstanceGroup } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test.describe('Regular Inventory', () => {
  test(
    'can create inventory with all fields and delete from details',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const instanceGroupName = await InstanceGroup.ui.create(page);
      const organizationName = await Organization.ui.create(page);
      const labelName = createE2EName('label');
      const inventoryName = createE2EName('inventory');

      try {
        await Inventory.ui.create(page, {
          inventoryName,
          description: `${inventoryName} description`,
          organizationName,
          labelName,
          instanceGroupName,
          policyEnforcement: 'test/opa',
          variables: 'test_var: test_value',
          preventInstanceGroupFallback: true,
        });

        await expect(page.getByRole('heading', { name: inventoryName, exact: true })).toBeVisible();

        await expect(page.getByTestId('name')).toHaveText(inventoryName);
        await expect(page.getByTestId('description')).toHaveText(`${inventoryName} description`);
        await expect(page.getByTestId('type')).toHaveText('Inventory');
        await expect(page.getByTestId('organization')).toHaveText(organizationName);
        await expect(page.getByTestId('policy-enforcement')).toHaveText('test/opa');
        await expect(page.getByTestId('total-hosts')).toHaveText('0');
        await expect(page.getByTestId('instance-groups')).toHaveText(instanceGroupName);
        await expect(page.getByTestId('labels')).toHaveText(labelName);
        await expect(page.getByTestId('enabled-options')).toContainText(
          'Prevent instance group fallback'
        );
        await expect(page.getByTestId('variables')).toContainText('test_var: test_value');

        await clickPageAction('Delete inventory', page);
        await confirmAndAssertDeletion(page);

        await expect(page.getByRole('heading', { name: 'Inventories', exact: true })).toBeVisible();
      } finally {
        await InstanceGroup.ui.delete(page, instanceGroupName);
        await Organization.ui.delete(page, organizationName);
      }
    }
  );

  test(
    'can edit inventory from details view and list view',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const TEST_VAR_EDITED = 'test_var: test_value_edited';
      const organizationName = await Organization.ui.create(page);
      const inventoryName = await Inventory.ui.create(page, { organizationName });
      const editedInventoryName = `edited-${inventoryName}`;

      try {
        await clickPageAction('Edit inventory', page);
        await expect(
          page.getByRole('heading', { name: `Edit ${inventoryName}`, exact: true })
        ).toBeVisible();

        await fillMonacoEditor(page, TEST_VAR_EDITED);
        await page.getByRole('button', { name: 'Save inventory' }).click();

        await expect(page.getByTestId('name')).toHaveText(inventoryName);
        await expect(page.getByTestId('variables')).toContainText(TEST_VAR_EDITED);

        await page.getByRole('tab', { name: 'Back to Inventories' }).click();
        await clickTableRowAction(
          {
            text: inventoryName,
            action: 'Edit inventory',
          },
          page
        );

        await page.getByRole('textbox', { name: 'Name' }).fill(editedInventoryName);
        await page.getByRole('button', { name: 'Save inventory' }).click();

        await expect(page.getByRole('heading', { name: editedInventoryName })).toBeVisible();
        await expect(page.getByTestId('name')).toHaveText(editedInventoryName);
      } finally {
        try {
          await Inventory.ui.delete(page, editedInventoryName);
        } catch {
          await Inventory.ui.delete(page, inventoryName);
        }
        await Organization.ui.delete(page, organizationName);
      }
    }
  );

  test(
    'can duplicate inventory from details view and list view',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await Organization.ui.create(page);
      const inventoryName = await Inventory.ui.create(page, { organizationName });

      try {
        await clickPageAction('Duplicate inventory', page);
        await expect(page.locator('h4')).toContainText(
          `Success alert:${inventoryName} duplicated.`
        );

        await page.getByRole('tab', { name: 'Back to Inventories' }).click();
        await clearTableFilters(page);
        await page.getByPlaceholder('Enter search').fill(inventoryName);
        await page.getByPlaceholder('Enter search').press('Enter');

        await expect(page.getByRole('list', { name: 'Search' })).toContainText(inventoryName);
        await expect(page.locator('tbody tr')).toHaveCount(2, { timeout: 10000 });

        const row = page.locator('tbody tr').filter({
          has: page.getByRole('link', { name: inventoryName, exact: true }),
        });
        await row.getByLabel('kebab dropdown toggle').click();
        await page.getByRole('menuitem', { name: 'Duplicate inventory' }).click();

        await expect(page.locator('h4')).toContainText(
          `Success alert:${inventoryName} duplicated.`
        );
        await expect(page.locator('tbody tr')).toHaveCount(3, { timeout: 10000 });

        await clearTableFilters(page);
        await page.getByPlaceholder('Enter search').fill(inventoryName);
        await page.getByPlaceholder('Enter search').press('Enter');
        await expect(page.getByRole('list', { name: 'Search' })).toContainText(inventoryName);

        await page.getByLabel('Select all').check();
        await page.getByLabel('toolbar actions').click();
        await page.getByRole('menuitem', { name: 'Delete inventories' }).click();
        await confirmAndAssertDeletion(page);
      } finally {
        await Organization.ui.delete(page, organizationName);
      }
    }
  );

  test(
    'can delete inventory from list via row action kebab menu',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await Organization.ui.create(page);
      const inventoryName = await Inventory.ui.create(page, { organizationName });

      try {
        await page.getByRole('tab', { name: 'Back to Inventories' }).click();
        await clickTableRowAction(
          {
            text: inventoryName,
            action: 'Delete inventory',
            inKebab: true,
          },
          page
        );

        await confirmAndAssertDeletion(page);
      } finally {
        await Organization.ui.delete(page, organizationName);
      }
    }
  );
});
