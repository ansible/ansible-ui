import { Page, expect } from '@playwright/test';
import { clickTableRow } from '../../../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../../commands/createE2EName';
import { getTableRow } from '../../../../../commands/getTableRow';
import { navigateTo } from '../../../../../commands/navigateTo';

export async function navigateToInventoryHostsTab(inventoryName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await clickTableRow({ text: inventoryName }, page);
  await page.getByRole('tab', { name: 'Hosts' }).click();
}

export async function navigateToHostDetails(inventoryName: string, hostName: string, page: Page) {
  await navigateToInventoryHostsTab(inventoryName, page);
  await clickTableRow({ text: hostName }, page);
  await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();
}

export async function navigateToHostGroupsTab(inventoryName: string, hostName: string, page: Page) {
  await navigateToHostDetails(inventoryName, hostName, page);
  await page.getByRole('tab', { name: 'Groups' }).click();
}

export async function createHostInInventory(
  inventoryName: string,
  options: {
    name?: string;
    description?: string;
    variables?: string;
  },
  page: Page
) {
  const hostName = options.name ?? createE2EName('host');
  await navigateToInventoryHostsTab(inventoryName, page);
  await page.getByText('Create host', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Create host', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(hostName);
  if (options.description) {
    await page.getByRole('textbox', { name: 'Description', exact: true }).fill(options.description);
  }
  if (options.variables) {
    await page.locator('.view-line').click();
    await page.getByRole('textbox', { name: 'Editor content' }).fill(options.variables);
  }
  await page.getByRole('button', { name: 'Create host', exact: true }).click();
  await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();
  await expect(page.locator('#name')).toContainText(hostName);
  if (options.description) {
    await expect(page.locator('#description')).toContainText(options.description);
  }
  if (options.variables) {
    await expect(page.getByRole('code')).toContainText(options.variables);
  }
  return hostName;
}

export async function deleteHostFromListView(inventoryName: string, hostName: string, page: Page) {
  await navigateToInventoryHostsTab(inventoryName, page);
  const hostRow = await getTableRow(page, hostName);
  await hostRow.getByRole('button', { name: 'kebab dropdown toggle' }).click();
  await page.getByRole('menuitem', { name: 'Delete host' }).click();
  await confirmAndAssertDeletion(page);
}

export async function bulkDeleteHostsInInventory(inventoryName: string, page: Page) {
  await navigateToInventoryHostsTab(inventoryName, page);
  await page.getByLabel('Select all').check();
  await page.getByLabel('toolbar actions').click();
  await page.getByRole('menuitem', { name: 'Delete hosts' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Permanently delete hosts')).toBeVisible();
  await dialog.locator('#confirm').click();
  await page.getByRole('button', { name: 'Delete hosts', exact: true }).click();

  // Wait for dialog to close and page to update
  await expect(dialog).not.toBeVisible({ timeout: 10000 });

  // Wait for the empty state message to appear
  await expect(page.getByText('There are currently no hosts added to this inventory.')).toBeVisible(
    { timeout: 15000 }
  );
}
