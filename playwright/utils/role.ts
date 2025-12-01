import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../commands/clickPageAction';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { getTableRow } from '../commands/getTableRow';
import { navigateTo } from '../commands/navigateTo';

export interface RoleTestData {
  name: string;
  description?: string;
  resourceType: string | null;
  resourceTypeDisplayName: string;
  permissions: string[];
  permissionDisplayNames: string[];
  expectedComponent: string;
}

export const TEST_ROLE_CONFIGS: Record<string, RoleTestData> = {
  namespace: {
    name: '',
    description: 'Test role for namespace management',
    resourceType: 'galaxy.namespace',
    resourceTypeDisplayName: 'Namespace',
    permissions: ['galaxy.view_namespace'],
    permissionDisplayNames: ['Can view namespace'],
    expectedComponent: 'Automation Content',
  },
  collection: {
    name: '',
    description: 'Test role for collection management',
    resourceType: 'galaxy.collection',
    resourceTypeDisplayName: 'Namespace',
    permissions: ['galaxy.change_collection', 'galaxy.view_collection'],
    permissionDisplayNames: ['Can change collection import', 'Can view collection import'],
    expectedComponent: 'Automation Content',
  },
  awxInventory: {
    name: '',
    description: 'Test role for AWX inventory management',
    resourceType: 'awx.inventory',
    resourceTypeDisplayName: 'Inventory',
    permissions: ['awx.view_inventory'],
    permissionDisplayNames: ['Can view inventory'],
    expectedComponent: 'Automation Execution',
  },
  edaRulebook: {
    name: '',
    description: 'Test role for EDA rulebook management',
    resourceType: 'eda.rulebook',
    resourceTypeDisplayName: 'Rulebook',
    permissions: ['eda.view_rulebook'],
    permissionDisplayNames: ['Can view rulebook process'],
    expectedComponent: 'Automation Decisions',
  },
  edaProject: {
    name: '',
    description: 'Test role for EDA rulebook management',
    resourceType: 'eda.project',
    resourceTypeDisplayName: 'Project (Automation Decisions)',
    permissions: ['eda.view_project'],
    permissionDisplayNames: ['Can view project'],
    expectedComponent: 'Automation Decisions',
  },
  system: {
    name: '',
    description: 'Test role for system galaxy',
    resourceType: null,
    resourceTypeDisplayName: 'System',
    permissions: ['galaxy.view_namespace'],
    permissionDisplayNames: ['Can view namespace'],
    expectedComponent: 'Automation Content',
  },
};

