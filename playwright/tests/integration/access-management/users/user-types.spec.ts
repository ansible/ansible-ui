import { expect, test } from '@playwright/test';
import { clearTableFilters } from '../../../../commands/clearTableFilters';
import { deleteResourceFromList } from '../../../../commands/deleteResourceFromList';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import { createUser, CreateUserOptions, deleteUser } from './user-utils';

test.beforeEach(setupBefore({ path: '/access/users' }));
test.afterEach(setupAfter);

test.describe('User Types - Creates Users of Type Normal, Platform Auditor and System Admin', () => {
  test(
    'creates a system administrator in the ui and then deletes it',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const userOptions: CreateUserOptions = {
        userType: 'system-admin',
      };

      const userResult = (await createUser(userOptions, page)) as unknown as {
        userName: string;
        password: string;
        firstName: string;
        lastName: string;
        email: string;
      };

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
          await deleteUser(userResult.userName, page);
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
      const userOptions: CreateUserOptions = {
        userType: 'platform-auditor',
      };

      const userResult = (await createUser(userOptions, page)) as unknown as {
        userName: string;
        password: string;
        firstName: string;
        lastName: string;
        email: string;
      };

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
          await deleteUser(userResult.userName, page);
        } catch {
          // Ignore cleanup errors
        }
        throw error;
      }
    }
  );
});
