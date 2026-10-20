import type { Page } from '@playwright/test';

export const visualRegressionTime = new Date('2025-06-05T12:00:00.000Z');

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