export const Role = {
  ui: {
    navigate: async (page: Page): Promise<void> => {
      await navigateTo(page, 'Access Management', 'Roles');
      await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();
    },

    create: async (page: Page, resourceInput: string, roleName?: string): Promise<string> => {
      await Role.ui.navigate(page);
      await page.getByText('Create role', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create role' })).toBeVisible();

      const roleNameInput = roleName ?? createE2EName();
      await page.getByRole('textbox', { name: 'Name' }).fill(roleNameInput);
      await page.getByText('Select resource', { exact: true }).click();
      await page.getByText('Namespace', { exact: true }).click();
      await page.getByText('Select permissions', { exact: true }).click();
      await page.getByText('Can view namespace', { exact: true }).click();
      await page.getByRole('button', { name: 'Create role', exact: true }).click();
      await expect(page.getByRole('heading', { name: roleNameInput, exact: true })).toBeVisible();
      await expect(page.locator('#name')).toHaveText(roleNameInput);
      await expect(page.locator('#components')).toHaveText('Automation Content');
      await expect(page.locator('#resource-type')).toHaveText(resourceInput);
      await expect(page.locator('#permissions')).toHaveText('galaxy.view_namespace');
      return roleNameInput;
    },

    createWithConfig: async (page: Page, config: RoleTestData): Promise<string> => {
      const roleName = config.name || createE2EName();

      await Role.ui.navigate(page);
      await page.getByText('Create role', { exact: true }).click();
      await page.getByRole('textbox', { name: 'Name' }).fill(roleName);
      if (config.description) {
        await page.getByLabel('Description').fill(config.description);
      }

      await page.getByTestId('content-type').click();
      await page.waitForTimeout(3000);
      const option = page
        .getByRole('option')
        .filter({ hasText: new RegExp(config.resourceTypeDisplayName, 'i') })
        .first();
      await option.click();

      await page.locator('#permissions').click();
      await page.waitForTimeout(1000);

      for (const permission of config.permissionDisplayNames) {
        const label = page
          .locator('label')
          .filter({ hasText: new RegExp(permission, 'i') })
          .first();
        await label.waitFor({ state: 'visible', timeout: 30000 });
        const checkbox = label.locator('input[type="checkbox"]').first();
        await checkbox.waitFor({ state: 'visible', timeout: 30000 });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await page.waitForTimeout(300);
        }
      }

      await page.locator('body').click();

      await page.getByRole('button', { name: 'Create role', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create role' })).not.toBeVisible();
      await expect(page.getByRole('heading', { name: roleName, exact: true })).toBeVisible({
        timeout: 10000,
      });

      return roleName;
    },

    delete: async (page: Page, roleName: string): Promise<void> => {
      if (!roleName.startsWith('E2E ')) {
        throw new Error(
          `Safety check failed: Attempted to delete role '${roleName}' which does not appear to be a test role (must start with 'E2E ')`
        );
      }

      await Role.ui.navigate(page);
      const roleRow = await getTableRow(page, roleName);
      await roleRow.click();

      await clickPageAction('Delete role', page, roleRow);
      await confirmAndAssertDeletion(page);
    },

    deleteMultiple: async (page: Page, roleNames: string[]): Promise<void> => {
      for (const roleName of roleNames) {
        if (!roleName.startsWith('E2E ')) {
          throw new Error(
            `Safety check failed: Attempted to delete role '${roleName}' which does not appear to be a test role (must start with 'E2E ')`
          );
        }
      }

      await Role.ui.navigate(page);

      const selectedRoles = new Set<string>();

      for (const roleName of roleNames) {
        const roleRow = await getTableRow(page, roleName);
        const checkbox = roleRow.getByRole('checkbox');
        await expect(checkbox).toBeVisible();
        await checkbox.check();
        await expect(checkbox).toBeChecked();
        selectedRoles.add(roleName);
        await page.waitForTimeout(200);
      }

      if (selectedRoles.size !== roleNames.length) {
        throw new Error(
          `Failed to select all roles. Expected: ${roleNames.length}, Selected: ${selectedRoles.size}`
        );
      }

      await Role.ui.navigate(page);

      await page.getByRole('button', { name: 'toolbar actions' }).click();
      const bulkDeleteButton = page.getByRole('menuitem', { name: 'Delete selected roles' });
      const isDisabled = await bulkDeleteButton.isDisabled();
      if (isDisabled) {
        throw new Error(
          'Safety check failed: Bulk delete button is disabled, which may indicate system roles are selected'
        );
      }

      await bulkDeleteButton.click();
      await confirmAndAssertDeletion(page);
    },

    edit: async (page: Page, roleName: string, newData: Partial<RoleTestData>): Promise<void> => {
      await Role.ui.navigate(page);
      const roleRow = await getTableRow(page, roleName);
      await roleRow.click();

      await clickPageAction('Edit role', page);

      if (newData.name) {
        await page.getByRole('textbox', { name: 'Name' }).clear();
        await page.getByRole('textbox', { name: 'Name' }).fill(newData.name);
      }

      if (newData.description !== undefined) {
        await page.getByLabel('Description').clear();
        if (newData.description) {
          await page.getByLabel('Description').fill(newData.description);
        }
      }

      if (newData.resourceTypeDisplayName) {
        await page.getByTestId('content-type').click();
        await page.waitForTimeout(3000);
        const option = page
          .getByRole('option')
          .filter({ hasText: new RegExp(newData.resourceTypeDisplayName, 'i') })
          .first();
        await option.click();
      }

      if (newData.permissionDisplayNames) {
        await page.locator('#permissions').click();
        await page.waitForTimeout(1000);

        for (const permission of newData.permissionDisplayNames) {
          const label = page
            .locator('label')
            .filter({ hasText: new RegExp(permission, 'i') })
            .first();
          await label.waitFor({ state: 'visible', timeout: 30000 });
          const checkbox = label.locator('input[type="checkbox"]').first();
          await checkbox.waitFor({ state: 'visible', timeout: 30000 });
          const isChecked = await checkbox.isChecked();
          if (!isChecked) {
            await checkbox.click();
            await page.waitForTimeout(300);
          }
        }

        await page.locator('body').click();
      }

      await page.getByRole('button', { name: 'Save role', exact: true }).click();
    },

    verifyDetails: async (page: Page, roleName: string, config: RoleTestData): Promise<void> => {
      await expect(page.locator('#name')).toHaveText(roleName);
      if (config.description) {
        await expect(page.locator('#description')).toHaveText(config.description);
      }
      await expect(page.locator('#components')).toHaveText(config.expectedComponent);
      await expect(page.locator('#resource-type')).toHaveText(
        new RegExp(config.resourceTypeDisplayName, 'i')
      );

      for (const permissionDisplayName of config.permissionDisplayNames) {
        await expect(page.locator('#permissions')).toContainText(permissionDisplayName);
      }
    },

    // Helper functions for form interactions
    clickCreateRole: async (page: Page): Promise<void> => {
      await page.getByText('Create role', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create role' })).toBeVisible();
    },

    fillBasicInfo: async (page: Page, name: string, description?: string): Promise<void> => {
      await page.getByRole('textbox', { name: 'Name' }).fill(name);
      if (description) {
        await page.getByLabel('Description').fill(description);
      }
    },

    selectResourceType: async (page: Page, resourceTypeDisplay: string): Promise<void> => {
      await page.getByTestId('content-type').click();
      await page.waitForTimeout(3000);
      const option = page
        .getByRole('option')
        .filter({ hasText: new RegExp(resourceTypeDisplay, 'i') })
        .first();
      await option.click();
    },

    selectPermissions: async (
      page: Page,
      permissionDisplayNames: string[],
      clearExisting: boolean = false
    ): Promise<void> => {
      await page.locator('#permissions').click();
      await page.waitForTimeout(1000);

      if (clearExisting) {
        const closeButtons = page.getByRole('button', { name: /Close .+/ });
        const closeButtonCount = await closeButtons.count();
        for (let i = 0; i < closeButtonCount; i++) {
          await closeButtons.first().click();
          await page.waitForTimeout(200);
        }
      }

      for (const permission of permissionDisplayNames) {
        const label = page
          .locator('label')
          .filter({ hasText: new RegExp(permission, 'i') })
          .first();
        await label.waitFor({ state: 'visible', timeout: 30000 });
        const checkbox = label.locator('input[type="checkbox"]').first();
        await checkbox.waitFor({ state: 'visible', timeout: 30000 });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await page.waitForTimeout(300);
        }
      }

      await page.locator('body').click();
    },

    submitForm: async (page: Page, actionName: string = 'Create role'): Promise<void> => {
      await page.getByRole('button', { name: actionName, exact: true }).click();
    },

    cancelForm: async (page: Page): Promise<void> => {
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    },

    editFromDetailsPage: async (page: Page, newData: Partial<RoleTestData>): Promise<void> => {
      await clickPageAction('Edit role', page);

      if (newData.name) {
        await page.getByRole('textbox', { name: 'Name' }).clear();
        await page.getByRole('textbox', { name: 'Name' }).fill(newData.name);
      }

      if (newData.description !== undefined) {
        await page.getByLabel('Description').clear();
        if (newData.description) {
          await page.getByLabel('Description').fill(newData.description);
        }
      }

      if (newData.resourceTypeDisplayName) {
        await Role.ui.selectResourceType(page, newData.resourceTypeDisplayName);
      }

      if (newData.permissionDisplayNames) {
        await Role.ui.selectPermissions(page, newData.permissionDisplayNames);
      }

      await Role.ui.submitForm(page, 'Save role');
    },

    verifyInList: async (
      page: Page,
      roleName: string,
      shouldExist: boolean = true
    ): Promise<void> => {
      await Role.ui.navigate(page);

      const clearFiltersButton = page.getByRole('button', { name: 'Clear all filters' }).first();
      if (await clearFiltersButton.isVisible()) {
        await clearFiltersButton.click();
        await page.waitForTimeout(1000);
      }

      if (shouldExist) {
        const roleRow = await getTableRow(page, roleName);
        await expect(roleRow).toBeVisible();
      } else {
        await page.getByRole('textbox', { name: 'Type to filter' }).fill(roleName);
        await page.waitForTimeout(1000);
        const applyFilterButton = page.getByRole('button', { name: 'apply filter' });
        if ((await applyFilterButton.isVisible()) && (await applyFilterButton.isEnabled())) {
          await applyFilterButton.click();
          await page.waitForTimeout(3000);
        } else {
          await page.waitForTimeout(2000);
        }
        const matchingRows = page.getByRole('row').filter({ hasText: roleName });
        await expect(matchingRows).toHaveCount(0);
        const clearFiltersButton = page.getByRole('button', { name: 'Clear all filters' }).first();
        if (await clearFiltersButton.isVisible()) {
          await clearFiltersButton.click();
          await page.waitForTimeout(1000);
        }
      }
    },
  },
} as const;
