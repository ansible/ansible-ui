import { expect, test } from '@playwright/test';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  HubExecutionEnvironment,
  Organization,
  RemoteRegistry,
  Role,
  Team,
} from '@ansible/playwright/utils';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Execution Environments - Team Access', () => {
  test(
    'should assign team and apply role to execution environment from Team Access tab',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000); // 2 minutes timeout for this complex test

      const organization = await Organization.api.create(page);
      const role = await Role.api.create(page, {
        name: createE2EName('test-role', { noWhitespace: true }),
        description: 'E2E test role',
        content_type: 'galaxy.containernamespace',
        permissions: ['galaxy.view_containernamespace'],
      });
      const remoteRegistry = await RemoteRegistry.api.create(page);
      const executionEnvironment = await HubExecutionEnvironment.api.create(page, {
        registry: remoteRegistry.id,
      });

      try {
        const teamName = await test.step('Create team', async () => {
          return await Team.ui.create(page, { organizationName: organization.name });
        });

        await test.step('Navigate to execution environment Team Access tab', async () => {
          await navigateTo(page, 'Automation Content', 'Execution Environments');
          await expect(page.getByTestId('page-title')).toHaveText('Execution Environments');

          await clickTableRow({ filterLabel: 'Name', text: executionEnvironment.name }, page);
          await expect(
            page.getByRole('heading', { name: executionEnvironment.name, exact: true })
          ).toBeVisible();

          await page.getByRole('tab', { name: 'Team Access', exact: true }).click();
        });

        await test.step('Assign team with role', async () => {
          await page.getByTestId('assign-teams').click();
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

          // Select role
          await expect(page.getByRole('heading', { name: 'Select roles to apply' })).toBeVisible();
          await selectTableRow(
            {
              pageTitle: 'Select roles to apply',
              filterLabel: 'Name',
              filterValue: role.name,
            },
            page
          );
          await page.getByRole('button', { name: 'Next', exact: true }).click();

          // Review and finish
          await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
          await expect(page.getByRole('region', { name: /^Teams/ })).toContainText(teamName);
          await expect(page.getByRole('region', { name: /^Roles/ })).toContainText(role.name);
          await expect(page.getByRole('region', { name: /^Roles/ })).toContainText(
            'Automation Content'
          );

          await page.getByRole('button', { name: 'Finish' }).click();
        });

        await test.step('Verify team access assignment', async () => {
          // Verify we're back on the execution environment page
          await expect(
            page.getByRole('heading', { name: executionEnvironment.name, exact: true })
          ).toBeVisible();

          // Verify the team appears in the Team Access table
          await expect(page.getByRole('link', { name: teamName, exact: true })).toBeVisible();
          await expect(page.getByText(role.name)).toBeVisible();
        });

        await test.step('Remove team role assignment', async () => {
          // Select the team's role assignment
          await page.getByRole('checkbox', { name: 'Select all rows' }).check();
          await page.getByRole('button', { name: 'Remove role' }).click();

          // Confirm removal
          await expect(page.getByRole('heading', { name: 'Remove role' })).toBeVisible();
          await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
          await page.getByRole('button', { name: 'Remove role' }).click();

          // Verify team access was removed
          await expect(page.getByText('No teams assigned to execution environment')).toBeVisible();
        });

        // Cleanup team
        await Team.ui.delete(page, teamName);
      } finally {
        // Cleanup in reverse order
        await HubExecutionEnvironment.api.delete(page, executionEnvironment.name);
        await RemoteRegistry.api.delete(page, remoteRegistry.id);
        await Role.api.delete(page, role.id);
        await Organization.api.delete(page, organization.id);
      }
    }
  );
});
