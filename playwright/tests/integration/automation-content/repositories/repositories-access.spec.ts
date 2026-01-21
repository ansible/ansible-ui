import { expect, test } from '@playwright/test';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Organization } from '@ansible/playwright/utils/organization';
import { Team } from '@ansible/playwright/utils/team';
import { User } from '@ansible/playwright/utils/user';
import { Repository, type HubRepository } from '@ansible/playwright/utils/hub';
import { PlatformOrganization as OrganizationType } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { PlatformTeam as TeamType } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformUser as UserType } from '@ansible/platform-ui/interfaces/PlatformUser';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Repositories Access', () => {
  test(
    'should assign user to repository and apply role via User Access tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      let repository: HubRepository | undefined;
      let user: UserType | undefined;

      try {
        await test.step('Create prerequisites via API', async () => {
          user = await User.api.create(page);
          repository = await Repository.api.create(page);
        });

        if (!repository) throw new Error('Repository not created');
        if (!user) throw new Error('User not created');

        const repositoryName = repository.name;
        const username = user.username;

        await test.step('Navigate to repository User Access tab', async () => {
          await navigateTo(page, 'Automation Content', 'Repositories');
          await clearTableFilters(page);
          await filterTable({ filterLabel: 'Name', filterValue: repositoryName }, page);
          await page.getByRole('link', { name: repositoryName }).click();
          await expect(page.getByRole('heading', { name: repositoryName })).toBeVisible();
          await page.getByRole('tab', { name: 'Details', exact: true }).click();
          await page.getByRole('tab', { name: 'User Access', exact: true }).click();
        });

        await test.step('Assign user with role', async () => {
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
          await filterTable(
            { filterLabel: 'Name', filterValue: 'galaxy.ansible_repository_owner' },
            page
          );
          await page
            .getByRole('row', { name: /galaxy\.ansible_repository_owner/ })
            .getByRole('checkbox', { name: 'Select row' })
            .check();
          await page.getByRole('button', { name: 'Next', exact: true }).click();

          // Step 3: Review
          await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
          await expect(page.locator('main')).toContainText(username);
          await expect(page.locator('main')).toContainText('galaxy.ansible_repository_owner');
          await page.getByRole('button', { name: 'Finish', exact: true }).click();
        });

        await test.step('Verify user assignment', async () => {
          await expect(page.getByRole('heading', { name: repositoryName })).toBeVisible();
          await expect(page.locator('tbody')).toContainText(username);
          await expect(page.locator('tbody')).toContainText('galaxy.ansible_repository_owner');
        });
      } finally {
        if (repository) {
          await Repository.api.delete(page, repository.pulp_href);
        }
        if (user) {
          await User.api.delete(page, user.id);
        }
      }
    }
  );

  test(
    'should assign team to repository and apply role via Team Access tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      let repository: HubRepository | undefined;
      let organization: OrganizationType | undefined;
      let team: TeamType | undefined;

      try {
        await test.step('Create prerequisites via API', async () => {
          organization = await Organization.api.create(page);
          if (!organization) throw new Error('Organization not created');
          team = await Team.api.create(page, { organization: organization.id });
          repository = await Repository.api.create(page);
        });

        if (!repository) throw new Error('Repository not created');
        if (!team) throw new Error('Team not created');

        const repositoryName = repository.name;
        const teamName = team.name;

        await test.step('Navigate to repository Team Access tab', async () => {
          await navigateTo(page, 'Automation Content', 'Repositories');
          await clearTableFilters(page);
          await filterTable({ filterLabel: 'Name', filterValue: repositoryName }, page);
          await page.getByRole('link', { name: repositoryName }).click();
          await expect(page.getByRole('heading', { name: repositoryName })).toBeVisible();
          await page.getByRole('tab', { name: 'Details', exact: true }).click();
          await page.getByRole('tab', { name: 'Team Access', exact: true }).click();
        });

        await test.step('Assign team with role', async () => {
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
          await filterTable(
            { filterLabel: 'Name', filterValue: 'galaxy.ansible_repository_owner' },
            page
          );
          await page
            .getByRole('row', { name: /galaxy\.ansible_repository_owner/ })
            .getByRole('checkbox', { name: 'Select row' })
            .check();
          await page.getByRole('button', { name: 'Next', exact: true }).click();

          // Step 3: Review
          await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
          await expect(page.locator('main')).toContainText(teamName);
          await expect(page.locator('main')).toContainText('galaxy.ansible_repository_owner');
          await page.getByRole('button', { name: 'Finish', exact: true }).click();
        });

        await test.step('Verify team assignment', async () => {
          await expect(page.getByRole('heading', { name: repositoryName })).toBeVisible();
          await expect(page.locator('tbody')).toContainText(teamName);
          await expect(page.locator('tbody')).toContainText('galaxy.ansible_repository_owner');
        });
      } finally {
        if (repository) {
          await Repository.api.delete(page, repository.pulp_href);
        }
        if (team) {
          await Team.api.delete(page, team.id);
        }
        if (organization) {
          await Organization.api.delete(page, organization.id);
        }
      }
    }
  );
});
