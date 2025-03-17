import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../../../../commands/clickPageAction';
import { clickTableRow } from '../../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../commands/createE2EName';
import { navigateTo } from '../../../../commands/navigateTo';

export async function createHost(options: { name?: string; inventoryName?: string }, page: Page) {
  const hostName = options.name ?? createE2EName('host');
  const inventoryName = options.inventoryName ?? 'Demo Inventory';
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Hosts');
  await page.getByText('Create host', { exact: true }).click();
  await page.getByPlaceholder('Enter host name').fill(hostName);
  await page.getByLabel('Inventory *').click();
  await page.getByLabel('Search input').fill(inventoryName);
  await page.getByRole('option', { name: inventoryName }).click();
  await page.getByLabel('Enabled').click();
  await page.getByRole('button', { name: 'Create host' }).click();
  await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();
  await expect(page.locator('#name')).toContainText(hostName);
  await expect(page.locator('#inventory')).toContainText(inventoryName);
  return hostName;
}

export async function deleteHost(hostName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Hosts');
  await clickTableRow({ text: hostName }, page);
  await clickPageAction('Delete host', page);
  await confirmAndAssertDeletion(page);
}
