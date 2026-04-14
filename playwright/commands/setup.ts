import { Page } from '@playwright/test';
import { existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';
import { login, platformUI } from './login';

// Use worker ID for unique files per worker
const workerId = process.env.TEST_WORKER_INDEX || '0';

export function setupBefore(options?: { path?: string }) {
  return async ({ page }: { page: Page }) => {
    // Only enable coverage if not explicitly skipped
    if (existsSync('coverage') && process.env.SKIP_COVERAGE !== 'true') {
      // eslint-disable-next-line no-console
      console.log('[Coverage] Starting JS coverage collection');
      await page.coverage.stopJSCoverage().catch(() => {});
      await page.coverage.startJSCoverage({ resetOnNavigation: true });
    } else if (!existsSync('coverage')) {
      // eslint-disable-next-line no-console
      console.log('[Coverage] Coverage directory does not exist, skipping coverage collection');
    } else if (process.env.SKIP_COVERAGE === 'true') {
      // eslint-disable-next-line no-console
      console.log('[Coverage] SKIP_COVERAGE is set, skipping coverage collection');
    }
    const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;
    await login(page, options?.path ? platformUIWithoutSlash + options.path : undefined);
  };
}

export async function setupAfter({ page }: { page: Page }) {
  try {
    // Only collect coverage if not explicitly skipped
    if (process.env.SKIP_COVERAGE !== 'true') {
      const coverage = await page.coverage.stopJSCoverage();
      // eslint-disable-next-line no-console
      console.log(`[Coverage] Collected ${coverage.length} coverage entries`);

      // Save raw V8 coverage as NDJSON (one line per test, one file per worker)
      // This avoids disk space issues from hundreds of individual files
      if (coverage.length > 0) {
        const rawDir = join('coverage', 'raw');
        if (!existsSync(rawDir)) {
          mkdirSync(rawDir, { recursive: true });
        }

        // Append to worker-specific NDJSON file (compact JSON, no formatting)
        const filename = join(rawDir, `coverage-worker-${workerId}.ndjson`);
        appendFileSync(filename, JSON.stringify(coverage) + '\n');

        // eslint-disable-next-line no-console
        console.log(`[Coverage] Appended ${coverage.length} entries to ${filename}`);
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[Coverage] Error collecting coverage:', e);
  }

  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
