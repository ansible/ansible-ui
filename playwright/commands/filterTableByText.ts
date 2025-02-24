import { Page, expect } from '@playwright/test';

/**
 * This helper function allows a Playwright test to filter the different tables
 * present in the UI. It will work for the list tables in Automation Execution that
 * includes the new Search feature, and it will also work in the older list tables
 * that have 'contains' as the default filter type.
 * This helper function will also assert the presence of the string of text that was
 * searched for appearing inside the table.
 *
 * Example: await page.filterTableByText('jobTemplateName', 'Enter search', page, { applyFilterButton: false })
 *
 * @param resourceName: String containing the name of the text to filter by.
 * @param placeholderText: String containing the placeholder text in the input box.
 * @param page
 * @param options: Boolean that indicates true if there is an apply_filter button and
 * false if there is no apply_filter button.
 */

export async function filterTableByText(
  resourceName: string,
  placeholderText: string,
  page: Page,
  applyFilterButton: boolean
) {
  if (applyFilterButton === true) {
    await page.getByPlaceholder(placeholderText).fill(resourceName);
    await page.getByLabel('apply filter').click();
    await expect(page.locator('tr', { hasText: resourceName })).toBeVisible();
  } else if (applyFilterButton === false) {
    await page.getByPlaceholder(placeholderText).fill(resourceName);
    await expect(page.locator('tr', { hasText: resourceName })).toBeVisible();
  }
}
