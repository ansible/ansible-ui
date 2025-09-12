import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createAwxProject, deleteAwxProject, syncAwxProject } from './project-utils';
import {
  createOrganization,
  deleteOrganization,
} from '../../access-management/organizations/organization-utils';
import { createUser, deleteUser } from '../../access-management/users/user-utils';
import { navigateTo } from '../../../commands/navigateTo';
import { clickTableRow } from '../../../commands/clickTableRow';

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
  await navigateTo(page, 'Automation Execution', 'Projects');
  await clickTableRow({ filterLabel: 'Name', text: projectName }, page);
  await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
  await page.getByRole('tab', { name: 'User Access' }).click();
  await page.getByRole('link', { name: 'Assign users' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).fill(userName);
  await page.getByRole('button', { name: 'apply filter' }).click();
  await page.getByRole('checkbox', { name: 'Select row' }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Select all rows' }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Users' })).toContainText(userName);
  await expect(page.getByRole('region', { name: 'Roles' })).toContainText('Project Admin');
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
  await page.getByRole('textbox', { name: 'Type to filter' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).fill(userName);
  await page.waitForTimeout(100);
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
  await deleteOrganization(organizationName, page);
});
