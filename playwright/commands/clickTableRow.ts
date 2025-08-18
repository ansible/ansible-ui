import { expect, Page } from '@playwright/test';
import { SetOptional } from 'type-fest';
import { filterTable, FilterTableOptions } from './filterTable';

type ClickTableRowOptions = {
  text: string;
} & SetOptional<FilterTableOptions, 'filterValue'>;

/**
 * Clicks on a table row based on the provided options and verifies that the corresponding page is visible.
 * Asserts 1 search result returned.
 *
 * @param options - The options to configure the table row click action.
 * @param options.pageTitle - The title of the page where the table is located.
 * @param options.filterLabel - The label of the filter to be used (default is 'Name').
 * @param options.filterValue - The value to filter the table by (default is the text of the row).
 * @param options.clearFilters - defaults to false. Must set to true to clear previous filters.
 * @param options.text - The text content of the row to be clicked.
 * @param page - The Playwright Page object representing the browser page.
 *
 * @returns A promise that resolves when the row is clicked and the corresponding page is verified to be visible.
 *
 * @example
 * ```typescript
 * await clickTableRow({ text: 'John Doe' }, page);
 * ```
 *
 * @example
 * ```typescript
 * await clickTableRow({
 *   filterLabel: 'Username',
 *   text: username,
 * });
 *
 */
export async function clickTableRow(options: ClickTableRowOptions, page: Page) {
  if (await page.getByRole('button', { name: 'table view' }).isVisible()) {
    await page.getByRole('button', { name: 'table view' }).click({ timeout: 5000 });
  }
  await filterTable(
    {
      pageTitle: options.pageTitle,
      filterLabel: options.filterLabel ?? 'Name',
      filterValue: options.filterValue ?? options.text,
      clearFilters: options.clearFilters ?? false,
    },
    page
  );
  await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('table tbody tr')).toHaveCount(1);
  await page
    .getByRole('row', { name: options.text })
    .getByRole('link', { name: options.text })
    .click();
  await expect(page.getByRole('heading', { name: options.text })).toBeVisible();
}
