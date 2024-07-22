import { Page } from '@playwright/test';

export async function clickButtonByLabel(label: string, page: Page) {
  await page.getByRole('button', { name: label, exact: true }).click();
}
