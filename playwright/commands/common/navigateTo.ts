import { Page, expect } from '@playwright/test';
import { expectPageTitleToContain } from './expectPageTitleToContain';

export async function navigateTo(parentLabel: string, label: string, page: Page) {
  const nav = page.locator('.pf-v5-c-nav');
  await expect(nav).toBeVisible();
  await expect(nav.getByText(parentLabel)).toBeVisible();
  if (!(await nav.getByText(label).isVisible())) {
    await nav.getByText(parentLabel).click();
  }
  await nav.getByText(label).click();
  await expectPageTitleToContain(label, page);
}
