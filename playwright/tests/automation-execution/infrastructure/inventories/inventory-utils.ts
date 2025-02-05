import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../../../../commands/clickPageAction';
import { clickTableRowWithFilter } from '../../../../commands/clickTableRow';
import { createE2EName } from '../../../../commands/createE2EName';
import { navigateTo } from '../../../../commands/navigateTo';

export async function createInventory(options: { name?: string; type?: string }, page: Page) {
  const inventoryName = options.name ?? createE2EName('inventory');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await page.getByLabel('dropdown toggle', { exact: true }).click();
  await page
    .getByRole('menuitem', {
      name: options.type === 'smart' ? 'Create smart inventory' : 'Create inventory',
    })
    .click();
  if (options.type === 'smart') {
    const smartHostFilterVal = 'name__icontains=RedHat';
    await page.getByPlaceholder('Enter smart host filter').click();
    await page.getByPlaceholder('Enter smart host filter').fill(`${smartHostFilterVal}`);
  }
  await page.getByPlaceholder('Enter inventory name').fill(inventoryName);
  await page.getByLabel('Organization *').click();
  await page.getByLabel('Search input').fill('Default');
  await page.getByRole('option', { name: 'Default' }).click();
  if (options.type !== 'smart') {
    await page.getByLabel('Prevent instance group').check();
  }
  await page.getByRole('button', { name: 'Create inventory' }).click();
  await expect(page.getByRole('heading', { name: inventoryName, exact: true })).toBeVisible();
  await expect(page.locator('#name')).toContainText(inventoryName);
  return inventoryName;
}

export async function deleteInventory(inventoryName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await clickTableRowWithFilter(inventoryName, page);
  await clickPageAction('Delete inventory', page);
  await page.locator('#confirm').click();
  await page.locator('#submit').click();
  await expect(page.getByRole('heading', { name: 'Inventories', exact: true })).toBeVisible();
}
