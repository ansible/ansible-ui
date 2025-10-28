import { Page, expect } from '@playwright/test';

export async function clickRetryUntilGone(
  page: Page,
  intervalMs: number = 2000,
  timeoutMs: number = 30000
) {
  await expect
    .poll(
      async () => {
        try {
          const retryButton = page.getByRole('button', { name: 'Retry' });
          const isVisible = await retryButton.isVisible({ timeout: 1000 });
          if (isVisible) {
            await retryButton.click();
            await page.waitForTimeout(intervalMs);
            return false;
          }
          return true;
        } catch {
          return true;
        }
      },
      {
        message: `Retry button still present after ${timeoutMs}ms timeout`,
        timeout: timeoutMs,
      }
    )
    .toBe(true);
}
