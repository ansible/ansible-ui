import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { getBrandMasks, visualMaskColor } from './visualMasks';
import { installVisualMockApi } from './visualMockApi';
import { stabilizeVisualPage } from './visualStabilization';

test.beforeEach(async ({ page }) => {
  await installVisualMockApi(page, ['platformOrganizations']);
  await setupBefore({ path: '/access/organizations' })({ page });
  await stabilizeVisualPage(page);
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});

test.describe('Platform Organizations - Visual Regression', () => {
  test(
    'should have no visual regressions in the organizations list',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Organizations', exact: true })).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'Automation Operations', exact: true })
      ).toBeVisible();

      await expect(page.locator('.pf-v6-c-page__main')).toHaveScreenshot(
        'platform-organizations-full-page.png',
        {
          maxDiffPixelRatio: 0.01,
          animations: 'disabled',
          mask: [page.locator('.pf-v6-c-pagination')],
        }
      );
    }
  );

  test(
    'should keep the platform organizations shell stable across distributions',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Organizations', exact: true })).toBeVisible();

      await expect(page).toHaveScreenshot('platform-organizations-shell.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        mask: getBrandMasks(page),
        maskColor: visualMaskColor,
      });
    }
  );
});
