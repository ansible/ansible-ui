import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test(
  'overview page has no visual regressions',
  { tag: ['@visual', '@not_mock'] },
  async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText(
      'Welcome to the Ansible Automation Platform'
    );
    await expect(page.locator('[data-testid="resource-count-bar"]')).toBeVisible();
    await expect(page.locator('#job-activity .page-chart')).toBeVisible();

    const mainContent = page.locator('.pf-v6-c-page__main');
    await expect(mainContent).toHaveScreenshot('overview-full-page.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      mask: [
        page.locator('[data-testid="resource-count-bar"]'),
        page.locator('#job-activity .page-chart'),
      ],
    });
  }
);

test(
  'overview resource counts card has no visual regressions',
  { tag: ['@visual', '@not_mock'] },
  async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText(
      'Welcome to the Ansible Automation Platform'
    );
    await expect(page.locator('[data-testid="resource-count-bar"]')).toBeVisible();

    const resourceCounts = page.locator('#resource-counts');
    await expect(resourceCounts).toHaveScreenshot('resource-counts-card.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      mask: [page.locator('[data-testid="resource-count-bar"]')],
    });
  }
);
