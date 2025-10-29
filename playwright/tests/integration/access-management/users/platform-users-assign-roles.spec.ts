import { expect, test } from '@playwright/test';
import { selectTableFilter } from '@ansible/playwright/commands/selectTableFilter';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  createInventory,
  deleteInventory,
} from '../../automation-execution/infrastructure/inventories/inventory-utils';
import { createUser, deleteUser } from './user-utils';

test.beforeEach(setupBefore({ path: '/access/users' }));
test.afterEach(setupAfter);

test('should assign a user role', { tag: ['@not_mock'] }, async ({ page }) => {
  const username = await createUser({}, page);
  const inventory = await createInventory({}, page);
  await page.getByRole('link', { name: 'Users' }).click();
  await selectTableFilter('Username', page);
  await page.getByPlaceholder('contains').fill(username);
  await page.getByPlaceholder('contains').press('Enter');
  await expect(page.locator('tbody')).toContainText(username);
  await page.getByRole('link', { name: username }).click();
  await page.getByRole('tab', { name: 'Roles' }).click();
  await page.getByRole('button', { name: 'Assign roles' }).click();
  await expect(page.locator('h1')).toContainText('Assign roles');
  await page.getByRole('textbox', { name: 'Type to filter' }).click();
  await page.getByRole('option', { name: 'Inventory' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).fill(inventory);
  await page.getByRole('button', { name: 'apply filter' }).click();
  await page.getByRole('checkbox', { name: 'Select row' }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).fill('Inventory Admin');
  await page.getByRole('button', { name: 'apply filter' }).click();
  await page.getByRole('checkbox', { name: 'Select row' }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.locator('[data-cy="page-title"]')).toContainText(username);
  await expect(page.locator('tbody')).toContainText(inventory);
  await deleteUser(username, page);
  await deleteInventory(inventory, page);
});
