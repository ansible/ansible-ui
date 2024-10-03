import { Page } from '@playwright/test';

export async function clickTableRow(text: string, page: Page) {
  await page.click(`td >> a >> text=${text}`);
}
