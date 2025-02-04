import { expect, Page } from '@playwright/test';
import { clearTableFilters } from './clearTableFilters';
import { filterTableBySelect } from './filterTableBySelect';
import { selectTableFilter } from './selectTableFilter';

export async function clickTableRow(text: string, page: Page) {
  await page.getByRole('row', { name: text }).getByRole('link', { name: text }).click();
}

export async function clickTableRowWithFilter(name: string, page: Page) {
  await page.getByLabel('table view', { exact: true }).click();
  await clearTableFilters(page);
  await selectTableFilter('Name', page);
  await filterTableBySelect(name, page);
  await clickTableRow(name, page);
  await expect(page.getByRole('heading', { name: name, exact: true })).toBeVisible();
}
