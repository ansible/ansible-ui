import { Page, expect } from '@playwright/test';
import { clearTableFilters } from '../commands/clearTableFilters';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { createE2EName } from '../commands/createE2EName';
import { filterTableBySelect } from '../commands/filterTableBySelect';
import { navigateTo } from '../commands/navigateTo';

export async function createInventory(options: { name?: string }, page: Page) {
  const inventoryName = options.name ?? createE2EName('inventory');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await page.getByLabel('dropdown toggle', { exact: true }).click();
  await page.getByRole('menuitem', { name: 'Create inventory' }).click();
  await page.getByPlaceholder('Enter inventory name').fill(inventoryName);
  await page.getByLabel('Organization *').click();
  await page.getByLabel('Search input').fill('Default');
  await page.getByRole('option', { name: 'Default' }).click();
  await page.getByRole('button', { name: 'Create inventory' }).click();
  await expect(page.getByRole('heading').first()).toContainText(inventoryName);
  await expect(page.locator('#name')).toContainText(inventoryName);
  return inventoryName;
}

export async function deleteInventory(inventoryName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await clearTableFilters(page);
  await filterTableBySelect(inventoryName, page);
  await clickTableRow(inventoryName, page);
  await expect(page.getByRole('heading', { name: inventoryName, exact: true })).toBeVisible();
  await clickPageAction('Delete inventory', page);
  await page.locator('#confirm').click();
  await page.locator('#submit').click();
  await expect(page.getByRole('heading', { name: 'Inventories', exact: true })).toBeVisible();
}
