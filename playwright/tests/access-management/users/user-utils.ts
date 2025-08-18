import { expect } from '@playwright/test';
import { Page } from 'playwright-core';
import { clickPageAction } from '../../../commands/clickPageAction';
import { clickTableRow } from '../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../commands/createE2EName';
import { navigateTo } from '../../../commands/navigateTo';

export async function createUser(
  options: { userName?: string; organizationName?: string },
  page: Page
) {
  await navigateTo(page, 'Access Management', 'Users');
  await expect(page.getByText('Create user', { exact: true })).toBeVisible();
  await page.getByText('Create user', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Create user', exact: true })).toBeVisible();
  const userName = options.userName ?? createE2EName('user', { noWhitespace: true });
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
  await clickTableRow({ filterLabel: 'Username', text: userName }, page);
  await clickPageAction('Delete user', page);
  await confirmAndAssertDeletion(page);
}
