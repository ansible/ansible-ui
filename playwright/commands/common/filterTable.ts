import { Page } from '@playwright/test';

export async function filterTable(organizationName: string, page: Page) {
  await page.click('#filter-input');
  await page.getByLabel('Search input').fill(organizationName);
  await page.locator('#filter-input-select').getByLabel(organizationName).click();
  await page.click('#filter-input');
}
