import { Page, expect } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { getTableRow } from '@ansible/playwright/commands/getTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';

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

export async function navigateToRolesPage(page: Page) {
  await navigateTo(page, 'Access Management', 'Roles');
  await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();
}

export async function clickCreateRole(page: Page) {
  await page.getByText('Create role', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Create role' })).toBeVisible();
}

export async function fillRoleBasicInfo(page: Page, name: string, description?: string) {
  await page.getByRole('textbox', { name: 'Name' }).fill(name);
  if (description) {
    await page.getByLabel('Description').fill(description);
  }
}

export async function selectResourceType(page: Page, resourceTypeDisplay: string) {
  // Click on the content type dropdown
  await page.getByTestId('content-type').click();

  // Wait for the dropdown to be visible and options to load
  await page.waitForTimeout(3000);

  // Find the option by text content with case-insensitive matching
  const option = page
    .getByRole('option')
    .filter({ hasText: new RegExp(resourceTypeDisplay, 'i') })
    .first();

  await option.click();
}

export async function selectPermissions(
  page: Page,
  permissionDisplayNames: string[],
  clearExisting: boolean = false
) {
  await page.locator('#permissions').click();

  // Wait for the dropdown to be fully expanded
  await page.waitForTimeout(1000);

  // Clear existing selections if requested
  if (clearExisting) {
    // Find and click all close buttons for currently selected permissions
    const closeButtons = page.getByRole('button', { name: /Close .+/ });
    const closeButtonCount = await closeButtons.count();

    for (let i = 0; i < closeButtonCount; i++) {
      await closeButtons.first().click();
      await page.waitForTimeout(200);
    }
  }

  // Select the specified permissions
  for (const permission of permissionDisplayNames) {
    // Use a more direct approach - find the checkbox by looking for a label with the permission text
    const label = page
      .locator('label')
      .filter({ hasText: new RegExp(permission, 'i') })
      .first();

    // Wait for the label to be visible
    await label.waitFor({ state: 'visible', timeout: 30000 });

    // Find the checkbox that's associated with this label
    const checkbox = label.locator('input[type="checkbox"]').first();

    // Wait for the checkbox to be visible and clickable
    await checkbox.waitFor({ state: 'visible', timeout: 30000 });

    // Check if the checkbox is already checked before trying to interact with it
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.click();
      await page.waitForTimeout(300);
    }
  }

  // Close the permissions dropdown by clicking outside or on the button again
  await page.locator('body').click();
}

export async function submitRoleForm(page: Page, actionName: string = 'Create role') {
  await page.getByRole('button', { name: actionName, exact: true }).click();
}

export async function cancelRoleForm(page: Page) {
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
}

export async function createRoleWithConfig(page: Page, config: RoleTestData): Promise<string> {
  const roleName = config.name || createE2EName();

  await navigateToRolesPage(page);
  await clickCreateRole(page);
  await fillRoleBasicInfo(page, roleName, config.description);
  await selectResourceType(page, config.resourceTypeDisplayName);
  await selectPermissions(page, config.permissionDisplayNames);
  await submitRoleForm(page);

  // Verify we're no longer on the create form (more flexible than expecting exact page)
  await expect(page.getByRole('heading', { name: 'Create role' })).not.toBeVisible();

  // Verify we're on the details page
  await expect(page.getByRole('heading', { name: roleName, exact: true })).toBeVisible({
    timeout: 10000,
  });

  return roleName;
}

export async function verifyRoleDetails(page: Page, roleName: string, config: RoleTestData) {
  await expect(page.locator('#name')).toHaveText(roleName);
  if (config.description) {
    await expect(page.locator('#description')).toHaveText(config.description);
  }
  await expect(page.locator('#components')).toHaveText(config.expectedComponent);
  await expect(page.locator('#resource-type')).toHaveText(
    new RegExp(config.resourceTypeDisplayName, 'i')
  );

  // Verify permissions using human-readable display names
  for (const permissionDisplayName of config.permissionDisplayNames) {
    await expect(page.locator('#permissions')).toContainText(permissionDisplayName);
  }
}

export async function editRoleFromDetailsPage(page: Page, newData: Partial<RoleTestData>) {
  // Assumes we're already on a role details page
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
    await selectResourceType(page, newData.resourceTypeDisplayName);
  }

  if (newData.permissionDisplayNames) {
    await selectPermissions(page, newData.permissionDisplayNames);
  }

  await submitRoleForm(page, 'Save role');
}

export async function editRole(page: Page, roleName: string, newData: Partial<RoleTestData>) {
  await navigateToRolesPage(page);
  const roleRow = await getTableRow(page, roleName);
  await roleRow.click();
  await editRoleFromDetailsPage(page, newData);
}

