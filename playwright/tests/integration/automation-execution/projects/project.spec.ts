import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../../commands/clickTableRow';
import { navigateTo } from '../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import {
  createOrganization,
  deleteOrganization,
} from '../../access-management/organizations/organization-utils';
import { createTeam, deleteTeam } from '../../access-management/teams/team-utils';
import { createUser, deleteUser } from '../../access-management/users/user-utils';
import { createAwxProject, deleteAwxProject, syncAwxProject } from './project-utils';

test.beforeEach(setupBefore({ path: '/execution/projects' }));
test.afterEach(setupAfter);

test('project - Create, sync, and delete', async ({ page }) => {
  test.setTimeout(5 * 60 * 1000);
  const projectName = await createAwxProject({}, page);
  await syncAwxProject(projectName, page);
  await deleteAwxProject(projectName, page);
});

test('project - test user access organization link', { tag: ['@not_mock'] }, async ({ page }) => {
  test.setTimeout(5 * 60 * 1000);
  const organizationName = await createOrganization(page, {});
  const projectName = await createAwxProject({ organizationName: organizationName }, page);
  const userName = await createUser({}, page);
  const teamName = await createTeam({ organizationName: organizationName }, page);

  // Assign user to team
  await page.getByRole('tab', { name: 'Users' }).click();
  await page.getByRole('button', { name: 'Assign users' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).fill(userName);
  await page.getByRole('textbox', { name: 'Type to filter' }).press('Enter');
  await page.getByRole('checkbox', { name: 'Select all rows' }).check();
  await page.getByRole('button', { name: 'Assign users' }).click();

  // assign project admin role to team
  await navigateTo(page, 'Automation Execution', 'Projects');
  await clickTableRow({ filterLabel: 'Name', text: projectName }, page);
  await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
  await page.getByRole('tab', { name: 'Team Access' }).click();
  await page.getByRole('link', { name: 'Assign teams' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).fill(teamName);
  await page.getByRole('textbox', { name: 'Type to filter' }).press('Enter');
  await page.getByRole('checkbox', { name: 'Select all rows' }).check();
  await page.locator('button', { hasText: 'Next' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).fill('Project Admin');
  await page.getByRole('button', { name: 'apply filter' }).click();
  await page.getByRole('checkbox', { name: 'Select row' }).check();
  await page.locator('button', { hasText: 'Next' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();

  // view the project user access role alert
  await page.getByRole('tab', { name: 'User Access' }).click();
  await page
    .getByRole('row', { name: userName })
    .getByRole('button', { name: 'Manage roles' })
    .click();
  await expect(page.getByRole('heading', { name: 'Manage roles directly' })).toContainText(
    `Manage roles directly assigned to ${userName} for ${projectName}`
  );
  await expect(page.getByRole('link', { name: organizationName })).toBeVisible();
  await page.getByRole('link', { name: organizationName }).click();
  await expect(page.getByRole('heading', { name: organizationName })).toBeVisible();
  await deleteAwxProject(projectName, page);
  await deleteUser(userName, page);
  await deleteTeam(teamName, page);
  await deleteOrganization(organizationName, page);
});
