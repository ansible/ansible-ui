import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { getBrandMasks, visualMaskColor } from './visualMasks';
import { installVisualMockApi } from './visualMockApi';
import { stabilizeVisualPage } from './visualStabilization';

test.beforeEach(async ({ page }) => {
  await installVisualMockApi(page, ['edaRulebookActivations']);
  await setupBefore({ path: '/decisions/rulebook-activations' })({ page });
  await stabilizeVisualPage(page);
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});

test.describe('EDA Rulebook Activations - Visual Regression', () => {
  test(
    'should have no visual regressions in the activation list',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Rulebook Activations', exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'Order Events Activation', exact: true })
      ).toBeVisible();

      await expect(page.locator('.pf-v6-c-page__main')).toHaveScreenshot(
        'eda-rulebook-activations-full-page.png',
        {
          maxDiffPixelRatio: 0.01,
          animations: 'disabled',
          mask: [page.locator('.pf-v6-c-pagination')],
        }
      );
    }
  );

  test(
    'should keep the EDA activation shell stable across distributions',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Rulebook Activations', exact: true })
      ).toBeVisible();

      await expect(page).toHaveScreenshot('eda-rulebook-activations-shell.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        mask: getBrandMasks(page),
        maskColor: visualMaskColor,
      });
    }
  );
});
