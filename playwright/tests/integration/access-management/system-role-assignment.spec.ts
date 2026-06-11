import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { Team, User, Role, TEST_ROLE_CONFIGS } from '@ansible/playwright/utils';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { PlatformRole } from '@ansible/platform-ui/interfaces/PlatformRole';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';

test.describe('System Role Assignment', () => {
  let systemRole: PlatformRole | undefined;
  let systemRoleName: string;
  let team: PlatformTeam | undefined;
  let user: PlatformUser | undefined;

  test.beforeEach(async ({ page }) => {
    await setupBefore()({ page });

    systemRoleName = createE2EName('system-role');
    systemRole = await Role.api.create(page, {
      name: systemRoleName,
      description: 'E2E test system role',
      content_type: TEST_ROLE_CONFIGS.system.resourceType,
      permissions: TEST_ROLE_CONFIGS.system.permissions,
    });
  });

  test.afterEach(async ({ page }) => {
    if (team) await Team.api.delete(page, team.id).catch(() => {});
    if (user) await User.api.delete(page, user.id).catch(() => {});
    if (systemRole) await Role.api.delete(page, systemRole.id).catch(() => {});
    team = undefined;
    user = undefined;
    systemRole = undefined;
    await setupAfter({ page });
  });

  test(
    'should assign a system role to a team and skip resource selection step',
    { tag: ['@team', '@not_mock'] },
    async ({ page }) => {
      team = await Team.api.create(page, { organization: 1 });

      // Navigate to team roles tab
      await navigateTo(page, 'Access Management', 'Teams');
      await clickTableRow({ text: team.name, filterLabel: 'Name' }, page);
      await page.getByRole('tab', { name: 'Roles' }).click();
      await expect(page.getByRole('button', { name: 'Assign roles' })).toBeVisible();
      await page.getByRole('button', { name: 'Assign roles' }).click();
      await expect(page.getByRole('heading', { name: 'Assign roles' })).toBeVisible();

      // Step 1: Select "System" resource type
      await page.getByRole('textbox', { name: 'Type to filter' }).click();
      await page.getByRole('textbox', { name: 'Type to filter' }).fill('System');
      await page.getByRole('option', { name: 'System' }).click();
      await page.getByRole('button', { name: 'Next' }).click();

      // Should skip "Select resources" and go directly to "Select roles"
      await expect(page.getByText('Select system-level roles to apply.')).toBeVisible();

      // Filter and select the system role
      await page.getByRole('textbox', { name: 'Type to filter' }).click();
      await page.getByRole('textbox', { name: 'Type to filter' }).fill(systemRoleName);
      await page.getByRole('button', { name: 'apply filter' }).click();
      await page.getByRole('checkbox', { name: 'Select row' }).check();
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      // Review step - should show roles but no resources section
      await expect(page.getByRole('region', { name: 'Platform roles' })).toContainText(
        systemRoleName
      );

      // Finish the wizard
      await page.getByRole('button', { name: 'Finish' }).click();

      // Verify the role was assigned
      await expect(page.getByRole('heading', { name: team.name })).toBeVisible();
      await expect(page.locator('tbody')).toContainText(systemRoleName);
    }
  );

  test(
    'should assign a system role to a user and skip resource selection step',
    { tag: ['@user', '@not_mock'] },
    async ({ page }) => {
      user = await User.api.create(page);

      // Navigate to user roles tab
      await navigateTo(page, 'Access Management', 'Users');
      await clickTableRow({ text: user.username, filterLabel: 'Username' }, page);
      await page.getByRole('tab', { name: 'Roles' }).click();
      await expect(page.getByRole('button', { name: 'Assign roles' })).toBeVisible();
      await page.getByRole('button', { name: 'Assign roles' }).click();
      await expect(page.getByRole('heading', { name: 'Assign roles' })).toBeVisible();

      // Step 1: Select "System" resource type
      await page.getByRole('textbox', { name: 'Type to filter' }).click();
      await page.getByRole('textbox', { name: 'Type to filter' }).fill('System');
      await page.getByRole('option', { name: 'System' }).click();
      await page.getByRole('button', { name: 'Next' }).click();

      // Should skip "Select resources" and go directly to "Select roles"
      await expect(page.getByText('Select system-level roles to apply.')).toBeVisible();

      // Filter and select the system role
      await page.getByRole('textbox', { name: 'Type to filter' }).click();
      await page.getByRole('textbox', { name: 'Type to filter' }).fill(systemRoleName);
      await page.getByRole('button', { name: 'apply filter' }).click();
      await page.getByRole('checkbox', { name: 'Select row' }).check();
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      // Review step - should show roles but no resources section
      await expect(page.getByRole('region', { name: 'Platform roles' })).toContainText(
        systemRoleName
      );

      // Finish the wizard
      await page.getByRole('button', { name: 'Finish' }).click();

      // Verify the role was assigned
      await expect(page.getByRole('heading', { name: user.username })).toBeVisible();
      await expect(page.locator('tbody')).toContainText(systemRoleName);
    }
  );
});
