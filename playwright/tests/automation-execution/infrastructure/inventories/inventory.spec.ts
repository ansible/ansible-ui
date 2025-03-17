import { expect, test } from '@playwright/test';
import { clearTableFilters } from '../../../../commands/clearTableFilters';
import { clickPageAction } from '../../../../commands/clickPageAction';
import { clickTableRowAction } from '../../../../commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../commands/createE2EName';
import { selectTableFilter } from '../../../../commands/selectTableFilter';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import { createInstanceGroup, deleteInstanceGroup } from '../instance-groups/instance-group-utils';
import {
  createInventory,
  createInventorySource,
  deleteInventory,
  deleteInventorySource,
} from './inventory-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test(
  'inventory - can create an inventory, assert info on details page, and delete inventory',
  { tag: ['@not_mock', '@compare'] },
  async ({ page }) => {
    const inventoryName = await createInventory({}, page);
    await expect(page.locator('#name')).toContainText(inventoryName);
    await expect(page.locator('#enabled-options')).toContainText('Prevent instance group fallback');
    // await expect(page.locator('#opa-policy')).toContainText('test/opa');
    await deleteInventory(inventoryName, page);
  }
);

test('inventory source - create and delete', { tag: ['@not_mock'] }, async ({ page }) => {
  const { inventorySourceName, inventoryName } = await createInventorySource({}, page);
  await deleteInventorySource(inventoryName, inventorySourceName, page);
});

test(
  'inventory - can edit an inventory from the list view and assert info on details page',
  { tag: ['@not_mock', '@compare'] },
  async ({ page }) => {
    const instanceGroupName = await createInstanceGroup({}, page);
    const inventoryName = await createInventory({}, page);
    await page.getByRole('tab', { name: 'Back to Inventories' }).click();
    await clickTableRowAction(
      {
        text: inventoryName,
        action: 'Edit inventory',
      },
      page
    );
    await page.getByLabel('Instance groups').click();
    await page.getByLabel('Search input').click();
    await page.getByLabel('Search input').fill(instanceGroupName);
    await page.getByLabel(instanceGroupName).check();
    // await page.getByRole('textbox', { name: 'OPA policy' }).click();
    // await page.getByRole('textbox', { name: 'OPA policy' }).fill('test/opaEdited');
    await page.getByRole('button', { name: 'Save inventory' }).click();
    await expect(page.getByLabel('Label group category').getByRole('link')).toContainText(
      instanceGroupName
    );
    // await expect(page.locator('#opa-policy')).toContainText('test/opaEdited');
    await deleteInventory(inventoryName, page);
    await deleteInstanceGroup(instanceGroupName, page);
  }
);

// The lines commented out in this test are causing failures on current deployments.
// Re-enable these lines when we have a build with OPA policy enabled.
test(
  'inventory - can edit an inventory from the details view and assert info on details page',
  { tag: ['@not_mock', '@compare'] },
  async ({ page }) => {
    const inventoryName = await createInventory({}, page);
    const labelName = createE2EName('label');
    await clickPageAction('Edit inventory', page);
    await page.getByPlaceholder('Select or create labels').click();
    await page.getByPlaceholder('Select or create labels').fill(labelName);
    await page.getByRole('option', { name: `Create "${labelName}"` }).click();
    await page.locator('.view-line').click();
    await page
      .getByRole('textbox', { name: 'Editor content' })
      .fill("remote_install_path: '/opt/my_app_config''");
    // await page.getByRole('textbox', { name: 'OPA policy' }).click();
    // await page.getByRole('textbox', { name: 'OPA policy' }).fill('test/opaEdited');
    await page.getByRole('button', { name: 'Save inventory' }).click();
    await expect(page.getByLabel('Label group category').getByRole('listitem')).toContainText(
      labelName
    );
    await expect(page.getByRole('code')).toContainText('remote_install_path: /opt/my_app_config');
    // await expect(page.locator('#opa-policy')).toContainText('test/opaEdited');
    await deleteInventory(inventoryName, page);
  }
);

test(
  'inventory - can copy an inventory on the details view and assert that the copy has been successful',
  { tag: ['@not_mock', '@compare'] },
  async ({ page }) => {
    const inventoryName = await createInventory({}, page);
    await clickPageAction('Duplicate inventory', page);
    await expect(page.locator('h4')).toContainText(`Success alert:${inventoryName} duplicated.`);
    // Cleanup
    await page.getByRole('tab', { name: 'Back to Inventories' }).click();
    await clearTableFilters(page);
    await selectTableFilter('Search', page);
    await page.getByPlaceholder('Enter search').fill(inventoryName);
    await page.getByPlaceholder('Enter search').press('Enter');
    await expect(async () => {
      const rowCount = await page.locator('tbody tr').count();
      expect(rowCount).toBe(2);
    }).toPass();
    await expect(page.locator('tbody')).toContainText(inventoryName);
    await page.getByLabel('Select all').check();
    await page.getByLabel('toolbar actions').click();
    await page.getByRole('menuitem', { name: 'Delete inventories' }).click();
    await confirmAndAssertDeletion(page);
  }
);

