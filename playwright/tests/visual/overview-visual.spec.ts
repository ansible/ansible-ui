import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { installVisualMockApi } from './visualMockApi';
import { stabilizeVisualPage } from './visualStabilization';

test.beforeEach(async ({ page }) => {
  await installVisualMockApi(page, ['overview']);
  await setupBefore({ path: '/overview' })({ page });
  await stabilizeVisualPage(page);
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});

test.describe('Overview - Visual Regression', () => {
  test('overview page has no visual regressions', { tag: ['@visual'] }, async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Welcome to (?:the )?Ansible/, level: 1 })
    ).toBeVisible();

    await expect(page.locator('.pf-v6-c-page__main')).toHaveScreenshot('overview-full-page.png', {
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
      mask: [page.locator('#job-activity .page-chart'), page.getByRole('heading', { level: 1 })],
    });
  });

  test(
    'overview resource counts card has no visual regressions',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /Welcome to (?:the )?Ansible/, level: 1 })
      ).toBeVisible();
      const resourceCounts = page.locator('#resource-counts');
      await expect(resourceCounts).toBeVisible();
      await expect(resourceCounts).toHaveScreenshot('resource-counts-card.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    }
  );
});
