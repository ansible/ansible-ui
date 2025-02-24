import { Page, expect } from '@playwright/test';

/**
 * This helper function should be used to assert results following the deletion of a resource
 * from a list.
 * This helper function will account for a completely empty list or a list that is filtered
 * but returns no result.
 * @param resourceName: name of resource that was deleted; string.
 * @param placeholderText: placeholder string in search text input box.
 * @param page
 * @param applyFilterButton: boolean that indicates whether there is a button to click to
 * apply the filter or not.
 */

export async function assertNoResultsFoundForResource(
  resourceName: string,
  placeholderText: string,
  page: Page,
  applyFilterButton: boolean
) {
  const tbodyLocator = page.locator('tbody');
  if (await tbodyLocator.isVisible()) {
    await expect(tbodyLocator).toBeVisible();
    if (applyFilterButton === true) {
      await page.getByPlaceholder(placeholderText).fill(resourceName);
      await page.getByLabel('apply filter').click();
      await expect(page.getByText('No results found')).toBeVisible();
    } else if (applyFilterButton === false) {
      await page.getByPlaceholder(placeholderText).fill(resourceName);
      await expect(page.getByText('No results found')).toBeVisible();
    }
  } else if (await tbodyLocator.isHidden()) {
    await expect(page.locator('[ class*="empty-state__title-text" ]')).toBeVisible();
  }
}
