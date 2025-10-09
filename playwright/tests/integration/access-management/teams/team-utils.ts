import { expect } from '@playwright/test';
import { Page } from 'playwright-core';
import { clickTableRow } from '../../../../commands/clickTableRow';
import { clickTableRowAction } from '../../../../commands/clickTableRowAction';
import { createE2EName } from '../../../../commands/createE2EName';
import { deleteResourceFromDetailsPage } from '../../../../commands/deleteResourceFromDetailsPage';
import { navigateTo } from '../../../../commands/navigateTo';
import { singleSelectByLabel } from '../../../../commands/singleSelectByLabel';

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

export async function editTeamFromList(teamName: string, newTeamName: string, page: Page) {
  await navigateTo(page, 'Access Management', 'Teams');
  await clickTableRowAction(
    {
      text: teamName,
      action: 'Edit team',
      filterLabel: 'Name',
      clearFilters: true,
    },
    page
  );

  await expect(page.getByRole('heading', { name: `Edit ${teamName}`, exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(newTeamName);
  await page.getByRole('button', { name: 'Save team', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Teams', exact: true })).toBeVisible();
}

export async function editTeam(teamName: string, newTeamName: string, page: Page) {
  await navigateTo(page, 'Access Management', 'Teams');
  await clickTableRow({ filterLabel: 'Name', text: teamName }, page);
  await page.getByRole('tab', { name: 'Details', exact: true }).click();
  await page.getByRole('button', { name: 'Edit team', exact: true }).click();

  await expect(page.getByRole('heading', { name: `Edit ${teamName}`, exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(newTeamName);
  await page.getByRole('button', { name: 'Save team', exact: true }).click();
  await expect(page.getByRole('heading', { name: newTeamName, exact: true })).toBeVisible();
}

export async function deleteTeam(teamName: string, page: Page) {
  await deleteResourceFromDetailsPage(
    {
      resourceName: teamName,
      resourceType: 'team',
      filterLabel: 'Name',
      navigationPath: ['Access Management', 'Teams'],
    },
    page
  );
}
