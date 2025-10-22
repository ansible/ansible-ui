import { expect, test } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { getTableRow } from '@ansible/playwright/commands/getTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  cancelRoleForm,
  createRoleWithConfig,
  deleteRole,
  editRoleFromDetailsPage,
  navigateToRolesPage,
  submitRoleForm,
  TEST_ROLE_CONFIGS,
  verifyRoleInList,
} from './roles-utils';

test.beforeEach(setupBefore({ path: '/access/roles' }));
test.afterEach(setupAfter);

test.describe('Role Editing Tests', () => {
  test.describe('Basic Role Editing', () => {
    test(
      'should edit both name and description together',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const originalName = createE2EName();
        const newName = createE2EName();
        const originalDescription = 'Original description';
        const newDescription = 'New description';
        const config = {
          ...TEST_ROLE_CONFIGS.namespace,
          name: originalName,
          description: originalDescription,
        };

        await createRoleWithConfig(page, config);

        // Verify we're on the role details page with original values
        await expect(page.getByRole('heading', { name: originalName })).toBeVisible();
        await expect(page.locator('#name')).toHaveText(originalName);
        await expect(page.locator('#description')).toHaveText(originalDescription);

        // Edit both name and description (we're already on the details page)
        await editRoleFromDetailsPage(page, { name: newName, description: newDescription });

        // Verify both changes
        await expect(page.getByRole('heading', { name: newName })).toBeVisible();
        await expect(page.locator('#name')).toHaveText(newName);
        await expect(page.locator('#description')).toHaveText(newDescription);
        // Cleanup
        await deleteRole(newName, page);
      }
    );
  });

  test.describe('Edit Form Validation', () => {
    test(
      'should validate required name field during edit',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);

        // Navigate to edit page
        await navigateToRolesPage(page);
        await clickTableRow({ text: roleName }, page);
        await clickPageAction('Edit role', page);

        // Clear the name field
        await page.getByRole('textbox', { name: 'Name' }).fill('');
        await submitRoleForm(page, 'Save role');

        // Should show validation error
        await expect(page.getByText(/Name is required/)).toBeVisible();

        // Cleanup - cancel and delete
        await cancelRoleForm(page);
        await deleteRole(roleName, page);
      }
    );

    test(
      'should prevent saving with duplicate name during edit',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const firstName = createE2EName();
        const secondName = createE2EName();
        const config1 = { ...TEST_ROLE_CONFIGS.namespace, name: firstName };
        const config2 = { ...TEST_ROLE_CONFIGS.namespace, name: secondName };

        // Create two roles
        await createRoleWithConfig(page, config1);
        await createRoleWithConfig(page, config2);

        // Try to edit second role to have same name as first
        await navigateToRolesPage(page);
        await clickTableRow({ text: secondName }, page);
        await clickPageAction('Edit role', page);

        await page.getByRole('textbox', { name: 'Name' }).fill('');
        await page.getByRole('textbox', { name: 'Name' }).fill(firstName);
        await submitRoleForm(page, 'Save role');

        // Should show duplicate name error
        await expect(page.getByText(/name.*already exists|duplicate/i)).toBeVisible();

        // Cleanup
        await cancelRoleForm(page);
        await deleteRole(firstName, page);
        await deleteRole(secondName, page);
      }
    );
  });

  test.describe('Edit Form Navigation and Cancellation', () => {
    test(
      'should cancel edit and return to details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const originalDescription = 'Original description';
        const config = {
          ...TEST_ROLE_CONFIGS.namespace,
          name: roleName,
          description: originalDescription,
        };

        await createRoleWithConfig(page, config);

        // Navigate to edit page
        await navigateToRolesPage(page);
        await clickTableRow({ text: roleName }, page);
        await clickPageAction('Edit role', page);

        // Make changes but cancel
        await page.getByLabel('Description').fill('');
        await page.getByLabel('Description').fill('Changed description');
        await cancelRoleForm(page);

        // Should return to details page with original data
        await expect(page.getByRole('heading', { name: roleName })).toBeVisible();
        await expect(page.locator('#description')).toHaveText(originalDescription);

        // Cleanup
        await deleteRole(roleName, page);
      }
    );

    test(
      'should navigate from list to edit via row action',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);

        // Navigate to list and click edit action
        await navigateToRolesPage(page);
        const roleRow = await getTableRow(page, roleName);
        await roleRow.getByRole('link', { name: 'Edit role', exact: true }).click();

        // Should be on edit page
        await expect(
          page.getByRole('heading', { name: new RegExp(`Edit.*${roleName}`, 'i') })
        ).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue(roleName);

        // Cleanup
        await cancelRoleForm(page);
        await deleteRole(roleName, page);
      }
    );

    test(
      'should navigate from details to edit via action button',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);

        // From details page, click edit
        await clickPageAction('Edit role', page);

        // Should be on edit page
        await expect(
          page.getByRole('heading', { name: new RegExp(`Edit.*${roleName}`, 'i') })
        ).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue(roleName);

        // Cleanup
        await cancelRoleForm(page);
        await deleteRole(roleName, page);
      }
    );
  });

  test.describe('Edit Success Scenarios', () => {
    test('should update role data in list after edit', { tag: ['@not_mock'] }, async ({ page }) => {
      const originalName = createE2EName();
      const newName = createE2EName();
      const newDescription = 'Updated description for list verification';
      const config = { ...TEST_ROLE_CONFIGS.namespace, name: originalName };

      await createRoleWithConfig(page, config);

      // Verify we're on the original role details page
      await expect(page.getByRole('heading', { name: originalName })).toBeVisible();

      // Navigate to edit page manually instead of using editRoleFromDetailsPage
      await clickPageAction('Edit role', page);
      await expect(
        page.getByRole('heading', { name: new RegExp(`Edit.*${originalName}`, 'i') })
      ).toBeVisible({ timeout: 10000 });

      // Clear and fill the name field
      await page.getByRole('textbox', { name: 'Name' }).clear();
      await page.getByRole('textbox', { name: 'Name' }).fill(newName);

      // Clear and fill the description field
      await page.getByLabel('Description').clear();
      await page.getByLabel('Description').fill(newDescription);

      // Add permissions
      await page.getByRole('button', { name: 'Permissions' }).click();
      await page.getByRole('checkbox', { name: 'Can change namespace' }).check();
      await page.getByRole('checkbox', { name: 'Can delete namespace' }).check();

      // Submit the form and wait for save operation to complete
      await page.getByRole('button', { name: 'Save role', exact: true }).click();

      // Wait for navigation back to details page with new name
      await expect(page.getByRole('heading', { name: newName })).toBeVisible({ timeout: 15000 });

      // Wait for description to be updated with retry logic
      await page.waitForFunction(
        (expectedDesc) => {
          const descElement = document.querySelector('#description');
          return descElement && descElement.textContent === expectedDesc;
        },
        newDescription,
        { timeout: 10000 }
      );

      // Verify changes on details page
      await expect(page.locator('#description')).toHaveText(newDescription);
      await expect(page.locator('#permissions')).toContainText('Can view namespace');
      await expect(page.locator('#permissions')).toContainText('Can change namespace');
      await expect(page.locator('#permissions')).toContainText('Can delete namespace');

      // Navigate to list and verify updates with proper waiting
      await navigateToRolesPage(page);

      // Wait for the list to be fully loaded
      await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();

      // Allow extra time for role data to be updated in the list
      await page.waitForTimeout(2000);

      // Verify new role data is visible
      await verifyRoleInList(page, newName, true);
      const newRoleRow = await getTableRow(page, newName);
      await expect(newRoleRow).toContainText(newDescription, { timeout: 10000 });

      await page.getByRole('button', { name: 'Details' }).click();
      await page.getByText('Can view namespace').click();
      await page.getByText('Can change namespace').click();
      await page.getByText('Can delete namespace').click();

      // Verify old name is not in list
      await verifyRoleInList(page, originalName, false);

      // Cleanup
      await deleteRole(newName, page);
    });
  });
});
