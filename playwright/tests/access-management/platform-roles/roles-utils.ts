import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../../../commands/clickPageAction';
import { clickTableRow } from '../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../commands/createE2EName';
import { navigateTo } from '../../../commands/navigateTo';

export async function createRole(page: Page, resourceInput: string, roleName?: string) {
  await navigateTo(page, 'Access Management', 'Roles');
  await page.getByText('Create role', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Create role' })).toBeVisible();
  const roleNameInput = roleName ?? createE2EName();
  await page.getByLabel('Name').fill(roleNameInput);
  await page.getByText('Select resource', { exact: true }).click();
  await page.getByText('namespace', { exact: true }).click();
  await page.getByText('Select permissions', { exact: true }).click();
  await page.getByText('Can view namespace', { exact: true }).click();
  await page.getByRole('button', { name: 'Create role', exact: true }).click();
  await expect(page.getByRole('heading', { name: roleName, exact: true })).toBeVisible();
  await expect(page.locator('#name')).toHaveText(roleNameInput);
  await expect(page.locator('#components')).toHaveText('Automation Content');
  await expect(page.locator('#resource-type')).toHaveText(resourceInput);
  await expect(page.locator('#permissions')).toHaveText('galaxy.view_namespace');
  return roleNameInput;
}

export async function deleteRole(roleName: string, page: Page) {
  await navigateTo(page, 'Access Management', 'Roles');
  await clickTableRow({ text: roleName }, page);
  await clickPageAction('Delete role', page);
  await confirmAndAssertDeletion(page);
}
