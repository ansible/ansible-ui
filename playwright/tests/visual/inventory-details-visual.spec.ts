import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';

const mockInventory = {
  id: 1,
  type: 'inventory',
  name: 'Production Inventory',
  description: 'Hosts for production environment',
  kind: '',
  organization: 1,
  variables: '',
  total_hosts: 0,
  created: '2025-01-15T10:00:00.000000Z',
  modified: '2025-03-20T14:30:00.000000Z',
  summary_fields: {
    organization: { id: 1, name: 'Default', description: '' },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin' },
    user_capabilities: { edit: true, delete: true, copy: true, adhoc: true },
    labels: { count: 0, results: [] },
  },
};

const mockInventoriesListResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [mockInventory],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/controller/v2/inventories/?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockInventoriesListResponse),
    });
  });
  await page.route('**/api/controller/v2/inventories/1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/instance_groups/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockInventory),
    });
  });
  await setupBefore({ path: '/overview' })({ page });
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});

test.describe('Inventory Details - Visual Regression', () => {
  test(
    'inventory details page has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: mockInventory.name }, page);
      await expect(
        page.getByRole('heading', { name: mockInventory.name, exact: true })
      ).toBeVisible();

      const mainContent = page.locator('.pf-v6-c-page__main');
      await expect(mainContent).toHaveScreenshot('inventory-details-full-page.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        mask: [page.locator('.date-time')],
      });
    }
  );

  test(
    'inventory details panel has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: mockInventory.name }, page);
      await expect(
        page.getByRole('heading', { name: mockInventory.name, exact: true })
      ).toBeVisible();

      const detailsPanel = page.locator('dl').first();
      await expect(detailsPanel).toHaveScreenshot('inventory-details-panel.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        mask: [page.locator('.date-time')],
      });
    }
  );
});
