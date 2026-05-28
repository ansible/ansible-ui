import { expect, test } from '@playwright/test';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { Organization } from '@ansible/playwright/utils/organization';
import { Team } from '@ansible/playwright/utils/team';
import { User } from '@ansible/playwright/utils/user';
import { Role, type CreateRoleAPIOptions } from '@ansible/playwright/utils/role';
import { Remote, type HubRemote } from '@ansible/playwright/utils/hub';
import { PlatformOrganization as OrganizationType } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { PlatformTeam as TeamType } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformUser as UserType } from '@ansible/platform-ui/interfaces/PlatformUser';
import { PlatformRole as RoleType } from '@ansible/platform-ui/interfaces/PlatformRole';

test.beforeEach(setupBefore({ path: '/content/administration/remotes' }));
test.afterEach(setupAfter);

test.describe('Hub - Remotes Access', () => {
  test(
    'should assign user to remote and apply role via User Access tab',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      let remote: HubRemote | undefined;
      let role: RoleType | undefined;
      let user: UserType | undefined;

      try {
        await test.step('Create prerequisites via API', async () => {
          // Create custom role for collection remotes
          const roleOptions: CreateRoleAPIOptions = {
            name: createE2EName('role'),
            description: 'Manage collection remotes',
            content_type: 'galaxy.collectionremote',
            permissions: ['galaxy.view_collectionremote'],
          };
          role = await Role.api.create(page, roleOptions);

          remote = await Remote.api.create(page);
          user = await User.api.create(page);
        });

        if (!remote) throw new Error('Remote not created');
        if (!role) throw new Error('Role not created');
        if (!user) throw new Error('User not created');

        const remoteName = remote.name;
        const roleName = role.name;
        const username = user.username;

        await test.step('Navigate to remote User Access tab', async () => {
          await navigateTo(page, 'Automation Content', 'Remotes');
          await clearTableFilters(page);
          await filterTable({ filterLabel: 'Name', filterValue: remoteName }, page);
          await page.getByRole('link', { name: remoteName }).click();
          await expect(page.getByRole('heading', { name: remoteName })).toBeVisible();
          await page.getByRole('tab', { name: 'User Access', exact: true }).click();
        });

        await test.step('Assign user with role via multi-step wizard', async () => {
          await page.getByTestId('assign-users').click();

          // Step 1: Select user(s)
          await expect(page.getByRole('heading', { name: 'Select user(s)' })).toBeVisible();
          await filterTable({ filterLabel: 'Username', filterValue: username }, page);
          await page
            .getByRole('row', { name: username })
            .getByRole('checkbox', { name: 'Select row' })
            .check();
          await page.getByRole('button', { name: 'Next', exact: true }).click();

          // Step 2: Select roles to apply
          await expect(page.getByRole('heading', { name: 'Select roles to apply' })).toBeVisible();
          await filterTable({ filterLabel: 'Name', filterValue: roleName }, page);
          await page
            .getByRole('row', { name: roleName })
            .getByRole('checkbox', { name: 'Select row' })
            .check();
          await page.getByRole('button', { name: 'Next', exact: true }).click();

          // Step 3: Review
          await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
          await expect(page.locator('main')).toContainText(username);
          await expect(page.locator('main')).toContainText(roleName);
          await page.getByRole('button', { name: 'Finish', exact: true }).click();
        });

        await test.step('Verify user assignment', async () => {
          await expect(page.getByRole('heading', { name: remoteName })).toBeVisible();
          await expect(page.locator('tbody')).toContainText(username);
          await expect(page.locator('tbody')).toContainText(roleName);
        });
      } finally {
        if (remote) {
          try {
            await Remote.api.delete(page, remote.pulp_href);
          } catch {
            // Ignore cleanup errors
          }
        }
        if (role) {
          try {
            await Role.api.delete(page, role.id);
          } catch {
            // Ignore cleanup errors
          }
        }
        if (user) {
          try {
            await User.api.delete(page, user.id);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );

  test(
    'should assign team to remote, apply role, then remove role via Team Access tab',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      let remote: HubRemote | undefined;
      let role: RoleType | undefined;
      let organization: OrganizationType | undefined;
      let team: TeamType | undefined;

      try {
        await test.step('Create prerequisites via API', async () => {
          // Create custom role for collection remotes
          const roleOptions: CreateRoleAPIOptions = {
            name: createE2EName('role'),
            description: 'Manage collection remotes',
            content_type: 'galaxy.collectionremote',
            permissions: ['galaxy.view_collectionremote'],
          };
          role = await Role.api.create(page, roleOptions);

          organization = await Organization.api.create(page);
          team = await Team.api.create(page, { organization: organization.id });
          remote = await Remote.api.create(page);
        });

        if (!remote) throw new Error('Remote not created');
        if (!role) throw new Error('Role not created');
        if (!organization) throw new Error('Organization not created');
        if (!team) throw new Error('Team not created');

        const remoteName = remote.name;
        const roleName = role.name;
        const teamName = team.name;

        await test.step('Navigate to remote Team Access tab', async () => {
          await navigateTo(page, 'Automation Content', 'Remotes');
          await clearTableFilters(page);
          await filterTable({ filterLabel: 'Name', filterValue: remoteName }, page);
          await page.getByRole('link', { name: remoteName }).click();
          await expect(page.getByRole('heading', { name: remoteName })).toBeVisible();
          await page.getByRole('tab', { name: 'Team Access', exact: true }).click();
        });

        await test.step('Assign team with role via multi-step wizard', async () => {
          await page.getByTestId('assign-teams').click();

          // Step 1: Select team(s)
          await expect(page.getByRole('heading', { name: 'Select team(s)' })).toBeVisible();
          await filterTable({ filterLabel: 'Name', filterValue: teamName }, page);
          await page
            .getByRole('row', { name: teamName })
            .getByRole('checkbox', { name: 'Select row' })
            .check();
          await page.getByRole('button', { name: 'Next', exact: true }).click();

          // Step 2: Select roles to apply
          await expect(page.getByRole('heading', { name: 'Select roles to apply' })).toBeVisible();
          await filterTable({ filterLabel: 'Name', filterValue: roleName }, page);
          await page
            .getByRole('row', { name: roleName })
            .getByRole('checkbox', { name: 'Select row' })
            .check();
          await page.getByRole('button', { name: 'Next', exact: true }).click();

          // Step 3: Review
          await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
          await expect(page.locator('main')).toContainText(teamName);
          await expect(page.locator('main')).toContainText(roleName);
          await page.getByRole('button', { name: 'Finish', exact: true }).click();
        });

        await test.step('Verify team assignment', async () => {
          await expect(page.getByRole('heading', { name: remoteName })).toBeVisible();
          await expect(page.locator('tbody')).toContainText(teamName);
          await expect(page.locator('tbody')).toContainText(roleName);
        });

        await test.step('Remove role from team', async () => {
          // Verify role is displayed in the table
          await expect(page.locator('tbody')).toContainText(roleName);

          // Find the row containing the role
          const row = page.getByRole('row', { name: new RegExp(roleName) });
          await expect(row).toBeVisible();

          // Click the "Remove role" button in the row (it's directly accessible, not in a menu)
          await row.getByRole('button', { name: 'Remove role' }).click();

          // Confirm removal in dialog
          const dialog = page.getByRole('dialog');
          await expect(dialog).toBeVisible();
          await dialog.locator('#confirm').check();
          await dialog.getByRole('button', { name: 'Remove role', exact: true }).click();

          // Verify role has been removed
          await expect(dialog).not.toBeVisible({ timeout: 30000 });
        });
      } finally {
        if (remote) {
          try {
            await Remote.api.delete(page, remote.pulp_href);
          } catch {
            // Ignore cleanup errors
          }
        }
        if (team) {
          try {
            await Team.api.delete(page, team.id);
          } catch {
            // Ignore cleanup errors
          }
        }
        if (organization) {
          try {
            await Organization.api.delete(page, organization.id);
          } catch {
            // Ignore cleanup errors
          }
        }
        if (role) {
          try {
            await Role.api.delete(page, role.id);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );
});
