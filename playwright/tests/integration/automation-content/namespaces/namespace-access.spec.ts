import { expect, test } from '@playwright/test';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  Namespace,
  Organization,
  Team,
  User,
  Role,
  TEST_ROLE_CONFIGS,
} from '@ansible/playwright/utils';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Namespace - Team and User Access', () => {
  let namespaceName: string;
  let roleName: string;
  let organizationName: string;

  test.beforeEach(async ({ page }) => {
    const roleConfig = {
      ...TEST_ROLE_CONFIGS.namespace,
      name: createE2EName('role'),
    };
    roleName = await Role.ui.createWithConfig(page, roleConfig);

    const namespace = await Namespace.api.create(page);
    namespaceName = namespace.name;

    organizationName = await Organization.ui.create(page);
  });

  test.afterEach(async ({ page }) => {
    await Namespace.api.delete(page, namespaceName);
    await Role.ui.delete(page, roleName);
    await Organization.ui.delete(page, organizationName);
  });

  test(
    'should assign a user and apply role(s) to the user of the namespace',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const userInfo = await User.ui.create(page);

      await navigateTo(page, 'Automation Content', 'Namespaces');
      await expect(page.getByRole('heading', { name: 'Namespaces' })).toBeVisible();
      await page.locator('[data-cy="table-view"] button').click();
      await clickTableRow({ filterLabel: 'Name', text: namespaceName }, page);

      await page.getByRole('tab', { name: 'User Access', exact: true }).click();

      const assignResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/gateway/v1/role_user_assignments/') &&
          response.status() === 201
      );

      await page.getByTestId('assign-users').click();

      await expect(page.getByRole('heading', { name: 'Select user(s)' })).toBeVisible();
      await selectTableRow(
        {
          filterLabel: 'Username',
          filterValue: userInfo.userName,
        },
        page
      );
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Select roles to apply' })).toBeVisible();
      await selectTableRow(
        {
          filterLabel: 'Name',
          filterValue: roleName,
        },
        page
      );
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
      await expect(page.locator('main')).toContainText(userInfo.userName);
      await expect(page.locator('main')).toContainText(roleName);
      await expect(page.locator('main')).toContainText('Automation Content');

      await page.getByRole('button', { name: 'Finish', exact: true }).click();

      const assignResponse = await assignResponsePromise;
      expect(assignResponse.status()).toBe(201);

      await expect(page.getByRole('heading', { name: namespaceName, exact: true })).toBeVisible();

      await User.ui.delete(page, userInfo.userName);
    }
  );

  test(
    'should assign a team and apply role(s) to the team of the namespace',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const teamName = await Team.ui.create(page, { organizationName });

      await navigateTo(page, 'Automation Content', 'Namespaces');
      await expect(page.getByRole('heading', { name: 'Namespaces' })).toBeVisible();
      await page.locator('[data-cy="table-view"] button').click();
      await clickTableRow({ filterLabel: 'Name', text: namespaceName }, page);

      await page.getByRole('tab', { name: 'Team Access', exact: true }).click();

      const assignResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/gateway/v1/role_team_assignments/') &&
          response.status() === 201
      );

      await page.getByTestId('assign-teams').click();

      await expect(page.getByRole('heading', { name: 'Select team(s)' })).toBeVisible();
      await selectTableRow(
        {
          filterLabel: 'Name',
          filterValue: teamName,
        },
        page
      );
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Select roles to apply' })).toBeVisible();
      await selectTableRow(
        {
          filterLabel: 'Name',
          filterValue: roleName,
        },
        page
      );
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
      await expect(page.locator('main')).toContainText(teamName);
      await expect(page.locator('main')).toContainText(roleName);
      await expect(page.locator('main')).toContainText('Automation Content');

      await page.getByRole('button', { name: 'Finish', exact: true }).click();

      const assignResponse = await assignResponsePromise;
      expect(assignResponse.status()).toBe(201);

      await expect(page.getByRole('heading', { name: namespaceName, exact: true })).toBeVisible();

      await Team.ui.delete(page, teamName);
    }
  );
});
