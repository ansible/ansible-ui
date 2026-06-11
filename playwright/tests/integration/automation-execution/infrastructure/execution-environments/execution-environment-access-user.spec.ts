import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { ExecutionEnvironment, Organization, User } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.describe('Execution Environment User Access', () => {
  test.beforeEach(setupBefore({ path: '/' }));
  test.afterEach(setupAfter);

  test(
    'should add user role assignment from User Access tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000); // 2 minutes timeout for this complex test

      // Create test data
      const organizationName = await Organization.ui.create(page);
      const userInfo = await User.ui.create(page);
      const userName = userInfo.userName;
      const executionEnvName = await ExecutionEnvironment.ui.create(page, { organizationName });

      // Navigate to organization and assign Organization ExecutionEnvironment Admin role to user
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ filterLabel: 'Name', text: organizationName }, page);

      await page.getByRole('tab', { name: 'Users', exact: true }).click();
      await page.getByRole('button', { name: 'Assign users' }).click();
      await expect(page.getByRole('heading', { name: 'Assign users' })).toBeVisible();

      // Select user
      await selectTableRow(
        {
          pageTitle: 'Select user(s)',
          filterLabel: 'Username',
          filterValue: userName,
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

      // Navigate to execution environment and assign user with role
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
      await clickTableRow({ filterLabel: 'Name', text: executionEnvName }, page);

      await page.getByRole('tab', { name: 'User Access' }).click();
      await page.getByRole('link', { name: 'Assign users' }).click();
      await expect(page.getByRole('heading', { name: 'Assign users' })).toBeVisible();

      // Select user
      await expect(page.getByRole('heading', { name: 'Select user(s)' })).toBeVisible();
      await selectTableRow(
        {
          pageTitle: 'Select user(s)',
          filterLabel: 'Username',
          filterValue: userName,
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

      // Review step - verify user and role details
      await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
      await expect(page.getByRole('region', { name: /^Users/ })).toContainText(userName);
      await expect(page.getByRole('region', { name: /^Roles/ })).toContainText(
        'ExecutionEnvironment Admin'
      );
      await expect(page.getByRole('region', { name: /^Roles/ })).toContainText(
        'Has all permissions to a single execution environment'
      );

      await page.getByRole('button', { name: 'Finish' }).click();

      // Verify we're back on the execution environment page
      await expect(page.getByRole('heading', { name: executionEnvName })).toBeVisible();

      // Workaround for AAP-31401: Navigate to Details tab and back to User Access
      await page.getByRole('tab', { name: 'Details' }).click();
      await page.getByRole('tab', { name: 'User Access' }).click();

      // Cleanup
      await ExecutionEnvironment.ui.delete(page, executionEnvName);
      await User.ui.delete(page, userName);
      await Organization.ui.delete(page, organizationName);
    }
  );
});
