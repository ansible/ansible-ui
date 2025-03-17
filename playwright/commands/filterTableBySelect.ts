import { Page } from '@playwright/test';

export async function filterTableBySelect(name: string, page: Page) {
  await page.click('#filter-input');
  await page.getByLabel('Search input').fill(name);
  await page.getByRole('checkbox', { name }).click();
  await page.waitForTimeout(200); // Wait for input debounce
  await page.click('#filter-input');
  await page.waitForTimeout(200); // Wait for input debounce
}
