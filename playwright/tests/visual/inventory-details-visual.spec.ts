import type { Inventory as InventoryType } from '@ansible/awx-ui/interfaces/Inventory';
import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { Inventory } from '@ansible/playwright/utils';

let inventory: InventoryType;

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(async ({ page }) => {
  if (inventory?.id) {
    await Inventory.api.delete(page, inventory.id).catch(() => {});
  }
  await setupAfter({ page });
});

test.describe('Inventory Details - Visual Regression', () => {
  test(
    'inventory details page has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      inventory = await Inventory.api.create(page, { organization: 1 });
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: inventory.name }, page);
      await expect(page.getByRole('heading', { name: inventory.name, exact: true })).toBeVisible();

      // Main content area screenshot (excludes sidebar to avoid layout shift flakiness)
      const mainContent = page.locator('.pf-v6-c-page__main');
      await expect(mainContent).toHaveScreenshot('inventory-details-full-page.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        mask: [
          page.locator('h1'),
          page.locator('.pf-v6-c-breadcrumb'),
          page.locator('.date-time'),
          page.getByTestId('name'),
          page.getByTestId('description'),
        ],
      });
    }
  );

  test(
    'inventory details panel has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      inventory = await Inventory.api.create(page, { organization: 1 });
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: inventory.name }, page);
      await expect(page.getByRole('heading', { name: inventory.name, exact: true })).toBeVisible();

      const detailsPanel = page.locator('dl').first();
      await expect(detailsPanel).toHaveScreenshot('inventory-details-panel.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        mask: [
          page.locator('.date-time'),
          page.getByTestId('name'),
          page.getByTestId('description'),
        ],
      });
    }
  );
});
