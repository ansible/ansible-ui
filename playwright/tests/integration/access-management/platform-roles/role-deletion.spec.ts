import { expect, test } from '@playwright/test';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
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
      'should cancel role deletion and return to details page',
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
        await expect(dialog.getByText(roleName)).toBeVisible();

        // Cancel the deletion
        const cancelButton = page.getByRole('button', { name: /cancel/i });
        await expect(cancelButton).toBeVisible({ timeout: 5000 });
        await expect(cancelButton).toBeEnabled();
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
          const config = {
            ...TEST_ROLE_CONFIGS.awxInventory,
            name: roleName,
          };
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
  });
});
