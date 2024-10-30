import { Page } from '@playwright/test';

export async function clearTableFilters(page: Page) {
  if (await page.getByRole('button', { name: 'Clear all filters' }).nth(0).isVisible()) {
    await page.getByRole('button', { name: 'Clear all filters' }).nth(0).click();
  }
}
