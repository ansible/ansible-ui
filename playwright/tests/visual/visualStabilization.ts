import type { Page } from '@playwright/test';

export const visualDates = {
  frozenNow: '2025-06-05T12:00:00.000Z',
  yesterday: '2025-06-04T14:30:00.000000Z',
  yesterdayMorning: '2025-06-04T10:15:00.000000Z',
  twoDaysAgo: '2025-06-03T14:30:00.000000Z',
  threeDaysAgo: '2025-06-02T14:30:00.000000Z',
  fourDaysAgo: '2025-06-01T14:30:00.000000Z',
  sixDaysAgo: '2025-05-30T11:00:00.000000Z',
  tomorrow: '2025-06-06T12:00:00.000000Z',
  olderCreated: '2025-01-15T10:00:00.000000Z',
  olderModified: '2025-03-20T14:30:00.000000Z',
} as const;

export const visualRegressionTime = new Date(visualDates.frozenNow);

const disableMotion = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
`;

export async function stabilizeVisualPage(page: Page) {
  await page.clock.setFixedTime(visualRegressionTime);
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  await page
    .locator('[aria-busy="true"], .pf-v6-c-skeleton, .pf-v6-c-spinner')
    .first()
    .waitFor({ state: 'hidden', timeout: 5_000 })
    .catch(() => undefined);
  await page.addStyleTag({ content: disableMotion });
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    for (const animation of document.getAnimations()) animation.finish();
  });
}
