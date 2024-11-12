import { Page } from '@playwright/test';
import { existsSync } from 'fs';
import MCR from 'monocart-coverage-reports';
import { mock } from '../mock/mock';
import { coverageOptions } from '../tests/coverage-options';
import { login, platformUI } from './login';

export function setupBefore(options?: { path?: string }) {
  return async ({ page }: { page: Page }) => {
    if (existsSync('coverage')) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
    }
    await mock(page);
    await login(page, options?.path ? platformUI + options.path : undefined);
  };
}

export async function setupAfter({ page }: { page: Page }) {
  try {
    const coverage = await page.coverage.stopJSCoverage();
    const coverageReport = MCR(coverageOptions);
    await coverageReport.add(coverage);
  } catch (e) {
    // DO NOTHING
  }

  await page.goto('about:blank');
  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
