import { Page } from '@playwright/test';

export async function clickTableRow(text: string, page: Page) {
  await page.getByRole('row', { name: text }).getByRole('link', { name: text }).click();
}
