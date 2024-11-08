import { expect, Page, test } from '@playwright/test';
import { clearTableFilters } from '../commands/clearTableFilters';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { createE2EName } from '../commands/createE2EName';
import { filterTableByText } from '../commands/filterTableByText';
import { navigateTo } from '../commands/navigateTo';
import { setupAfter, setupBefore } from '../commands/setup';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test('create and delete a team', { tag: ['@team'] }, async ({ page }) => {
  const teamName = await createTeam({}, page);
  await deleteTeam(teamName, page);
});

export async function createTeam(
  options: { teamName?: string; organizationName?: string },
  page: Page
) {
  await navigateTo(page, 'Access Management', 'Teams');
  await page.getByRole('link', { name: 'Create team', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Create team', exact: true })).toBeVisible();
  const teamName = options.teamName ?? createE2EName();
  await page.getByLabel('Name').fill(teamName);
  await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);
  await page.getByRole('button', { name: 'Create team', exact: true }).click();
  await expect(page.getByRole('heading', { name: teamName, exact: true })).toBeVisible();
  return teamName;
}

export async function deleteTeam(teamName: string, page: Page) {
  await navigateTo(page, 'Access Management', 'Teams');
  await clearTableFilters(page);
  await filterTableByText(teamName, page);
  await clickTableRow(teamName, page);
  await expect(page.getByRole('heading', { name: teamName, exact: true })).toBeVisible();
  await clickPageAction('Delete team', page);
  await page.locator('#confirm').click();
  await page.locator('#submit').click();
  await expect(page.getByRole('heading', { name: 'Teams', exact: true })).toBeVisible();
}
