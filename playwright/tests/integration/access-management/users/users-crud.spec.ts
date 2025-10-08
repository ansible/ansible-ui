import { expect, test } from '@playwright/test';
import { bulkDeleteResources } from '../../../../commands/bulkDeleteResources';
import { clearTableFilters } from '../../../../commands/clearTableFilters';
import { deleteResourceFromList } from '../../../../commands/deleteResourceFromList';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import { createUser, deleteUser, editUser, editUserFromDetailsPage } from './user-utils';

test.beforeEach(setupBefore({ path: '/access/users' }));
test.afterEach(setupAfter);

test.describe('Users - Create, Edit and Delete', () => {
  test(
    'edits a user from the list view and deletes it from the ui',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const originalUserName = await createUser({}, page);
      const editedUserName = `edited-${originalUserName}`;

      try {
        await editUser(originalUserName, editedUserName, page);
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
      const originalUserName = await createUser({}, page);
      const editedUserName = `edited-${originalUserName}`;

      try {
        await editUserFromDetailsPage(originalUserName, editedUserName, page);
        await deleteUser(editedUserName, page);
      } catch (error) {
        try {
          await deleteUser(editedUserName, page);
        } catch {
          // Ignore cleanup errors
          await deleteUser(originalUserName, page);
        }
        throw error;
      }
    }
  );

  test('bulk deletes users from the toolbar action', { tag: ['@not_mock'] }, async ({ page }) => {
    const user1Name = await createUser({}, page);
    const user2Name = await createUser({}, page);

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
        await deleteUser(user1Name, page);
      } catch {
        // Ignore cleanup errors
      }
      try {
        await deleteUser(user2Name, page);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  });
});
