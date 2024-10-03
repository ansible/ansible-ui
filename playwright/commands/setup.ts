import { BrowserContext, Page } from '@playwright/test';
import { mock } from '../mock/mock';
import { login } from './login';

export async function setupBefore({ context, page }: { context: BrowserContext; page: Page }) {
  await mock({ context });
  await login(page);
}

export async function setupAfter({ page }: { context: BrowserContext; page: Page }) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
