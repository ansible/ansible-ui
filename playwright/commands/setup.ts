import { Page } from '@playwright/test';
import { existsSync } from 'fs';
import MCR from 'monocart-coverage-reports';
import { mock } from '@ansible/playwright/mock/mock';
import { coverageOptions } from '@ansible/playwright/tests/coverage-utils/coverage-options';
import { login, platformUI } from './login';

export function setupBefore(options?: { path?: string }) {
  return async ({ page }: { page: Page }) => {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__SWR_DEDUPING_INTERVAL__ = 0;
      (window as unknown as Record<string, unknown>).__SWR_REFRESH_INTERVAL__ = 5000;
    });
    // Only enable coverage if not explicitly skipped
    if (existsSync('coverage') && process.env.SKIP_COVERAGE !== 'true') {
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
    // Only collect coverage if not explicitly skipped
    if (process.env.SKIP_COVERAGE !== 'true') {
      const coverage = await page.coverage.stopJSCoverage();
      const coverageReport = MCR(coverageOptions);
      await coverageReport.add(coverage);
      await coverageReport.generate();
    }
  } catch (e) {
    // DO NOTHING
  }

  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
