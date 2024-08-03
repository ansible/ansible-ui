import { Page } from '@playwright/test';

export async function clickLinkByLabel(label: string, page: Page) {
  await page.getByRole('link', { name: label, exact: true }).click();
}
