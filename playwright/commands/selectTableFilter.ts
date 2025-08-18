import { expect, Page } from '@playwright/test';

export async function selectTableFilter(name: string, page: Page) {
  await page.click('#filter');
  await page.getByRole('option', { name }).click();
  await expect(page.locator('#filter')).toContainText(name);
}
