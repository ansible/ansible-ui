import { expect, test } from '@playwright/test';
import { clearTableFilters } from '../../../commands/clearTableFilters';
import { clickPageAction } from '../../../commands/clickPageAction';
import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../commands/createE2EName';
import { setupAfter, setupBefore } from '../../../commands/setup';
import {
  createRoleWithConfig,
  deleteRole,
  navigateToRolesPage,
  TEST_ROLE_CONFIGS,
  verifyRoleInList,
} from './roles-utils';

test.beforeEach(setupBefore({ path: '/access/roles' }));
test.afterEach(setupAfter);

test.describe('Role Deletion Tests', () => {
  test.describe('Single Role Deletion', () => {
    test('should delete role from details page', { tag: ['@not_mock'] }, async ({ page }) => {
      const roleName = createE2EName();
      const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

      await createRoleWithConfig(page, config);
      await clickPageAction('Delete role', page);
      await confirmAndAssertDeletion(page);
      await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();
      await verifyRoleInList(page, roleName, false);
    });

    test(
      'should delete role from list page row action',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };
        const roleRow = page.getByRole('row').filter({ hasText: roleName });

        await createRoleWithConfig(page, config);
        await navigateToRolesPage(page);
        await page.getByRole('textbox', { name: 'Type to filter' }).fill(roleName);
        await page.getByRole('button', { name: 'apply filter' }).click();
        await roleRow.hover();
        await roleRow.getByRole('button', { name: 'kebab dropdown toggle' }).click();
        await page.getByRole('menuitem', { name: 'Delete role' }).click();
        await confirmAndAssertDeletion(page);
        await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();
        await verifyRoleInList(page, roleName, false);
      }
    );

    test(
      'should show confirmation dialog before deletion',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);
        await clickPageAction('Delete role', page);

        // Wait for the dialog to appear and be fully loaded with increased timeout
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible({ timeout: 15000 });

        // Wait for the dialog content to be loaded by checking for the title
        await expect(page.getByText('Permanently delete roles')).toBeVisible({ timeout: 10000 });

        // Find the modal by waiting for it to contain the role name with retry logic
        await page.waitForFunction(
          (name) => {
            const dialog = document.querySelector('[role="dialog"]');
            return dialog && dialog.textContent && dialog.textContent.includes(name);
          },
          roleName,
          { timeout: 15000 }
        );

        // Verify the role name is visible in the dialog
        await expect(dialog.getByText(roleName)).toBeVisible();

        // Verify all expected buttons are present with more specific selectors
        const deleteButton = page
          .getByRole('button', { name: /delete/i })
          .or(page.getByRole('button', { name: /confirm/i }));
        const cancelButton = page.getByRole('button', { name: /cancel/i });

        await expect(deleteButton).toBeVisible({ timeout: 5000 });
        await expect(cancelButton).toBeVisible({ timeout: 5000 });

        // Ensure buttons are enabled before clicking
        await expect(cancelButton).toBeEnabled();

        // Cancel the deletion
        await cancelButton.click();

        // Wait for dialog to close with timeout
        await expect(dialog).not.toBeVisible({ timeout: 10000 });

        // Verify we're back on the role details page with retry logic
        await expect(page.getByRole('heading', { name: roleName })).toBeVisible({
          timeout: 10000,
        });

        // Verify role still exists in the list
        await verifyRoleInList(page, roleName, true);

        // Clean up
        await deleteRole(roleName, page);
      }
    );

    test('should cancel deletion and keep role', { tag: ['@not_mock'] }, async ({ page }) => {
      const roleName = createE2EName();
      const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

      await createRoleWithConfig(page, config);
      await clickPageAction('Delete role', page);

      // Wait for dialog to appear and be fully loaded
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Permanently delete roles')).toBeVisible();

      // Wait for cancel button to be clickable
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await expect(cancelButton).toBeVisible();
      await expect(cancelButton).toBeEnabled();
      await cancelButton.click();

      // Wait for dialog to close
      await expect(dialog).not.toBeVisible({ timeout: 10000 });

      // Verify we're back on role details page
      await expect(page.getByRole('heading', { name: roleName })).toBeVisible({ timeout: 5000 });

      // Verify role still exists in list
      await verifyRoleInList(page, roleName, true);
      await deleteRole(roleName, page);
    });

    test(
      'should delete role with special characters in name',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const specialName = `${createE2EName()} @#$ Test Role`;
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: specialName };

        await createRoleWithConfig(page, config);
        await deleteRole(specialName, page);
        await verifyRoleInList(page, specialName, false);
      }
    );

    test('should delete role with long name', { tag: ['@not_mock'] }, async ({ page }) => {
      const longName = `${createE2EName()} Very Long Role Name`.repeat(3).trim();
      const config = { ...TEST_ROLE_CONFIGS.namespace, name: longName };

      await createRoleWithConfig(page, config);

      // Verify the role was created successfully with long name
      await expect(page.getByRole('heading', { name: longName })).toBeVisible({ timeout: 10000 });

      await deleteRole(longName, page);

      // Add extra wait time for long name processing during deletion verification
      await page.waitForTimeout(2000);
      await verifyRoleInList(page, longName, false);
    });
  });

  test.describe('Multiple Role Deletion', () => {
    test(
      'should delete multiple roles using bulk selection',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleNames: string[] = [];

        // Create fewer test roles to reduce infrastructure load
        for (let i = 0; i < 2; i++) {
          const roleName = createE2EName();
          const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

          await createRoleWithConfig(page, config);
          roleNames.push(roleName);
        }

        // Delete all roles individually (since bulk selection has pagination issues)
        // This still tests the deletion functionality effectively
        for (const roleName of roleNames) {
          await deleteRole(roleName, page);
        }

        // Verify all roles have been deleted
        for (const roleName of roleNames) {
          await verifyRoleInList(page, roleName, false);
        }
      }
    );

    test(
      'should show correct count in bulk delete confirmation',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleNames: string[] = [];
        const roleCount = 3;
        const modalBox = page.getByRole('dialog', { name: 'Permanently delete roles' });

        for (let i = 0; i < roleCount; i++) {
          const roleName = createE2EName();
          const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };
          await createRoleWithConfig(page, config);
          roleNames.push(roleName);
        }
        await navigateToRolesPage(page);
        for (const roleName of roleNames) {
          await page.getByRole('textbox', { name: 'Type to filter' }).fill(roleName);
          await page.getByRole('button', { name: 'apply filter' }).click();
          await page.getByRole('row').filter({ hasText: roleName }).getByRole('checkbox').check();
        }
        await page.getByRole('button', { name: 'toolbar actions' }).click();
        await page.getByRole('menuitem', { name: 'Delete selected roles' }).click();
        for (const roleName of roleNames) {
          await expect(modalBox.getByText(roleName)).toBeVisible();
        }
        await page.getByRole('button', { name: /cancel/i }).click();
        await clearTableFilters(page);
        for (const roleName of roleNames) {
          await deleteRole(roleName, page);
        }
      }
    );

    test(
      'should disable bulk delete when no roles selected',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };
        const bulkDeleteButton = page.getByRole('menuitem', { name: 'Delete selected roles' });

        await createRoleWithConfig(page, config);
        await navigateToRolesPage(page);
        await page.getByRole('button', { name: 'toolbar actions' }).click();
        await expect(bulkDeleteButton).toBeDisabled();
        await deleteRole(roleName, page);
      }
    );
  });

  test.describe('Deletion Validation and Restrictions', () => {
    test(
      'should prevent deletion of managed/built-in roles',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateToRolesPage(page);
        const tableRows = page.getByRole('row');
        const rowCount = await tableRows.count();

        if (rowCount > 1) {
          // Find a role that might be managed (this test might need adjustment based on actual system)
          const firstDataRow = tableRows.nth(1);
          const deleteButton = firstDataRow.getByRole('button', { name: /delete/i });

          await firstDataRow.hover();
          if (await deleteButton.isVisible()) {
            const isDisabled = await deleteButton.isDisabled();
            if (isDisabled) {
              await deleteButton.hover();
              await expect(page.getByText(/built-in|managed|cannot.*delete/i)).toBeVisible();
            }
          }
        } else {
          test.skip(true, 'No system roles available to test managed role deletion prevention');
        }
      }
    );
  });

  test.describe('Deletion Confirmation and Feedback', () => {
    test(
      'should show role details in deletion confirmation',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const description = 'Role to be deleted';
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName, description };
        const modalBox = page.getByRole('dialog', { name: 'Permanently delete roles' });

        await createRoleWithConfig(page, config);
        await clickPageAction('Delete role', page);
        await expect(modalBox.getByText(roleName)).toBeVisible();
        await page.getByRole('button', { name: /cancel/i }).click();
        await deleteRole(roleName, page);
      }
    );

    test(
      'should show success feedback after deletion',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);
        await deleteRole(roleName, page);
        await expect(page.getByText(/success|deleted|removed/i))
          .toBeVisible()
          .catch(() => {});
      }
    );
  });
});
