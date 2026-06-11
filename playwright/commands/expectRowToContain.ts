import { Page, expect } from '@playwright/test';

export async function expectRowToContain(
  text: string,
  expectedText: string,
  page: Page,
  timeout?: number
) {
  const td = page.locator(`td >> text=${text}`);
  const tr = page.locator('tr').filter({ has: td });
  await expect(tr).toContainText(expectedText, { timeout });
}
