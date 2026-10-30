import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { getBrandMasks, visualMaskColor } from './visualMasks';
import { installVisualMockApi } from './visualMockApi';
import { stabilizeVisualPage } from './visualStabilization';

test.beforeEach(async ({ page }) => {
  await installVisualMockApi(page, ['platformUsers']);
  await setupBefore({ path: '/access/users' })({ page });
  await stabilizeVisualPage(page);
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});

test.describe('Platform Users - Visual Regression', () => {
  test(
    'should have no visual regressions in the users list',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'automation-admin', exact: true })).toBeVisible();

      await expect(page.locator('.pf-v6-c-page__main')).toHaveScreenshot(
        'platform-users-full-page.png',
        {
          maxDiffPixelRatio: 0.01,
          animations: 'disabled',
          mask: [page.locator('.pf-v6-c-pagination')],
        }
      );
    }
  );

  test(
    'should keep the platform users shell stable across distributions',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible();

      await expect(page).toHaveScreenshot('platform-users-shell.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        mask: getBrandMasks(page),
        maskColor: visualMaskColor,
      });
    }
  );
});
