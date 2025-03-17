import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../../../../commands/clickPageAction';
import { clickTableRow } from '../../../../commands/clickTableRow';
import { createE2EName } from '../../../../commands/createE2EName';
import { navigateTo } from '../../../../commands/navigateTo';
import { confirmAndAssertDeletion } from '../../../../commands/confirmAndAssertDeletion';

export async function createInstanceGroup(options: { name?: string }, page: Page) {
  const instanceGroupName = options.name ?? createE2EName('instanceGroup');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
  await page.getByLabel('dropdown toggle', { exact: true }).click();
  await page.getByRole('menuitem', { name: 'Create instance group' }).click();
  await page.getByPlaceholder('Enter instance group name').fill(instanceGroupName);
  await page.getByRole('button', { name: 'Create instance group' }).click();
  await expect(page.getByRole('heading', { name: instanceGroupName, exact: true })).toBeVisible();
  await expect(page.locator('#name')).toContainText(instanceGroupName);
  return instanceGroupName;
}

export async function deleteInstanceGroup(instanceGroupName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
  await clickTableRow({ text: instanceGroupName }, page);
  await clickPageAction('Delete instance group', page);
  await confirmAndAssertDeletion(page);
}
