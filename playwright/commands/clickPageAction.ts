import { Page } from '@playwright/test';

export async function clickPageAction(label: string, page: Page) {
  await page.getByLabel('kebab dropdown toggle').click();
  await page.getByText(label).click();
}
