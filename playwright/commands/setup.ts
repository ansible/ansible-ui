import { Page } from '@playwright/test';
import { existsSync } from 'fs';
import MCR from 'monocart-coverage-reports';
import { mock } from '../mock/mock';
import { coverageOptions } from '../tests/coverage-utils/coverage-options';
import { login, platformUI } from './login';

export function setupBefore(options?: { path?: string }) {
  return async ({ page }: { page: Page }) => {
    if (existsSync('coverage')) {
      await page.coverage.stopJSCoverage().catch(() => {});
      await page.coverage.startJSCoverage({ resetOnNavigation: true });
    }
    await mock(page);
    const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;
    await login(page, options?.path ? platformUIWithoutSlash + options.path : undefined);
  };
}

export async function setupAfter({ page }: { page: Page }) {
  try {
    const coverage = await page.coverage.stopJSCoverage();
    const coverageReport = MCR(coverageOptions);
    await coverageReport.add(coverage);
    await coverageReport.generate();
  } catch (e) {
    // DO NOTHING
  }

  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
