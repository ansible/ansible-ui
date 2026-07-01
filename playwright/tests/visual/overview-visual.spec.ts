import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

const mockDashboardResponse = {
  inventories: { total: 12, total_with_inventory_source: 5, job_failed: 1, inventory_failed: 0 },
  inventory_sources: {},
  groups: { total: 24, inventory_failed: 0 },
  hosts: { total: 87, failed: 3 },
  projects: { total: 9, failed: 1 },
  scm_types: {},
  users: { total: 6 },
  organizations: { total: 3 },
  teams: { total: 4 },
  credentials: { total: 15 },
  job_templates: { total: 22 },
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/controller/v2/dashboard/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockDashboardResponse),
    });
  });
  await setupBefore({ path: '/overview' })({ page });
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});

test.describe('Overview - Visual Regression', () => {
  test(
    'overview page has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /Welcome to (?:the )?Ansible/, level: 1 })
      ).toBeVisible();

      const mainContent = page.locator('.pf-v6-c-page__main');
      await expect(mainContent).toHaveScreenshot('overview-full-page.png', {
        maxDiffPixelRatio: 0.002,
        animations: 'disabled',
        mask: [page.locator('#job-activity .page-chart'), page.getByRole('heading', { level: 1 })],
      });
    }
  );

  test(
    'overview resource counts card has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
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
