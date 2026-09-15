import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { waitForBulkActionDialog } from '@ansible/playwright/commands/waitForBulkActionDialog';
import { ExecutionEnvironment, Organization, Team } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.describe('Execution Environment Team Access', () => {
  test.beforeEach(setupBefore({ path: '/' }));
  test.afterEach(setupAfter);

  test(
    'should add team role assignment from Team Access tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const organizationName = await Organization.ui.create(page);
      const teamName = await Team.ui.create(page, { organizationName });
      const executionEnvName = await ExecutionEnvironment.ui.create(page, { organizationName });

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
      await clickTableRow({ filterLabel: 'Name', text: executionEnvName }, page);

      await page.getByRole('tab', { name: 'Team Access' }).click();
      await page.getByRole('link', { name: 'Assign teams' }).click();
      await expect(page.getByRole('heading', { name: 'Assign teams' })).toBeVisible();

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

      await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
      await expect(page.getByRole('region', { name: /^Teams/ })).toContainText(teamName);
      await expect(page.getByRole('region', { name: /^Roles/ })).toContainText(
        'ExecutionEnvironment Admin'
      );
      await expect(page.getByRole('region', { name: /^Roles/ })).toContainText(
        'Has all permissions to a single execution environment'
      );

      await page.getByRole('button', { name: 'Finish' }).click();
      await waitForBulkActionDialog(page);

      await expect(page.getByRole('heading', { name: executionEnvName })).toBeVisible();

      // Workaround for AAP-31401: Navigate to Details tab and back to Team Access
      await page.getByRole('tab', { name: 'Details' }).click();
      await page.getByRole('tab', { name: 'Team Access' }).click();

      await page.getByRole('checkbox', { name: 'Select all rows' }).check();
      await page.getByRole('button', { name: 'Remove role' }).click();
      await expect(page.getByRole('heading', { name: 'Remove role' })).toBeVisible();
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
      await page.getByRole('button', { name: 'Remove role' }).click();

      await expect(
        page.getByText('No teams are assigned to this execution environment.')
      ).toBeVisible();

      await ExecutionEnvironment.ui.delete(page, executionEnvName);
      await Team.ui.delete(page, teamName);
      await Organization.ui.delete(page, organizationName);
    }
  );
});
