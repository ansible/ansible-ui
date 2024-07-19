import { Page, expect } from '@playwright/test';

export async function navigateTo(page: Page, label: string, id: string) {
  await expect(page.getByText(label)).toBeVisible();
  if (!(await page.locator(`#${id}`).isVisible())) {
    await page.getByText(label).click();
  }
  await page.click(`#${id}`);
}
