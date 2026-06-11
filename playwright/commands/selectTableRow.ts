import { expect, Page } from '@playwright/test';
import { filterTable, FilterTableOptions } from './filterTable';

export async function selectTableRow(options: FilterTableOptions, page: Page) {
  await filterTable(options, page);
  await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('table tbody tr')).toHaveCount(1);
  await page.getByRole('checkbox', { name: `Select row` }).first().click();
}
