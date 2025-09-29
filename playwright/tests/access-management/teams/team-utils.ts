import { expect } from '@playwright/test';
import { Page } from 'playwright-core';
import { clickPageAction } from '../../../commands/clickPageAction';
import { clickTableRow } from '../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../commands/createE2EName';
import { navigateTo } from '../../../commands/navigateTo';
import { singleSelectByLabel } from '../../../commands/singleSelectByLabel';

export async function createTeam(
  options: { teamName?: string; organizationName?: string },
  page: Page
) {
  await navigateTo(page, 'Access Management', 'Teams');
  await page.getByText('Create team').click();
  await expect(page.getByRole('heading', { name: 'Create team' })).toBeVisible();
  const teamName = options.teamName ?? createE2EName();
  await page.getByLabel('Name').fill(teamName);
  await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);
  await page.getByRole('button', { name: 'Create team' }).click();
  await expect(page.getByRole('heading', { name: teamName })).toBeVisible();
  return teamName;
}

export async function deleteTeam(teamName: string, page: Page) {
  await navigateTo(page, 'Access Management', 'Teams');
  await clickTableRow({ text: teamName }, page);
  await clickPageAction('Delete team', page);
  await confirmAndAssertDeletion(page);
}
