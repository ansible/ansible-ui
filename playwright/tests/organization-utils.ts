import { Page, expect } from '@playwright/test';
import { clearTableFilters } from '../commands/clearTableFilters';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { createE2EName } from '../commands/createE2EName';
import { filterTableByText } from '../commands/filterTableByText';
import { navigateTo } from '../commands/navigateTo';

export async function createOrganization(page: Page, options: { organizationName?: string } = {}) {
  await navigateTo(page, 'Access Management', 'Organizations');
  await page.getByRole('link', { name: 'Create organization', exact: true }).click();
  const organizationName = options.organizationName ?? 'e2e-' + createE2EName();
  await page.getByLabel('Name').fill(organizationName);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
  return organizationName;
}
export async function deleteOrganization(organizationName: string, page: Page) {
  await navigateTo(page, 'Access Management', 'Organizations');
  await clearTableFilters(page);
  await filterTableByText(organizationName, page);
  await clickTableRow(organizationName, page);
  await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
  await clickPageAction('Delete organization', page);
  await page.locator('#confirm').click();
  await page.locator('#submit').click();
  await expect(page.getByRole('heading', { name: 'Organizations', exact: true })).toBeVisible();
}
