import { Page } from '@playwright/test';

export async function clickPageAction(label: string, page: Page) {
  await page.getByRole('button', { name: 'actions' }).click();
  await page.getByText(label).click();
}
