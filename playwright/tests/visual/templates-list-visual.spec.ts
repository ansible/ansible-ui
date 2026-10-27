import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { installVisualMockApi } from './visualMockApi';
import { stabilizeVisualPage } from './visualStabilization';

test.beforeEach(async ({ page }) => {
  await installVisualMockApi(page, ['templates']);
  await setupBefore({ path: '/execution/templates' })({ page });
  await stabilizeVisualPage(page);
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});

test.describe('Templates List - Visual Regression', () => {
  test(
    'should have no visual regressions on the templates list page',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
      await expect(page.getByText('Demo Job Template')).toBeVisible();

      await expect(page.locator('.pf-v6-c-page__main')).toHaveScreenshot(
        'templates-list-full-page.png',
        {
          maxDiffPixelRatio: 0.01,
          animations: 'disabled',
          mask: [page.locator('.pf-v6-c-pagination')],
        }
      );
    }
  );

  test(
    'should have no visual regressions in the templates list toolbar',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
      await expect(page.getByText('Demo Job Template')).toBeVisible();
      const toolbar = page.locator('.pf-v6-c-toolbar').first();
      await expect(toolbar).toBeVisible();
      await expect(toolbar).toHaveScreenshot('templates-list-toolbar.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    }
  );
});
