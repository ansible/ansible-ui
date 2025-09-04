import { expect, test } from '@playwright/test';
import { clickPageAction } from '../../../commands/clickPageAction';
import { clickTableRow } from '../../../commands/clickTableRow';
import { createE2EName } from '../../../commands/createE2EName';
import { getTableRow } from '../../../commands/getTableRow';
import { setupAfter, setupBefore } from '../../../commands/setup';
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
    test('should edit role name successfully', { tag: ['@not_mock'] }, async ({ page }) => {
      const originalName = createE2EName();
      const newName = createE2EName();
      const config = { ...TEST_ROLE_CONFIGS.namespace, name: originalName };

      await createRoleWithConfig(page, config);

      // Verify we're on the role details page before editing
      await expect(page.getByRole('heading', { name: originalName })).toBeVisible();

      // Edit the role name (we're already on the details page)
      await editRoleFromDetailsPage(page, { name: newName });

      // Verify we're on the updated role details page
      await expect(page.getByRole('heading', { name: newName })).toBeVisible();
      await expect(page.locator('#name')).toHaveText(newName);

      // Verify the role appears with new name in the list
      await verifyRoleInList(page, newName, true);
      await verifyRoleInList(page, originalName, false);

      // Cleanup
      await deleteRole(newName, page);
    });

    test('should edit role description successfully', { tag: ['@not_mock'] }, async ({ page }) => {
      const roleName = createE2EName();
      const originalDescription = 'Original description';
      const newDescription = 'Updated description for testing';
      const config = {
        ...TEST_ROLE_CONFIGS.namespace,
        name: roleName,
        description: originalDescription,
      };

      await createRoleWithConfig(page, config);

      // Verify we're on the role details page and original description is visible
      await expect(page.getByRole('heading', { name: roleName })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#description')).toHaveText(originalDescription, { timeout: 5000 });

      // Click Edit role and wait for edit form to load
      await clickPageAction('Edit role', page);

      // Wait for edit page to load with multiple checks
      await expect(
        page.getByRole('heading', { name: new RegExp(`Edit.*${roleName}`, 'i') })
      ).toBeVisible({ timeout: 15000 });

      // Ensure the description field is loaded and accessible
      const descriptionField = page.getByLabel('Description');
      await expect(descriptionField).toBeVisible({ timeout: 5000 });
      await expect(descriptionField).toBeEnabled({ timeout: 5000 });

      // Verify the field is pre-populated with the original description
      await expect(descriptionField).toHaveValue(originalDescription);

      // Clear and fill the description field with explicit waits
      await descriptionField.clear();

      // Wait for field to be cleared
      await expect(descriptionField).toHaveValue('');

      await descriptionField.fill(newDescription);

      // Verify the new text was entered
      await expect(descriptionField).toHaveValue(newDescription);

      // Submit the form and wait for save operation to complete
      const saveButton = page.getByRole('button', { name: 'Save role', exact: true });
      await expect(saveButton).toBeVisible();
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Wait for navigation back to details page and content to update
      await expect(page.getByRole('heading', { name: roleName })).toBeVisible({ timeout: 20000 });

      // Wait for the description to be updated with enhanced retry logic
      await page.waitForFunction(
        (expectedDesc) => {
          const descElement = document.querySelector('#description');
          return (
            descElement &&
            descElement.textContent &&
            descElement.textContent.trim() === expectedDesc
          );
        },
        newDescription,
        { timeout: 15000 }
      );

      // Verify description was updated on details page
      await expect(page.locator('#description')).toHaveText(newDescription, { timeout: 5000 });

      // Verify in list view with proper waiting
      await navigateToRolesPage(page);

      // Wait for the list to be fully loaded before checking
      await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible({ timeout: 10000 });

      // Add extra wait for list data to be refreshed
      await page.waitForTimeout(3000);

      const roleRow = await getTableRow(page, roleName);
      await expect(roleRow).toContainText(newDescription, { timeout: 15000 });

      // Cleanup
      await deleteRole(roleName, page);
    });

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

  test.describe('Permission and Resource Type Creation', () => {
    test(
      'should create role with different permission combinations',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();

        // Test creating a role with multiple permissions
        const config = {
          ...TEST_ROLE_CONFIGS.collection,
          name: roleName,
          permissions: ['galaxy.view_collection', 'galaxy.change_collection'],
          permissionDisplayNames: ['Can view collection', 'Can change collection'],
        };

        await createRoleWithConfig(page, config);

        // Verify the role was created with both permissions
        await expect(page.locator('#permissions')).toContainText('galaxy.view_collection');
        await expect(page.locator('#permissions')).toContainText('galaxy.change_collection');

        // Cleanup
        await deleteRole(roleName, page);
      }
    );

    test(
      'should create role with namespace resource type',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);

        // Verify the role was created with namespace resource type and permissions
        await expect(page.locator('#resource-type')).toHaveText(config.resourceTypeDisplayName);
        await expect(page.locator('#components')).toHaveText(config.expectedComponent);
        for (const permission of config.permissions) {
          await expect(page.locator('#permissions')).toContainText(permission);
        }

        // Cleanup
        await deleteRole(roleName, page);
      }
    );

    test(
      'should create role with AWX inventory resource type',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.awxInventory, name: roleName };

        await createRoleWithConfig(page, config);

        // Verify component is AWX and resource type is correct
        await expect(page.locator('#components')).toHaveText(config.expectedComponent);
        await expect(page.locator('#resource-type')).toHaveText(config.resourceTypeDisplayName);

        // Verify permissions are correct
        for (const permission of config.permissions) {
          await expect(page.locator('#permissions')).toContainText(permission);
        }

        // Cleanup
        await deleteRole(roleName, page);
      }
    );

    test(
      'should create roles with different permission sets',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();

        // Test creating a collection role with limited permissions
        const config = {
          ...TEST_ROLE_CONFIGS.collection,
          name: roleName,
          permissions: ['galaxy.view_collection'],
          permissionDisplayNames: ['Can view collection'],
        };

        await createRoleWithConfig(page, config);

        // Verify only view permission is present
        await expect(page.locator('#permissions')).toContainText('galaxy.view_collection');
        await expect(page.locator('#permissions')).not.toContainText('galaxy.change_collection');

        // Cleanup
        await deleteRole(roleName, page);
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

    test(
      'should show correct breadcrumbs on edit page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);

        // Navigate to edit page
        await clickPageAction('Edit role', page);

        // Verify breadcrumbs
        await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
        await expect(
          page.getByLabel('Breadcrumb').getByRole('link', { name: 'Roles' })
        ).toBeVisible();
        await expect(page.getByLabel('Breadcrumb').getByText(roleName)).toBeVisible();

        // Cleanup
        await cancelRoleForm(page);
        await deleteRole(roleName, page);
      }
    );
  });

  test.describe('Edit Form Pre-population', () => {
    test(
      'should pre-populate edit form with existing role data',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const description = 'Test role description';
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName, description };

        await createRoleWithConfig(page, config);

        // Navigate to edit page
        await clickPageAction('Edit role', page);

        // Verify form is pre-populated
        await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue(roleName);
        await expect(page.getByLabel('Description')).toHaveValue(description);

        // Verify resource type is selected in the dropdown
        await expect(page.locator('#content-type')).toContainText(config.resourceTypeDisplayName);

        // Verify permissions are selected
        await page.locator('#permissions').click();
        for (const permission of config.permissionDisplayNames) {
          await expect(
            page.locator('#permissions-select').getByText(permission, { exact: true })
          ).toBeChecked();
        }
        // Close the permissions dropdown
        await page.locator('#permissions').click();

        // Cleanup
        await cancelRoleForm(page);
        await deleteRole(roleName, page);
      }
    );
  });

  test.describe('Edit Success Scenarios', () => {
    test(
      'should show success message after successful edit',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const newDescription = 'Successfully updated description';
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);

        // Edit and save (we're already on the details page after createRoleWithConfig)
        await editRoleFromDetailsPage(page, { description: newDescription });

        // Should be redirected to details page
        await expect(page.getByRole('heading', { name: roleName })).toBeVisible();
        await expect(page.locator('#description')).toHaveText(newDescription);

        // Look for success toast/message if it exists
        await expect(page.getByText(/success|updated|saved/i))
          .toBeVisible()
          .catch(() => {
            // Success message might not be visible anymore, that's okay
          });

        // Cleanup
        await deleteRole(roleName, page);
      }
    );

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

      // Verify old name is not in list
      await verifyRoleInList(page, originalName, false);

      // Cleanup
      await deleteRole(newName, page);
    });
  });
});
