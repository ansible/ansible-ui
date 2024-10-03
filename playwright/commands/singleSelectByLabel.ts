import { Page } from '@playwright/test';

export async function singleSelectByLabel(label: string, text: string, page: Page) {
  await page.getByLabel(label).click();
  const menuContent = page.locator('.pf-v5-c-menu__content');
  await menuContent.getByLabel('Search input').fill(text);
  await menuContent.getByRole('option', { name: text }).click();
}
