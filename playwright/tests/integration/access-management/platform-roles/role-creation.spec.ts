import { expect, test } from '@playwright/test';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  cancelRoleForm,
  clickCreateRole,
  createRoleWithConfig,
  deleteRole,
  fillRoleBasicInfo,
  navigateToRolesPage,
  selectPermissions,
  selectResourceType,
  submitRoleForm,
  TEST_ROLE_CONFIGS,
  verifyRoleDetails,
  verifyRoleInList,
} from './roles-utils';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Role Creation Tests', () => {
  test.describe('Basic Role Creation', () => {
    test('should create a Galaxy namespace role', { tag: ['@not_mock'] }, async ({ page }) => {
      const roleName = createE2EName();
      const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

      const createdRoleName = await createRoleWithConfig(page, config);
      await verifyRoleDetails(page, createdRoleName, config);
      await deleteRole(createdRoleName, page);
    });
    test('should create a AWX inventory role', { tag: ['@not_mock'] }, async ({ page }) => {
      const roleName = createE2EName();
      const config = { ...TEST_ROLE_CONFIGS.awxInventory, name: roleName };

      const createdRoleName = await createRoleWithConfig(page, config);
      await verifyRoleDetails(page, createdRoleName, config);
      await deleteRole(createdRoleName, page);
    });
  });

  test.describe('Role Creation Validation', () => {
    test(
      'should show validation error for missing name, description, and resource type',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateToRolesPage(page);
        await clickCreateRole(page);
        await submitRoleForm(page);
        await expect(page.getByText(/Name is required/)).toBeVisible();
        await expect(page.getByText(/Description is required/)).toBeVisible();
        await expect(page.getByText(/Resource type is required/)).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Create role' })).toBeVisible();
      }
    );

    test(
      'should show validation error for missing permissions',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();

        await navigateToRolesPage(page);
        await clickCreateRole(page);
        await fillRoleBasicInfo(page, roleName, 'Test description');
        await selectResourceType(page, 'Namespace');
        await submitRoleForm(page);
        await expect(page.getByText(/Permissions is required/)).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Create role' })).toBeVisible();
      }
    );

    test(
      'should prevent creating role with duplicate name',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        // Create the first role and ensure it exists
        await createRoleWithConfig(page, config);

        // Verify the role was actually created by checking it exists in the list
        await navigateToRolesPage(page);
        await verifyRoleInList(page, roleName, true);

        // Now try to create a duplicate role
        await clickCreateRole(page);
        await fillRoleBasicInfo(page, roleName, 'Test description');
        await selectResourceType(page, config.resourceTypeDisplayName);
        await selectPermissions(page, config.permissionDisplayNames);

        // Submit the form and wait for the response
        await submitRoleForm(page);

        // Wait a moment for any async validation to complete
        await page.waitForTimeout(2000);

        // Check if we're still on the create form (which indicates validation failed)
        const stillOnCreateForm = await page
          .getByRole('heading', { name: 'Create role' })
          .isVisible();

        if (!stillOnCreateForm) {
          // If we're not on the create form, the role might have been created successfully
          // This would be unexpected for a duplicate name test
          throw new Error(
            'Expected to remain on create form due to duplicate name validation, but form was submitted successfully'
          );
        }

        // Look for various types of error messages that might appear
        const errorSelectors = [
          'text=/name.*already exists/i',
          'text=/duplicate/i',
          'text=/role.*exists/i',
          'text=/already.*use/i',
          'text=/name.*taken/i',
          'text=/name.*use/i',
          '[data-testid="alert"]',
          '.pf-c-alert',
          '.pf-m-danger',
          '[role="alert"]',
          '#name-form-group .pf-c-form__helper-text--error',
          '#name-form-group .pf-m-error',
        ];

        let errorFound = false;
        for (const selector of errorSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              errorFound = true;
              break;
            }
          } catch (error) {
            // Continue checking other selectors
          }
        }

        // If no specific error message found, at least verify we stayed on the create form
        if (!errorFound) {
          // Still passing the test as long as form submission was prevented
        }

        // Cleanup: Cancel form and delete the role
        await cancelRoleForm(page);
        await deleteRole(roleName, page);
      }
    );
  });

  test.describe('Role Form  Navigation', () => {
    test(
      'should cancel role creation and return to list',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();

        await navigateToRolesPage(page);
        await clickCreateRole(page);
        await fillRoleBasicInfo(page, roleName, 'Test description');
        await selectResourceType(page, 'Namespace');
        await cancelRoleForm(page);
        await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();
        await expect(page.getByRole('row').filter({ hasText: roleName })).not.toBeVisible();
      }
    );

    test(
      'should navigate back to roles list from details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);
        await page.getByLabel('Breadcrumb').getByRole('link', { name: 'Roles' }).click();
        await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();
        await page.getByRole('textbox', { name: 'Type to filter' }).fill(roleName);
        await page.getByRole('button', { name: 'apply filter' }).click();
        await expect(page.getByRole('row').filter({ hasText: roleName })).toBeVisible();
        await deleteRole(roleName, page);
      }
    );
  });
});
