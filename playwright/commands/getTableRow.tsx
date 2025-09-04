import { Page } from '@playwright/test';
import { filterTable } from './filterTable';

export async function getTableRow(page: Page, hasText: string) {
  await filterTable({ clearFilters: true, filterValue: hasText }, page);
  return page.getByRole('row').filter({ hasText });
}
