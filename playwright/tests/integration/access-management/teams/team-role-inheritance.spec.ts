import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../../commands/clickTableRow';
import { navigateTo } from '../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import {
  createInventory,
  deleteInventory,
} from '../../automation-execution/infrastructure/inventories/inventory-utils';
import {
  createAwxProject,
  deleteAwxProject,
} from '../../automation-execution/projects/project-utils';
import { createOrganization, deleteOrganization } from '../organizations/organization-utils';
import { createUser, deleteUser } from '../users/user-utils';
import { createTeam, deleteTeam } from './team-utils';

test.beforeEach(setupBefore({ path: '/access/teams' }));
test.afterEach(setupAfter);

test(
  'Teams - User inherits team roles and can be verified on resource team access tabs',
  {
    tag: ['@team', '@not_mock'],
  },
  async ({ page }) => {
    test.setTimeout(2 * 60 * 1000); // 2 minutes timeout for this specific test
    const orgName = await createOrganization(page);
    const userName = await createUser({ organizationName: orgName }, page);
    const inventoryName = await createInventory({}, page);
    const projectName = await createAwxProject({ organizationName: orgName }, page);
    const teamName = await createTeam({ organizationName: orgName }, page);

    // Step 1: Assign multiple roles to the team
    await page.getByRole('tab', { name: 'Roles' }).click();
    await expect(page.getByRole('button', { name: 'Assign roles' })).toBeVisible();

    // Assign Inventory Admin role
    await page.getByRole('button', { name: 'Assign role' }).click();
    await expect(page.getByRole('heading', { name: 'Assign roles' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('Inventory');
    await page.locator('[id="select-create-typeahead-awx.inventory"]').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill(inventoryName);
    await page.getByRole('button', { name: 'apply filter' }).click();
    await page
      .getByRole('row', { name: inventoryName })
      .getByRole('checkbox', { name: 'Select row' })
      .check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('Admin');
    await page.getByRole('textbox', { name: 'Type to filter' }).press('Enter');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Resources' })).toContainText(inventoryName);
    await expect(page.getByRole('region', { name: 'Platform roles' })).toContainText(
      'Inventory Admin'
    );
    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page.getByRole('heading', { name: teamName })).toBeVisible();
    await expect(page.getByRole('link', { name: inventoryName }).first()).toBeVisible();

    // Assign Project Admin role
    await page.getByRole('button', { name: 'Assign role' }).click();
    await expect(page.getByRole('heading', { name: 'Assign roles' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('Project');
    await page.locator('[id="select-create-typeahead-awx.project"]').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill(projectName);
    await page.getByRole('button', { name: 'apply filter' }).click();
    await page
      .getByRole('row', { name: projectName })
      .getByRole('checkbox', { name: 'Select row' })
      .check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('Admin');
    await page.getByRole('textbox', { name: 'Type to filter' }).press('Enter');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Resources' })).toContainText(projectName);
    await expect(page.getByRole('region', { name: 'Platform roles' })).toContainText(
      'Project Admin'
    );
    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page.getByRole('heading', { name: teamName })).toBeVisible();
    await expect(page.getByRole('link', { name: projectName }).first()).toBeVisible();

    // Step 2: Add user to team
    await page.getByRole('tab', { name: 'Users' }).click();
    await expect(page.getByRole('button', { name: 'Assign users' })).toBeVisible();
    await page.getByRole('button', { name: 'Assign users' }).click();
    await expect(page.getByRole('heading', { name: 'Assign users' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill(userName);
    await page.getByRole('textbox', { name: 'Type to filter' }).press('Enter');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Assign users' }).click();

    // Step 3: Verify role inheritance on user's roles tab
    await clickTableRow({ text: userName }, page);
    await page.getByRole('tab', { name: 'Roles' }).click();

    // Verify team inheritance shows up in user roles
    const teamRow = page.locator('table tr', { hasText: teamName });
    await expect(teamRow).toContainText(teamName);
    await expect(teamRow).toContainText('Team Member');

    // Step 4: Verify role inheritance on Resource Team Access tabs
    // Navigate to Inventory and check Team Access tab
    await navigateTo(page, 'Automation Execution', 'Inventories');
    await clickTableRow({ text: inventoryName }, page);
    await page.getByRole('tab', { name: 'Team Access' }).click();

    // Verify team appears in Team Access tab with Admin role
    await expect(page.getByRole('link', { name: teamName }).first()).toBeVisible();
    const inventoryTeamRow = page.locator('table tr', { hasText: teamName });
    await expect(inventoryTeamRow).toContainText('Inventory Admin');

    // Navigate to Project and check Team Access tab
    await navigateTo(page, 'Automation Execution', 'Projects');
    await clickTableRow({ text: projectName }, page);
    await page.getByRole('tab', { name: 'Team Access' }).click();

    // Verify team appears in Team Access tab with Admin role
    await expect(page.getByRole('link', { name: teamName }).first()).toBeVisible();
    const projectTeamRow = page.locator('table tr', { hasText: teamName });
    await expect(projectTeamRow).toContainText('Project Admin');

    // Step 5: Verify user inheritance on Resource User Access tabs
    // Check User Access tab on Inventory
    await navigateTo(page, 'Automation Execution', 'Inventories');
    await clickTableRow({ text: inventoryName }, page);
    await page.getByRole('tab', { name: 'User Access' }).click();

    // Verify user appears with inherited role from team (shows as "Team Member")
    await expect(page.getByRole('link', { name: userName }).first()).toBeVisible();
    const inventoryUserRow = page.locator('table tr', { hasText: userName });
    // User should appear on the resource's User Access tab with "Team Member" role
    await expect(inventoryUserRow).toContainText('Team Member');

    // Check User Access tab on Project
    await navigateTo(page, 'Automation Execution', 'Projects');
    await clickTableRow({ text: projectName }, page);
    await page.getByRole('tab', { name: 'User Access' }).click();

    // Verify user appears with inherited role from team (shows as "Team Member")
    await expect(page.getByRole('link', { name: userName }).first()).toBeVisible();
    const projectUserRow = page.locator('table tr', { hasText: userName });
    // User should appear on the resource's User Access tab with "Team Member" role
    await expect(projectUserRow).toContainText('Team Member');

    // Cleanup
    await deleteTeam(teamName, page);
    await deleteInventory(inventoryName, page);
    await deleteAwxProject(projectName, page);
    await deleteUser(userName, page);
    await deleteOrganization(orgName, page);
  }
);
