/** @deprecated Use InventoryGroup from '@ansible/playwright/utils' instead */

import { Page, expect } from '@playwright/test';
import { clickTableRow } from '../../../../../../commands/clickTableRow';
import { createE2EName } from '../../../../../../commands/createE2EName';
import { getTableRow } from '../../../../../../commands/getTableRow';
import { navigateTo } from '../../../../../../commands/navigateTo';

export async function createInventoryGroup(
  options: { inventoryName: string; groupName?: string; description?: string; variables?: string },
  page: Page
) {
  const groupName = options.groupName ?? createE2EName('group');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await clickTableRow({ text: options.inventoryName }, page);
  await page.getByRole('tab', { name: 'Groups' }).click();

  // Handle both link (empty state) and button (toolbar) for Create group
  const createGroupAction = page
    .getByRole('link', { name: 'Create group' })
    .or(page.getByRole('button', { name: 'Create group' }));
  await createGroupAction.click();

  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(groupName);
  if (options.description) {
    await page.getByRole('textbox', { name: 'Description' }).fill(options.description);
  }
  if (options.variables) {
    await page.getByRole('textbox', { name: 'Editor content' }).fill(options.variables);
  }
  await page.getByRole('button', { name: 'Create group' }).click();
  await expect(page.getByRole('heading', { name: groupName, exact: true })).toBeVisible();
  return groupName;
}

export async function createInventoryHost(
  options: { inventoryName: string; hostName?: string },
  page: Page
) {
  const hostName = options.hostName ?? createE2EName('host');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await clickTableRow({ text: options.inventoryName }, page);
  await page.getByRole('tab', { name: 'Hosts' }).click();
  await page.getByRole('link', { name: 'Create host' }).click();
  await page.getByTestId('name').fill(hostName);
  await page.getByRole('button', { name: 'Create host' }).click();
  await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();
  return hostName;
}

export async function deleteInventoryGroup(
  options: { inventoryName: string; groupName: string },
  page: Page
) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await clickTableRow({ text: options.inventoryName }, page);
  await page.getByRole('tab', { name: 'Groups' }).click();
  const groupRow = await getTableRow(page, options.groupName);
  await groupRow.getByRole('checkbox').check();
  await page.getByLabel('kebab dropdown toggle').click();
  await page.getByRole('menuitem', { name: 'Delete groups' }).click();
  await page.getByTestId('delete-groups-dialog-radio-delete').check();
  await page.getByTestId('delete-group-modal-delete-button').click();
  await expect(
    page.getByRole('heading', {
      name: 'There are currently no groups added to this inventory.',
    })
  ).toBeVisible();
}
