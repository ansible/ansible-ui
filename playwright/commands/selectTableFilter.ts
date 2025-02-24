import { Page } from '@playwright/test';

export async function selectTableFilter(name: string, page: Page) {
  await page.waitForSelector('#filter');
  await page.click('#filter');
  await page.getByRole('option', { name }).click();
}
