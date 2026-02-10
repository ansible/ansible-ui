import { expect, test } from '@playwright/test';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  HubExecutionEnvironment,
  Organization,
  RemoteRegistry,
  Role,
  User,
} from '@ansible/playwright/utils';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Execution Environments - User Access', () => {
  test(
    'should assign user and apply role to execution environment from User Access tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
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
        const { userName } = await test.step('Create user', async () => {
          return await User.ui.create(page);
        });

        await test.step('Navigate to execution environment details page', async () => {
          await navigateTo(page, 'Automation Content', 'Execution Environments');
          await expect(page.getByTestId('page-title')).toHaveText('Execution Environments');

          await clickTableRow({ filterLabel: 'Name', text: executionEnvironment.name }, page);
          await expect(
            page.getByRole('heading', { name: executionEnvironment.name, exact: true })
          ).toBeVisible();
        });

        await test.step('Navigate to User Access tab and assign user with role', async () => {
          await page.getByRole('tab', { name: 'User Access', exact: true }).click();

          await page.getByTestId('assign-users').click();

          await expect(page.getByTestId('page-title')).toHaveText('Assign users');

          await filterTable({ filterLabel: 'Username', filterValue: userName }, page);
          await page
            .getByRole('row', { name: new RegExp(userName) })
            .getByRole('checkbox')
            .check();

          await page.getByRole('button', { name: /^Next/, exact: false }).click();

          await expect(page.getByRole('heading', { name: 'Select roles to apply' })).toBeVisible();

          await filterTable({ filterLabel: 'Name', filterValue: role.name }, page);
          await page
            .getByRole('row', { name: new RegExp(role.name) })
            .getByRole('checkbox')
            .check();

          await page.getByRole('button', { name: /^Next/, exact: false }).click();

          await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();

          await expect(page.getByText(userName)).toBeVisible();
          await expect(page.getByText(role.name)).toBeVisible();
          // Scope to table to avoid breadcrumb navigation text
          await expect(page.locator('table').getByText('Automation Content')).toBeVisible();

          await page.getByRole('button', { name: /^Finish/, exact: false }).click();
        });

        await test.step('Verify user access tab shows assigned user', async () => {
          await expect(
            page.getByRole('heading', { name: executionEnvironment.name, exact: true })
          ).toBeVisible();

          await expect(page.getByRole('link', { name: userName, exact: true })).toBeVisible();
          await expect(page.getByText(role.name)).toBeVisible();
        });

        await User.ui.delete(page, userName);
      } finally {
        await HubExecutionEnvironment.api.delete(page, executionEnvironment.name);
        await RemoteRegistry.api.delete(page, remoteRegistry.id);
        await Role.api.delete(page, role.id);
        await Organization.api.delete(page, organization.id);
      }
    }
  );
});
