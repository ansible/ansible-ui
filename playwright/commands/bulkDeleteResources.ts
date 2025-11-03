import { expect, Page } from '@playwright/test';
import { clearTableFilters } from './clearTableFilters';
import { filterTable } from './filterTable';
import { navigateTo } from './navigateTo';

export interface BulkDeleteOptions {
  resourceType: string; // e.g., 'users', 'teams', 'organizations'
  resourceNames: string[];
  filterLabel?: string; // e.g., 'Username', 'Name'
  navigationPath: string[]; // e.g., ['Access Management', 'Users'] or ['Automation Execution', 'Infrastructure', 'Execution Environments']
}

/**
 * Generic bulk delete function for resources from list view using toolbar actions
 * Follows the established pattern from Cypress tests
 */
export async function bulkDeleteResources(options: BulkDeleteOptions, page: Page) {
  const { resourceType, resourceNames, navigationPath } = options;

  // Navigate to the resource list
  await navigateTo(page, ...navigationPath);

  // Clear any existing filters first
  await clearTableFilters(page);

  // Select each resource by filtering for it individually, then clear filter to maintain selections
  for (const resourceName of resourceNames) {
    // Filter for this specific resource to bring it into view
    await filterTable(
      { filterLabel: options.filterLabel ?? 'Name', filterValue: resourceName },
      page
    );

    // Wait for the filtered result to appear
    await expect(page.locator('tr', { hasText: resourceName })).toBeVisible({ timeout: 10000 });
    await page.getByRole('checkbox', { name: 'Select row' }).first().click();

    // Clear the filter to show all items while maintaining the selection
    await clearTableFilters(page);
  }

  // Click toolbar actions dropdown
  await page.getByRole('button', { name: 'toolbar actions' }).click();
  await expect(page.getByRole('menuitem', { name: `Delete ${resourceType}` })).toBeVisible();
  await page.getByRole('menuitem', { name: `Delete ${resourceType}` }).click();

  // Handle confirmation modal (follows Cypress pattern)
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Click confirmation checkbox (try multiple patterns)
  const confirmCheckbox = page
    .locator('#confirm')
    .or(page.getByRole('checkbox').filter({ hasText: /confirm.*delete/i }))
    .or(page.getByRole('checkbox').first());
  await expect(confirmCheckbox).toBeVisible();
  await confirmCheckbox.click();

  // Click submit button
  const submitButton = page
    .locator('#submit')
    .or(page.getByRole('button', { name: `Delete ${resourceType}`, exact: true }))
    .or(page.getByRole('button').filter({ hasText: /delete/i }));
  await expect(submitButton).toBeVisible();
  await submitButton.click();

  // Verify success - scope to the results table to avoid strict mode violations
  await expect(
    page
      .getByLabel(`Permanently delete ${resourceType}`)
      .getByText('Success', { exact: true })
      .first()
  ).toBeVisible();

  // Clear any remaining filters after bulk delete to ensure clean table state
  await clearTableFilters(page);
}