test(
  'inventory - can copy an inventory on the list view and assert that the copy has been successful',
  { tag: ['@not_mock', '@compare'] },
  async ({ page }) => {
    const inventoryName = await createInventory({}, page);
    await page.getByRole('tab', { name: 'Back to Inventories' }).click();
    await clickTableRowAction(
      {
        text: inventoryName,
        action: 'Duplicate inventory',
        inKebab: true,
      },
      page
    );
    await expect(page.locator('h4')).toContainText(`Success alert:${inventoryName} duplicated.`);
    await clearTableFilters(page);
    await selectTableFilter('Search', page);
    await page.getByPlaceholder('Enter search').fill(inventoryName);
    await page.getByPlaceholder('Enter search').press('Enter');
    await expect(async () => {
      const rowCount = await page.locator('tbody tr').count();
      expect(rowCount).toBe(2);
    }).toPass();
    await expect(page.locator('tbody')).toContainText(inventoryName);
    await page.getByLabel('Select all').check();
    await page.getByLabel('toolbar actions').click();
    await page.getByRole('menuitem', { name: 'Delete inventories' }).click();
    await confirmAndAssertDeletion(page);
  }
);

test(
  'inventory - can delete an inventory from the inventory list row item',
  { tag: ['@not_mock', '@compare'] },
  async ({ page }) => {
    const inventoryName = await createInventory({}, page);
    await page.getByRole('tab', { name: 'Back to Inventories' }).click();
    await clickTableRowAction(
      { text: inventoryName, filterLabel: 'Name', action: 'Delete inventory', clearFilters: false },
      page
    );
    await confirmAndAssertDeletion(page);
  }
);

test(
  'inventory - can delete an inventory from the inventory list toolbar',
  { tag: ['@not_mock', '@compare'] },
  async ({ page }) => {
    const inventoryName = await createInventory({}, page);
    await page.getByRole('tab', { name: 'Back to Inventories' }).click();
    await page.getByPlaceholder('Enter search').click();
    await page.getByPlaceholder('Enter search').fill(`${inventoryName}`);
    await page.waitForResponse('**/inventories/?search=**', { timeout: 5000 });
    await page.getByLabel('Select all').first().check();
    await page.getByLabel('toolbar actions').click();
    await page.getByRole('menuitem', { name: 'Delete inventories' }).click();
    await confirmAndAssertDeletion(page);
  }
);

test(
  'inventory - can bulk delete inventories from the list view and verify deletion',
  { tag: ['@not_mock', '@compare'] },
  async ({ page }) => {
    const inventoryNameA = await createInventory({}, page);
    const inventoryNameB = await createInventory({}, page);
    await page.getByRole('tab', { name: 'Back to Inventories' }).click();
    await page.getByPlaceholder('Enter search').click();
    await page.getByPlaceholder('Enter search').fill(`${inventoryNameA}`);
    await page.waitForResponse('**/inventories/?search=**', { timeout: 5000 });
    await page.getByLabel('Select all').first().check();
    await clearTableFilters(page);
    await page.getByPlaceholder('Enter search').click();
    await page.getByPlaceholder('Enter search').fill(`${inventoryNameB}`);
    await page.waitForResponse('**/inventories/?search=**', { timeout: 5000 });
    await page.getByLabel('Select all').first().check();
    await clearTableFilters(page);
    await page.getByLabel('toolbar actions').click();
    await page.getByRole('menuitem', { name: 'Delete inventories' }).click();
    await confirmAndAssertDeletion(page);
  }
);

test(
  'inventory - can create, edit a smart inventory, assert info on details page, and delete inventory',
  { tag: ['@not_mock', '@compare'] },
  async ({ page }) => {
    const smartInvName = await createInventory({ type: 'smart' }, page);
    await page.getByRole('button', { name: 'Edit inventory' }).click();
    await page.getByPlaceholder('Enter inventory name').fill(`${smartInvName} edited`);
    await page.getByPlaceholder('Enter description').fill('edited');
    await page.getByPlaceholder('Enter smart host filter').fill('name__icontains=RedHat_edited');
    await page.getByRole('button', { name: 'Save inventory' }).click();
    await expect(page.locator('#description')).toContainText('edited');
    await expect(page.locator('#name')).toContainText(`${smartInvName} edited`);
    await expect(page.getByLabel('Label group category').getByRole('listitem')).toContainText(
      'name__icontains=RedHat_edited'
    );
    await clickPageAction('Delete inventory', page);
    await confirmAndAssertDeletion(page);
  }
);
