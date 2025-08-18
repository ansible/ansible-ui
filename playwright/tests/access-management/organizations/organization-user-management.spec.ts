import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { navigateTo } from '../../../commands/navigateTo';
import { clickTableRow } from '../../../commands/clickTableRow';
import { createUser, deleteUser } from '../users/user-utils';
import {
  addUserToOrganization,
  createOrganization,
  deleteOrganization,
} from './organization-utils';
import { filterTable } from '../../../commands/filterTable';

test.describe('Organization User Management', () => {
  let organizationName: string;
  let username: string;

  test.beforeEach(async ({ page }) => {
    await setupBefore({ path: '/' })({ page });
    organizationName = await createOrganization(page);
    username = await createUser({}, page);
  });

  test.afterEach(async ({ page }) => {
    await deleteUser(username, page);
    await deleteOrganization(organizationName, page);
    await setupAfter({ page });
  });

  test(
    'should successfully add a user to an organization with organization member role',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Add user to organization using the helper function
      await addUserToOrganization(
        organizationName,
        username,
        { roles: ['Organization Member'] },
        page
      );

      // Verify the user appears in the organization's user list
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: username,
        },
        page
      );

      // Assert the user is present in the table
      await expect(page.locator('tbody')).toContainText(username);

      // Verify the user has been assigned to the organization by checking the Users tab
      await page.getByRole('tab', { name: 'Users' }).click();

      // Verify the user appears in the users table
      await expect(page.locator('tbody')).toContainText(username);

      // Now verify the role assignment by checking the user's roles page
      await navigateTo(page, 'Access Management', 'Users');
      await clickTableRow({ filterLabel: 'Username', text: username }, page);
      await page.getByRole('tab', { name: 'Roles' }).click();

      // Verify the specific organization role appears - target by column position
      const memberRoleRow = page
        .locator('tbody tr')
        .filter({
          has: page.locator('td').nth(1).getByText(organizationName, { exact: true }),
        })
        .filter({
          has: page
            .locator('td')
            .nth(2)
            .getByText('Has member permission to a single organization', { exact: true }),
        });
      await expect(memberRoleRow).toBeVisible();
    }
  );

  test(
    'should successfully add a user to an organization with multiple roles',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Add user to organization with multiple roles
      await addUserToOrganization(
        organizationName,
        username,
        { roles: ['Organization Member', 'Organization Admin'] },
        page
      );

      // Verify the user appears in the organization's user list
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: username,
        },
        page
      );

      // Assert the user is present in the table
      await expect(page.locator('tbody')).toContainText(username);

      // Verify both roles were assigned by checking the user's roles page
      await navigateTo(page, 'Access Management', 'Users');
      await clickTableRow({ filterLabel: 'Username', text: username }, page);
      await page.getByRole('tab', { name: 'Roles' }).click();

      // Verify the Organization Member role appears - target by column position
      const memberRoleRowMultiple = page
        .locator('tbody tr')
        .filter({
          has: page.locator('td').nth(1).getByText(organizationName, { exact: true }),
        })
        .filter({
          has: page
            .locator('td')
            .nth(2)
            .getByText('Has member permission to a single organization', { exact: true }),
        });
      await expect(memberRoleRowMultiple).toBeVisible();

      // Verify the Organization Admin role appears - target by column position
      const adminRoleRow = page
        .locator('tbody tr')
        .filter({
          has: page.locator('td').nth(1).getByText(organizationName, { exact: true }),
        })
        .filter({
          has: page
            .locator('td')
            .nth(2)
            .getByText(
              'Has all permissions to a single organization and all objects inside of it',
              { exact: true }
            ),
        });
      await expect(adminRoleRow).toBeVisible();
    }
  );

  test(
    'should display correct warning modal when removing a user from organization',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // First, add the user to the organization
      await addUserToOrganization(
        organizationName,
        username,
        { roles: ['Organization Member', 'Organization Admin'] },
        page
      );

      // Filter to find the specific user in the organization
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: username,
        },
        page
      );

      // Click on the user row to access actions
      await page.locator('tbody tr').first().locator('button.toggle-kebab').first().click();

      // Click on "Remove user" action
      await page.getByRole('menuitem', { name: 'Remove user' }).click();

      // Verify the removal modal appears with correct content
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Assert the modal title
      await expect(
        modal.getByRole('heading', { name: 'Remove users from organization' })
      ).toBeVisible();

      // Assert all modal content in one comprehensive check
      const modalText = await modal.textContent();
      const expectedTexts = [
        'Are you sure you want to remove the user below?',
        'This will remove all directly assigned organization roles for this user',
        'If the user has indirectly assigned roles through a team assignment',
        'manage the teams assignments or remove the user from the team',
        'Yes, I confirm that I want to remove these 1 users from the organization.',
        username,
      ];

      expectedTexts.forEach((text) => {
        expect(modalText).toContain(text);
      });

      // Verify the "Remove users" button is present
      await expect(modal.getByRole('button', { name: 'Remove users' })).toBeVisible();
      await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();

      // Check the confirmation checkbox to enable the Remove button
      await modal.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();

      // Proceed with the removal
      await modal.getByRole('button', { name: 'Remove users' }).click();

      // Wait for the modal to close and verify the user is no longer in the list
      await expect(modal).toBeHidden();

      // Re-filter and verify the user is no longer present
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: username,
        },
        page
      );

      // Verify the user is no longer present - table should be empty or show no results
      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount === 0) {
        // Table is completely empty - user was successfully removed
        expect(rowCount).toBe(0);
      } else {
        // Table has rows but should show "No results found" or similar
        await expect(tableRows.first()).toContainText(
          /No results found|No data|No matching records/i
        );
      }

      // Verify that the organization roles are removed from the user's roles page
      await navigateTo(page, 'Access Management', 'Users');
      await clickTableRow({ filterLabel: 'Username', text: username }, page);
      await page.getByRole('tab', { name: 'Roles' }).click();

      // Verify no organization roles exist for this specific organization - target by Resource Name column
      const orgRoleRows = page.locator('tbody tr').filter({
        has: page.locator('td').nth(1).getByText(organizationName, { exact: true }),
      });

      // The organization roles should be completely removed
      await expect(orgRoleRows).toHaveCount(0);
    }
  );

  test(
    'should cancel user removal when cancel button is clicked in modal',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // First, add the user to the organization
      await addUserToOrganization(
        organizationName,
        username,
        { roles: ['Organization Member'] },
        page
      );

      // Filter to find the specific user in the organization
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: username,
        },
        page
      );

      // Click on the user row to access actions
      await page.locator('tbody tr').first().locator('button.toggle-kebab').first().click();

      // Click on "Remove user" action
      await page.getByRole('menuitem', { name: 'Remove user' }).click();

      // Verify the removal modal appears
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Click Cancel button
      await modal.getByRole('button', { name: 'Cancel' }).click();

      // Verify the modal closes
      await expect(modal).toBeHidden();

      // Verify the user is still in the organization
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: username,
        },
        page
      );

      await expect(page.locator('tbody')).toContainText(username);
    }
  );
});
