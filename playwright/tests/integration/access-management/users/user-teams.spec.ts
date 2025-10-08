import { test } from '@playwright/test';
import { clearTableFilters } from '../../../../commands/clearTableFilters';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import { createOrganization, deleteOrganization } from '../organizations/organization-utils';
import { createTeam, deleteTeam } from '../teams/team-utils';
import { assignTeamToUser, createUser, deleteUser, removeTeamFromUser } from './user-utils';

test.beforeEach(setupBefore({ path: '/access/users' }));
test.afterEach(setupAfter);

test.describe('Users - Teams and Roles Tab Tests', () => {
  test('should add and remove a team from teams tab', { tag: ['@not_mock'] }, async ({ page }) => {
    let organizationName: string | undefined;
    let teamName: string | undefined;
    let userName: string | undefined;

    try {
      organizationName = await createOrganization(page);
      teamName = await createTeam({ organizationName }, page);

      const userResult = (await createUser({ userType: 'normal' }, page)) as unknown as {
        userName: string;
        password: string;
        firstName: string;
        lastName: string;
        email: string;
      };
      userName = userResult.userName;

      await assignTeamToUser(userName, teamName, page);
      await removeTeamFromUser(userName, teamName, page);
      await clearTableFilters(page);
    } finally {
      try {
        if (userName) await deleteUser(userName, page);
      } catch {
        // Ignore cleanup errors
      }
      try {
        if (teamName) await deleteTeam(teamName, page);
      } catch {
        // Ignore cleanup errors
      }
      try {
        if (organizationName) await deleteOrganization(organizationName, page);
      } catch {
        // Ignore cleanup errors
      }
    }
  });
});
