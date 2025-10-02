import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../../commands/clickTableRow';
import { navigateTo } from '../../../../commands/navigateTo';
import { selectTableRow } from '../../../../commands/selectTableRow';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import {
  createOrganization,
  deleteOrganization,
} from '../../../access-management/organizations/organization-utils';
import { createTeam, deleteTeam } from '../../../access-management/teams/team-utils';
import {
  createExecutionEnvironment,
  deleteExecutionEnvironment,
} from './execution-environment-utils';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test(
  'execution environment - add team role assignment from Team Access tab',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    test.setTimeout(2 * 60 * 1000); // 2 minutes timeout for this complex test
    // Create test data
    const organizationName = await createOrganization(page);
    const teamName = await createTeam({ organizationName }, page);
    const executionEnvName = await createExecutionEnvironment(page, { organizationName });

    // Navigate to organization and assign Organization ExecutionEnvironment Admin role to team
    await navigateTo(page, 'Access Management', 'Organizations');
    await clickTableRow({ filterLabel: 'Name', text: organizationName }, page);

    await page.getByRole('tab', { name: 'Teams' }).click();
    await page.getByRole('button', { name: 'Assign organization roles' }).click();
    await expect(page.getByRole('heading', { name: 'Assign organization roles' })).toBeVisible();

    // Select team
    await selectTableRow(
      {
        pageTitle: 'Select team(s)',
        filterLabel: 'Name',
        filterValue: teamName,
      },
      page
    );
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Select Organization ExecutionEnvironment Admin role
    await expect(page.getByRole('heading', { name: 'Select organization roles' })).toBeVisible();
    await selectTableRow(
      {
        pageTitle: 'Select organization roles',
        filterLabel: 'Name',
        filterValue: 'Organization ExecutionEnvironment Admin',
      },
      page
    );
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Review and finish
    await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
    await page.getByRole('button', { name: 'Finish' }).click();

    // Navigate to execution environment and assign team with role
    await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
    await clickTableRow({ filterLabel: 'Name', text: executionEnvName }, page);

    await page.getByRole('tab', { name: 'Team Access' }).click();
    await page.getByRole('link', { name: 'Assign teams' }).click();
    await expect(page.getByRole('heading', { name: 'Assign teams' })).toBeVisible();

    // Select team
    await expect(page.getByRole('heading', { name: 'Select team(s)' })).toBeVisible();
    await selectTableRow(
      {
        pageTitle: 'Select team(s)',
        filterLabel: 'Name',
        filterValue: teamName,
      },
      page
    );
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Select ExecutionEnvironment Admin role
    await expect(page.getByRole('heading', { name: 'Select roles to apply' })).toBeVisible();
    await selectTableRow(
      {
        pageTitle: 'Select roles to apply',
        filterLabel: 'Name',
        filterValue: 'ExecutionEnvironment Admin',
      },
      page
    );
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Review step - verify team and role details
    await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
    await expect(page.getByRole('region', { name: /^Teams/ })).toContainText(teamName);
    await expect(page.getByRole('region', { name: /^Roles/ })).toContainText(
      'ExecutionEnvironment Admin'
    );
    await expect(page.getByRole('region', { name: /^Roles/ })).toContainText(
      'Has all permissions to a single execution environment'
    );

    await page.getByRole('button', { name: 'Finish' }).click();

    // Verify we're back on the execution environment page
    await expect(page.getByRole('heading', { name: executionEnvName })).toBeVisible();

    // Workaround for AAP-31401: Navigate to Details tab and back to Team Access
    await page.getByRole('tab', { name: 'Details' }).click();
    await page.getByRole('tab', { name: 'Team Access' }).click();

    // Remove the role assignment
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Remove role' }).click();
    await expect(page.getByRole('heading', { name: 'Remove role' })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
    await page.getByRole('button', { name: 'Remove role' }).click();

    // Verify team access was removed
    await expect(page.getByText('No teams assigned to execution environment')).toBeVisible();

    // Cleanup
    await deleteExecutionEnvironment(executionEnvName, page);
    await deleteTeam(teamName, page);
    await deleteOrganization(organizationName, page);
  }
);
