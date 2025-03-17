import { Page, expect } from '@playwright/test';
import { clearTableFilters } from './clearTableFilters';
import { filterTableBySelect } from './filterTableBySelect';
import { filterTableByText } from './filterTableByText';
import { selectTableFilter } from './selectTableFilter';

export interface FilterTableOptions {
  pageTitle?: string;
  filterLabel?: string;
  filterValue: string;
  clearFilters?: boolean;
}

/**
 * Filters a table on a web page based on the provided options.
 *
 * @param {string} [options.pageTitle] - The title of the page to wait for before filtering.
 * @param {string} options.filterLabel - The label of the filter to apply.
 * @param {string} options.filterValue - The value to filter the table by, ie, name of the job template.
 * @param {boolean} [options.clearFilters] - Whether to clear existing filters before applying the new filter.
 * @param {Page} page - The Playwright page object representing the web page.
 *
 * @returns {Promise<void>} A promise that resolves when the table has been filtered.
 *
 * @example
 * ```typescript
 * await filterTable(
 *   {
 *     pageTitle: 'Table Example',
 *     filterLabel: 'Name',
 *     filterValue: 'John Doe',
 *     clearFilters: true,
 *   },
 *   page
 * );
 * ```
 */
export async function filterTable(
  { pageTitle, filterLabel, filterValue, clearFilters }: FilterTableOptions,
  page: Page
) {
  // If the pageTitle is provided, wait for the page to have the correct title
  if (pageTitle) {
    await expect(page.getByRole('heading', { name: pageTitle, exact: true })).toBeVisible();
  }

  // Wait for the toolbar to be visible
  await page.getByRole('toolbar').isVisible();
  await page.waitForTimeout(200); //allow time for the permissions to be verified and
  // create buttons to become active

  //if a previous filter is still in effect, clear it
  if (clearFilters) {
    await clearTableFilters(page);
  }

  // If the filterLabel is provided, switch the table to that filter
  if (filterLabel) {
    if (await page.locator('#filter').isVisible()) {
      await selectTableFilter(filterLabel, page);
    }
  }

  await page.locator('#filter-input').isVisible();

  // Filter the table by the filterValue
  if (await page.locator('#filter-input').getByLabel('apply filter').isVisible()) {
    // Filter Text with Apply Button
    await filterTableByText({ filterValue }, page);
  } else if (await page.locator('button#filter-input').isVisible()) {
    // Filter by Dropdown Selection
    await filterTableBySelect(filterValue, page);
  } else {
    // Filter Text with Debounce
    await filterTableByText({ filterValue }, page);
  }
}
