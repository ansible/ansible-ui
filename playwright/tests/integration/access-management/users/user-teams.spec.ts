import { test } from '@playwright/test';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Organization, Team, User } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/access/users' }));
test.afterEach(setupAfter);

test.describe('Users - Teams and Roles Tab Tests', () => {
  test('should add and remove a team from teams tab', { tag: ['@not_mock'] }, async ({ page }) => {
    let organizationName: string | undefined;
    let teamName: string | undefined;
    let userName: string | undefined;

    try {
      organizationName = await Organization.ui.create(page);
      teamName = await Team.ui.create(page, { organizationName });

      const userResult = await User.ui.create(page, { userType: 'normal' });
      userName = userResult.userName;

      await User.ui.assignTeam(page, userName, teamName);
      await User.ui.removeTeam(page, userName, teamName);
      await clearTableFilters(page);
    } finally {
      try {
        if (userName) await User.ui.delete(page, userName);
      } catch {
        // Ignore cleanup errors
      }
      try {
        if (teamName) await Team.ui.delete(page, teamName);
      } catch {
        // Ignore cleanup errors
      }
      try {
        if (organizationName) await Organization.ui.delete(page, organizationName);
      } catch {
        // Ignore cleanup errors
      }
    }
  });
});
