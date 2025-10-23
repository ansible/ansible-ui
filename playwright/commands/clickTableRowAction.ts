import { Page, expect } from '@playwright/test';
import { SetOptional } from 'type-fest';
import { clearTableFilters } from './clearTableFilters';
import { filterTable, FilterTableOptions } from './filterTable';

type ClickTableRowActionOptions = {
  text: string;
  action: string;
  inKebab?: boolean;
} & SetOptional<FilterTableOptions, 'filterValue'>;

/**
 * Clicks on a specific action within a table row after applying necessary filters.
 *
 * @param options - The options for the action to be clicked.
 * @param options.pageTitle - The title of the page containing the table.
 * @param options.filterLabel - The label of the filter to be applied (defaults to 'Name').
 * @param options.filterValue - The value of the filter to be applied (defaults to options.text).
 * @param options.text - The text within the row to identify the correct row.
 * @param options.clearFilters - defaults to false. Must set to true to clear previous filters.
 * @param options.action - The label of the action to be clicked within the identified row.
 * @param page - The Playwright Page object representing the browser page.
 *
 * @returns A promise that resolves when the action has been clicked.
 */
export async function clickTableRowAction(options: ClickTableRowActionOptions, page: Page) {
  await clearTableFilters(page);

  await filterTable(
    {
      pageTitle: options.pageTitle,
      filterLabel: options.filterLabel ?? 'Name',
      filterValue: options.filterValue ?? options.text,
      clearFilters: options.clearFilters ?? false,
    },
    page
  );

  // Switch to table view if the button is present
  try {
    await page.getByRole('button', { name: 'table view' }).click();
  } catch {
    // Table view button doesn't exist, already in table view
  }

  await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('table tbody tr')).toHaveCount(1);

  // Check if action is directly visible in row, otherwise use kebab menu
  const row = page.getByRole('row', { name: options.text });
  try {
    await row.getByLabel(options.action).click();
  } catch {
    // Action not directly visible, use kebab menu
    await page.getByLabel('kebab dropdown toggle').click();
    await page.getByRole('menuitem', { name: options.action }).click();
  }
}
