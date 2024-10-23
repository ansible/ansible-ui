import { Page } from '@playwright/test';

export async function filterTableBySelect(name: string, page: Page) {
  await page.click('#filter-input');
  await page.getByLabel('Search input').fill(name);
  await page.locator('#filter-input-select').getByLabel(name).click();
  await page.click('#filter-input');
}
