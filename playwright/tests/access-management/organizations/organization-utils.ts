import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../../../commands/clickPageAction';
import { clickTableRow } from '../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../commands/createE2EName';
import { navigateTo } from '../../../commands/navigateTo';

export async function createOrganization(page: Page, options: { organizationName?: string } = {}) {
  await navigateTo(page, 'Access Management', 'Organizations');
  await page.getByText('Create organization', { exact: true }).click();
  const organizationName = options.organizationName ?? createE2EName();
  await page.getByLabel('Name').fill(organizationName);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
  return organizationName;
}

export async function deleteOrganization(organizationName: string, page: Page) {
  await navigateTo(page, 'Access Management', 'Organizations');
  await clickTableRow({ text: organizationName }, page);
  await clickPageAction('Delete organization', page);
  await confirmAndAssertDeletion(page);
}
