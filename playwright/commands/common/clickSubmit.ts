import { Page } from '@playwright/test';

export async function clickSubmit(page: Page) {
  await page.locator('#submit').click();
}
