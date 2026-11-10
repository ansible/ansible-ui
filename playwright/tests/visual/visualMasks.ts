import type { Locator, Page } from '@playwright/test';

export const visualMaskColor = '#e8e8e8';

/**
 * Keep distribution-specific masthead branding out of portable shell baselines.
 * The locator is intentionally scoped to the PF masthead brand slot so that
 * the rest of the header remains covered by the visual test.
 */
export function getBrandMasks(page: Page): Locator[] {
  return [page.locator('.pf-v6-c-masthead__brand')];
}
