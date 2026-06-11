import { Locator, Page } from '@playwright/test';

export async function clickPageAction(label: string, page: Page, context?: Locator) {
  const dropdown = context
    ? context.getByLabel('kebab dropdown toggle')
    : page.getByLabel('kebab dropdown toggle');

  await dropdown.click();

  // Wait for the dropdown menu to appear
  await page.waitForTimeout(1000);

  await page.getByText(label).click();
}
