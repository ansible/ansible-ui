import { Page } from '@playwright/test';

export async function clickConfirm(page: Page) {
  await page.locator('#confirm').click();
}
