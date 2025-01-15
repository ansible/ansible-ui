import { expect } from '@playwright/test';
import { Page } from 'playwright-core';
import { clearTableFilters } from '../../../commands/clearTableFilters';
import { clickPageAction } from '../../../commands/clickPageAction';
import { clickTableRow } from '../../../commands/clickTableRow';
import { createE2EName } from '../../../commands/createE2EName';
import { filterTableByText } from '../../../commands/filterTableByText';
import { navigateTo } from '../../../commands/navigateTo';

export async function createUser(
  options: { teamName?: string; organizationName?: string },
  page: Page
) {
  await navigateTo(page, 'Access Management', 'Users');
  await page.getByRole('link', { name: 'Create user', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Create user', exact: true })).toBeVisible();
  const userName = options.teamName ?? createE2EName();
  await page.getByLabel('Username').fill(userName);
  const password = 'password';
  await page.getByLabel('Password *', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create user', exact: true }).click();
  await expect(page.getByRole('heading', { name: userName, exact: true })).toBeVisible();
  return userName;
}

export async function deleteUser(userName: string, page: Page) {
  await navigateTo(page, 'Access Management', 'Users');
  await clearTableFilters(page);
  await filterTableByText(userName, page);
  await clickTableRow(userName, page);
  await expect(page.getByRole('heading', { name: userName, exact: true })).toBeVisible();
  await clickPageAction('Delete user', page);
  await page.locator('#confirm').click();
  await page.locator('#submit').click();
  await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible();
}
