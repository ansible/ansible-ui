import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { installVisualMockApi } from './visualMockApi';
import { stabilizeVisualPage } from './visualStabilization';

const inventoryName = 'Production Inventory';

test.beforeEach(async ({ page }) => {
  await installVisualMockApi(page, ['inventoryDetails']);
  await setupBefore({ path: '/overview' })({ page });
  await stabilizeVisualPage(page);
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});

async function openInventory(page: Parameters<typeof navigateTo>[0]) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  const inventoryLink = page.getByRole('link', { name: inventoryName, exact: true });
  await expect(inventoryLink).toHaveCount(1);
  await inventoryLink.click();
  await expect(page.getByRole('heading', { name: inventoryName, exact: true })).toBeVisible();
  await stabilizeVisualPage(page);
}

test.describe('Inventory Details - Visual Regression', () => {
  test(
    'inventory details page has no visual regressions',
    { tag: ['@visual'] },
    async ({ page }) => {
      await openInventory(page);
      await expect(page.locator('.pf-v6-c-page__main')).toHaveScreenshot(
        'inventory-details-full-page.png',
        {
          maxDiffPixelRatio: 0.01,
          animations: 'disabled',
          mask: [page.locator('.date-time')],
        }
      );
    }
  );

  test(
    'inventory details panel has no visual regressions',
    { tag: ['@visual'] },
    async ({ page }) => {
      await openInventory(page);
      await expect(page.locator('dl').first()).toHaveScreenshot('inventory-details-panel.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        mask: [page.locator('.date-time')],
      });
    }
  );
});
