import { expect, Page } from '@playwright/test';

export async function clickTableRow(text: string, page: Page) {
  await page.click(`td >> a >> text=${text}`);
}

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
