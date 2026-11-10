import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { getBrandMasks, visualMaskColor } from './visualMasks';
import { installVisualMockApi } from './visualMockApi';
import { stabilizeVisualPage } from './visualStabilization';

test.beforeEach(async ({ page }) => {
  await installVisualMockApi(page, ['credentials']);
  await setupBefore({ path: '/execution/infrastructure/credentials' })({ page });
  await stabilizeVisualPage(page);
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});

test.describe('Credentials list - Visual Regression', () => {
  test(
    'should have no visual regressions in the credentials list',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Credentials', exact: true })).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'Demo Machine Credential', exact: true })
      ).toBeVisible();

      await expect(page.locator('.pf-v6-c-page__main')).toHaveScreenshot(
        'credentials-list-full-page.png',
        {
          maxDiffPixelRatio: 0.01,
          animations: 'disabled',
          mask: [page.locator('.pf-v6-c-pagination')],
        }
      );
    }
  );

  test(
    'should keep the application shell stable across distributions',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Credentials', exact: true })).toBeVisible();

      await expect(page).toHaveScreenshot('credentials-list-shell.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        mask: getBrandMasks(page),
        maskColor: visualMaskColor,
      });
    }
  );
});
