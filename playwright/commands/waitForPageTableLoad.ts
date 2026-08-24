import { Page, expect } from '@playwright/test';

/**
 * Waits for a PageTable's initial data fetch to resolve by waiting for its
 * loading skeleton rows (`PageLoadingTable`) to disappear.
 *
 * `PageTable` renders a skeleton-row `<tbody>` while `pageItems` is
 * `undefined`, so `tbody`-visibility checks alone are satisfied by the
 * loading state. If the fetch resolves to zero items, the toolbar is also
 * swapped out entirely for a separate empty-state tree with its own actions.
 * Waiting here avoids interacting with toolbar actions or rows while that
 * initial swap is still in flight.
 *
 * @example
 * ```typescript
 * await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
 * await waitForPageTableLoad(page);
 * await page.getByText('Create credential', { exact: true }).click();
 * ```
 */
export async function waitForPageTableLoad(page: Page, timeout = 30000) {
  await expect(page.locator('.pf-v6-c-skeleton')).toHaveCount(0, { timeout });
}
