import { Page } from '@playwright/test';

export async function clearTableFilters(page: Page) {
  if (await page.getByRole('button', { name: 'Clear all filters' }).isVisible()) {
    await page.getByRole('button', { name: 'Clear all filters' }).click();
  }
}
