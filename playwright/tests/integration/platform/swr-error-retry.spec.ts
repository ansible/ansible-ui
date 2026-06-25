import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('SWR 5xx Error Retry Behavior (AAP-79478)', () => {
  test(
    'should stop retrying after a bounded number of attempts on 503 errors',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      let requestCount = 0;

      page.on('request', (request) => {
        if (
          request.url().includes('/api/controller/v2/unified_jobs/') &&
          request.method() === 'GET'
        ) {
          requestCount++;
        }
      });

      await page.route('**/api/controller/v2/unified_jobs/**', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Service Unavailable' }),
          });
        } else {
          await route.continue();
        }
      });

      await page.reload({ waitUntil: 'domcontentloaded' });

      // Phase 1: Wait for the custom onErrorRetry handler's retries to finish.
      // It uses short exponential backoff (~1s, ~2s) and caps at 3 attempts,
      // so all retries complete within ~7s.
      await page.waitForTimeout(8_000);
      const countAfterBurst = requestCount;
      expect(countAfterBurst).toBeGreaterThan(0);

      // Phase 2: Verify retries have stopped — no new requests should arrive.
      // Without the fix, SWR's default handler keeps retrying with ~5s base
      // intervals and no cap, so at least one more request would fire here.
      await page.waitForTimeout(20_000);
      expect(requestCount).toBe(countAfterBurst);
    }
  );
});