export async function verifyRoleInList(page: Page, roleName: string, shouldExist: boolean = true) {
  await navigateToRolesPage(page);

  // Clear any existing filters first
  const clearFiltersButton = page.getByRole('button', { name: 'Clear all filters' }).first();
  if (await clearFiltersButton.isVisible()) {
    await clearFiltersButton.click();
    await page.waitForTimeout(1000);
  }

  if (shouldExist) {
    // For positive verification, use getTableRow which handles filtering
    const roleRow = await getTableRow(page, roleName);
    await expect(roleRow).toBeVisible();
  } else {
    // For negative verification, use the same approach as getTableRow but check for no results
    // This ensures consistency with how filtering is handled elsewhere
    await page.getByRole('textbox', { name: 'Type to filter' }).fill(roleName);

    // Wait for the filter input to be processed and the apply button to be enabled
    await page.waitForTimeout(1000);

    // Check if the apply filter button is visible and enabled before clicking
    const applyFilterButton = page.getByRole('button', { name: 'apply filter' });
    if ((await applyFilterButton.isVisible()) && (await applyFilterButton.isEnabled())) {
      await applyFilterButton.click();
      // Wait for the filter to be applied and page to update
      await page.waitForTimeout(3000);
    } else {
      // If no apply button, the filtering might be automatic (debounced)
      await page.waitForTimeout(2000);
    }

    // Check if any rows contain the role name (excluding header row)
    const matchingRows = page.getByRole('row').filter({ hasText: roleName });
    await expect(matchingRows).toHaveCount(0);

    // Clear the filter to reset the table
    const clearFiltersButton = page.getByRole('button', { name: 'Clear all filters' }).first();
    if (await clearFiltersButton.isVisible()) {
      await clearFiltersButton.click();
      await page.waitForTimeout(1000);
    }
  }
}

export async function deleteMultipleRoles(page: Page, roleNames: string[]) {
  // Safety check: Only delete roles that match E2E test naming pattern
  for (const roleName of roleNames) {
    if (!roleName.startsWith('E2E ')) {
      throw new Error(
        `Safety check failed: Attempted to delete role '${roleName}' which does not appear to be a test role (must start with 'E2E ')`
      );
    }
  }

  await navigateToRolesPage(page);

  // Keep track of selected checkboxes to maintain state across getTableRow calls
  const selectedRoles = new Set<string>();

  // Select checkboxes for all specified roles using getTableRow helper
  // This approach works because getTableRow handles pagination and filtering correctly
  for (const roleName of roleNames) {
    // Use getTableRow helper which handles filtering automatically
    const roleRow = await getTableRow(page, roleName);

    // Check the checkbox for this role
    const checkbox = roleRow.getByRole('checkbox');
    await expect(checkbox).toBeVisible();
    await checkbox.check();

    // Verify the checkbox is actually checked
    await expect(checkbox).toBeChecked();
    selectedRoles.add(roleName);

    // Small delay to ensure the selection is registered
    await page.waitForTimeout(200);
  }

  // Verify we have selected the correct number of roles
  if (selectedRoles.size !== roleNames.length) {
    throw new Error(
      `Failed to select all roles. Expected: ${roleNames.length}, Selected: ${selectedRoles.size}`
    );
  }

  // Navigate back to the main roles page to access bulk actions
  await navigateToRolesPage(page);

  // Additional safety check: Verify bulk delete button is enabled
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
}

export async function verifyEmptyState(page: Page) {
  await navigateToRolesPage(page);
  await expect(page.getByText('No roles found')).toBeVisible();
}

/**
 * Safely cleanup all test roles (roles starting with 'E2E ')
 * This is useful for cleaning up after failed tests
 */
export async function cleanupAllTestRoles(page: Page) {
  await navigateToRolesPage(page);

  // Clear any existing filters
  const clearFiltersButton = page.getByRole('button', { name: 'Clear all filters' });
  if (await clearFiltersButton.isVisible()) {
    await clearFiltersButton.click();
  }

  // Filter for E2E test roles only
  await page.getByRole('textbox', { name: 'Type to filter' }).fill('E2E ');
  await page.getByRole('button', { name: 'apply filter' }).click();

  // Get all visible role rows
  const roleRows = page.getByRole('row').filter({ hasText: 'E2E ' });
  const rowCount = await roleRows.count();

  if (rowCount === 0) {
    return;
  }

  // Select all test roles
  for (let i = 0; i < rowCount; i++) {
    const row = roleRows.nth(i);
    const checkbox = row.getByRole('checkbox');
    if (await checkbox.isVisible()) {
      await checkbox.check();
    }
  }

  // Delete selected test roles
  await page.getByRole('button', { name: 'toolbar actions' }).click();
  const bulkDeleteButton = page.getByRole('menuitem', { name: 'Delete selected roles' });

  if (await bulkDeleteButton.isDisabled()) {
    return;
  }

  await bulkDeleteButton.click();
  await confirmAndAssertDeletion(page);
}

export async function verifyValidationError(
  page: Page,
  fieldLabel: string,
  expectedError?: string
) {
  // Check for validation error text near the field or in the form
  const errorMessage = expectedError || 'Name is required';
  await expect(page.getByText(new RegExp(errorMessage, 'i'))).toBeVisible();

  // Optionally check if the field has error styling (common CSS classes for validation errors)
  const field = page.getByLabel(fieldLabel, { exact: true });
  const hasErrorClass = await field
    .evaluate((el: HTMLElement) => {
      const classes = el.className;
      return (
        classes.includes('error') || classes.includes('invalid') || classes.includes('pf-m-error')
      );
    })
    .catch(() => false);

  // Don't require error class to be present, as some forms only show text errors
  if (hasErrorClass) {
    // Note: Using console.log for debugging, remove in production
  }
}

// Legacy function for backward compatibility
export async function createRole(page: Page, resourceInput: string, roleName?: string) {
  await navigateToRolesPage(page);
  await clickCreateRole(page);
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
}

export async function deleteRole(roleName: string, page: Page) {
  // Safety check: Only delete roles that match E2E test naming pattern
  if (!roleName.startsWith('E2E ')) {
    throw new Error(
      `Safety check failed: Attempted to delete role '${roleName}' which does not appear to be a test role (must start with 'E2E ')`
    );
  }

  await navigateToRolesPage(page);
  const roleRow = await getTableRow(page, roleName);
  await roleRow.click();

  await clickPageAction('Delete role', page, roleRow);
  await confirmAndAssertDeletion(page);
}
