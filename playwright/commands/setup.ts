import { Page } from '@playwright/test';
import { mock } from '../mock/mock';
import { login, platformUI } from './login';

export function setupBefore(options?: { path?: string }) {
  return async ({ page }: { page: Page }) => {
    await mock(page);
    await login(page, options?.path ? platformUI + options.path : undefined);
  };
}

export async function setupAfter({ page }: { page: Page }) {
  await page.goto('about:blank');
  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
