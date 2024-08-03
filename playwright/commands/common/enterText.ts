import { Page } from '@playwright/test';

export function enterTextByLabel(label: string, text: string, page: Page) {
  return page.getByLabel(label).fill(text);
}
