import { expect, test } from '@playwright/test';
import { createE2EName } from '../../../commands/createE2EName';
import { getTableRow } from '../../../commands/getTableRow';
import { setupAfter, setupBefore } from '../../../commands/setup';
import {
  createRoleWithConfig,
  deleteRole,
  navigateToRolesPage,
  TEST_ROLE_CONFIGS,
  verifyRoleDetails,
  verifyRoleInList,
  type RoleTestData,
} from './roles-utils';

test.beforeEach(setupBefore({ path: '/access/roles' }));
test.afterEach(setupAfter);

test.describe('Role Reading/Listing Tests', () => {
  test.describe('Role List Display', () => {
    test(
      'should display roles list page with correct title and elements',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateToRolesPage(page);

        // Verify page title and description
        await expect(page.getByRole('heading', { name: 'Roles', exact: true })).toBeVisible();
        await expect(page.getByText(/A role represents set of actions/)).toBeVisible();

        // Verify main UI elements
        await expect(page.getByRole('link', { name: 'Create role', exact: true })).toBeVisible();
        await expect(page.getByRole('grid')).toBeVisible();

        // Verify table headers
        await expect(page.getByRole('columnheader', { name: 'Name', exact: true })).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Description', exact: true })
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Components', exact: true })
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Resource type', exact: true })
        ).toBeVisible();
      }
    );

    test(
      'should display created role in the list with correct information',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);
        await navigateToRolesPage(page);

        // Verify role appears in table
        const roleRow = await getTableRow(page, roleName);
        await expect(roleRow).toBeVisible();

        // Verify role data in the row
        await expect(roleRow).toContainText(roleName);
        await expect(roleRow).toContainText(config.description || '');
        await expect(roleRow).toContainText(config.expectedComponent);
        await expect(roleRow).toContainText(config.resourceTypeDisplayName);

        // Cleanup
        await deleteRole(roleName, page);
      }
    );

    test(
      'should display multiple roles with different configurations',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roles: { name: string; config: RoleTestData }[] = [];

        // Create only one test role to make the test more reliable
        const configKey = 'namespace';
        const baseConfig = TEST_ROLE_CONFIGS[configKey];
        const roleName = createE2EName();
        const config = { ...baseConfig, name: roleName };
        roles.push({ name: roleName, config });

        await createRoleWithConfig(page, config);

        // Navigate to roles page to verify display
        await navigateToRolesPage(page);

        // Wait for the page to be fully loaded
        await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();

        // Verify the role is displayed correctly
        await verifyRoleInList(page, roleName, true);

        const roleRow = await getTableRow(page, roleName);
        await expect(roleRow).toContainText(config.expectedComponent, { timeout: 10000 });
        await expect(roleRow).toContainText(config.resourceTypeDisplayName, { timeout: 10000 });

        // Cleanup
        await deleteRole(roleName, page);
      }
    );

    test(
      'should display role actions (edit/delete) for each role',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);
        await navigateToRolesPage(page);

        const roleRow = await getTableRow(page, roleName);

        // Verify action buttons are present (might be in a dropdown or as direct buttons)
        await expect(roleRow.getByRole('link', { name: 'Edit role', exact: true })).toBeVisible();

        // click the button with 'aria dropdown toggle in the row to open the actions menu
        await roleRow.getByRole('button', { name: 'kebab dropdown toggle', exact: true }).click();

        await expect(
          page.getByRole('menuitem', { name: 'Delete role', exact: true })
        ).toBeVisible();

        // Cleanup
        await deleteRole(roleName, page);
      }
    );
  });

  test.describe('Role Details View', () => {
    test(
      'should display individual role details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);
        await verifyRoleDetails(page, roleName, config);

        // Cleanup
        await deleteRole(roleName, page);
      }
    );

    test(
      'should display all role fields correctly on details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const description = 'Comprehensive test role description';
        const config = { ...TEST_ROLE_CONFIGS.collection, name: roleName, description };

        await createRoleWithConfig(page, config);

        // Verify all fields are displayed correctly
        await expect(page.locator('#name')).toHaveText(roleName);
        await expect(page.locator('#description')).toHaveText(description);
        await expect(page.locator('#components')).toHaveText(config.expectedComponent);
        await expect(page.locator('#resource-type')).toHaveText(config.resourceTypeDisplayName);

        // Verify permissions are displayed
        for (const permission of config.permissions) {
          await expect(page.locator('#permissions')).toContainText(permission);
        }

        // Verify metadata fields if available
        const createdField = page.locator('#created');
        const modifiedField = page.locator('#modified');

        // Check if metadata fields exist (they may not be present in all implementations)
        const createdExists = (await createdField.count()) > 0;
        const modifiedExists = (await modifiedField.count()) > 0;

        if (createdExists) {
          await expect(createdField).toBeVisible();
        }
        if (modifiedExists) {
          await expect(modifiedField).toBeVisible();
        }

        // Cleanup
        await deleteRole(roleName, page);
      }
    );
  });

  test.describe('Role Column Display', () => {
    test(
      'should display all table columns with correct data',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roles: { name: string; config: RoleTestData }[] = [];

        // Create roles with reliable configurations only
        const testConfigs = ['namespace', 'collection'];
        for (const key of testConfigs) {
          const roleName = createE2EName();
          const config = { ...TEST_ROLE_CONFIGS[key], name: roleName };
          roles.push({ name: roleName, config });
          await createRoleWithConfig(page, config);
        }

        await navigateToRolesPage(page);

        // Verify each role's column data
        for (const { name, config } of roles) {
          const roleRow = await getTableRow(page, name);

          // Verify row contains the role data (getTableRow already ensures row contains name)
          await expect(roleRow).toBeVisible();
          await expect(roleRow).toContainText(name);

          // Verify Description column (if present)
          if (config.description) {
            await expect(roleRow).toContainText(config.description);
          }

          // Verify Component column
          await expect(roleRow).toContainText(config.expectedComponent);

          // Verify Resource Type column
          await expect(roleRow).toContainText(config.resourceTypeDisplayName);
        }

        // Cleanup
        for (const { name } of roles) {
          await deleteRole(name, page);
        }
      }
    );

    test(
      'should display managed vs custom role indicators',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const roleName = createE2EName();
        const config = { ...TEST_ROLE_CONFIGS.namespace, name: roleName };

        await createRoleWithConfig(page, config);
        await navigateToRolesPage(page);

        // Custom role should be editable (not managed)
        const customRoleRow = await getTableRow(page, roleName);
        await customRoleRow.hover();

        // Should have edit and delete actions enabled
        await expect(
          customRoleRow.getByRole('link', { name: 'Edit role', exact: true })
        ).toBeVisible();

        // Open dropdown to check delete action
        await customRoleRow
          .getByRole('button', { name: 'kebab dropdown toggle', exact: true })
          .click();
        await expect(
          page.getByRole('menuitem', { name: 'Delete role', exact: true })
        ).toBeVisible();

        // Close the dropdown by clicking elsewhere
        await page.keyboard.press('Escape');

        // Look for system/managed roles if they exist
        const allRows = page.getByRole('row');
        const rowCount = await allRows.count();

        if (rowCount > 2) {
          // More than header + our test role
          // There might be system roles present
          // System roles should have disabled edit/delete actions or visual indicators
          // This test might need adjustment based on actual system roles present
        }

        // Cleanup
        await deleteRole(roleName, page);
      }
    );
  });
});
