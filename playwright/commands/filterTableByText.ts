import { Page, expect } from '@playwright/test';

export async function filterTableByText({ filterValue }: { filterValue: string }, page: Page) {
  await page.locator('#filter-input').locator('input').fill(filterValue);
  if (await page.getByLabel('apply filter').isVisible()) {
    await page.getByLabel('apply filter').click();
  } else {
    await expect(page.locator('tr', { hasText: filterValue })).toBeVisible();
  }
}
