import { expect, test } from '@playwright/test';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { deleteResourceFromList } from '@ansible/playwright/commands/deleteResourceFromList';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { User, CreateUserUIOptions } from '../../../../utils/user';

test.beforeEach(setupBefore({ path: '/access/users' }));
test.afterEach(setupAfter);

test.describe('User Types - Creates Users of Type Normal, Platform Auditor and System Admin', () => {
  test(
    'creates a system administrator in the ui and then deletes it',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const userOptions: CreateUserUIOptions = {
        userType: 'system-admin',
      };

      const userResult = await User.ui.create(page, userOptions);

      try {
        await expect(
          page.getByRole('heading', { name: userResult.userName, exact: true })
        ).toBeVisible();

        await deleteResourceFromList(
          {
            resourceName: userResult.userName,
            resourceType: 'user',
            filterLabel: 'Username',
            navigationPath: ['Access Management', 'Users'],
          },
          page
        );
        await clearTableFilters(page);
      } catch (error) {
        try {
          await User.ui.delete(page, userResult.userName);
        } catch {
          // Ignore cleanup errors
        }
        throw error;
      }
    }
  );

  test(
    'creates a platform auditor in the ui and then deletes it',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const userOptions: CreateUserUIOptions = {
        userType: 'platform-auditor',
      };

      const userResult = await User.ui.create(page, userOptions);

      try {
        await expect(
          page.getByRole('heading', { name: userResult.userName, exact: true })
        ).toBeVisible();

        await expect(page.getByText('Platform auditor')).toBeVisible();

        await deleteResourceFromList(
          {
            resourceName: userResult.userName,
            resourceType: 'user',
            filterLabel: 'Username',
            navigationPath: ['Access Management', 'Users'],
          },
          page
        );
        await clearTableFilters(page);
      } catch (error) {
        try {
          await User.ui.delete(page, userResult.userName);
        } catch {
          // Ignore cleanup errors
        }
        throw error;
      }
    }
  );
});
