import { Page, expect } from '@playwright/test';

export async function expectPageTitleToContain(title: string, page: Page) {
  await expect(page.locator('.pf-v5-c-title')).toContainText(title);
}
