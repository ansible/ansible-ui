import { Page, Locator } from '@playwright/test';

export async function clickPageAction(label: string, page: Page, context?: Locator) {
  const dropdown = context
    ? context.getByLabel('kebab dropdown toggle')
    : page.getByLabel('kebab dropdown toggle');

  await dropdown.click();
  await page.getByText(label).click();
}
