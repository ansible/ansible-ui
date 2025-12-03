import { expect, test } from '@playwright/test';
import { bulkDeleteResources } from '@ansible/playwright/commands/bulkDeleteResources';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { deleteResourceFromList } from '@ansible/playwright/commands/deleteResourceFromList';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { User } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/access/users' }));
test.afterEach(setupAfter);

test.describe('Users - Create, Edit and Delete', () => {
  test(
    'edits a user from the list view and deletes it from the ui',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const userResult = await User.ui.create(page);
      const originalUserName = typeof userResult === 'string' ? userResult : userResult.userName;
      const editedUserName = `edited-${originalUserName}`;

      try {
        await User.ui.edit(page, originalUserName, editedUserName);
        await page.getByRole('tab', { name: 'Back to Users', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible();

        await deleteResourceFromList(
          {
            resourceName: editedUserName,
            resourceType: 'user',
            filterLabel: 'Username',
            navigationPath: ['Access Management', 'Users'],
          },
          page
        );
        await clearTableFilters(page);
      } catch (error) {
        try {
          await deleteResourceFromList(
            {
              resourceName: editedUserName,
              resourceType: 'user',
              filterLabel: 'Username',
              navigationPath: ['Access Management', 'Users'],
            },
            page
          );
        } catch {
          // Ignore cleanup errors
          await deleteResourceFromList(
            {
              resourceName: originalUserName,
              resourceType: 'user',
              filterLabel: 'Username',
              navigationPath: ['Access Management', 'Users'],
            },
            page
          );
        }
        throw error;
      }
    }
  );

  test(
    'edits a user from the details page and deletes it from the ui',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const userResult = await User.ui.create(page);
      const originalUserName = typeof userResult === 'string' ? userResult : userResult.userName;
      const editedUserName = `edited-${originalUserName}`;

      try {
        await User.ui.editFromDetails(page, originalUserName, editedUserName);
        await User.ui.delete(page, editedUserName);
      } catch (error) {
        try {
          await User.ui.delete(page, editedUserName);
        } catch {
          // Ignore cleanup errors
          await User.ui.delete(page, originalUserName);
        }
        throw error;
      }
    }
  );

  test('bulk deletes users from the toolbar action', { tag: ['@not_mock'] }, async ({ page }) => {
    const user1Result = await User.ui.create(page);
    const user1Name = typeof user1Result === 'string' ? user1Result : user1Result.userName;
    const user2Result = await User.ui.create(page);
    const user2Name = typeof user2Result === 'string' ? user2Result : user2Result.userName;

    try {
      await bulkDeleteResources(
        {
          resourceType: 'users',
          resourceNames: [user1Name, user2Name],
          filterLabel: 'Username',
          navigationPath: ['Access Management', 'Users'],
        },
        page
      );
      await clearTableFilters(page);
    } catch (error) {
      try {
        await User.ui.delete(page, user1Name);
      } catch {
        // Ignore cleanup errors
      }
      try {
        await User.ui.delete(page, user2Name);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  });
});
