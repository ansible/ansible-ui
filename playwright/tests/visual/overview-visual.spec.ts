import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test(
  'overview page has no visual regressions',
  { tag: ['@visual', '@not_mock'] },
  async ({ page }) => {
    // Wait for the page to fully render
    await expect(
      page.getByRole('heading', { name: /Welcome to (?:the )?Ansible/, level: 1 })
    ).toBeVisible();

    // Main content area screenshot (excludes sidebar to avoid layout shift flakiness)
    const mainContent = page.locator('.pf-v6-c-page__main');
    await expect(mainContent).toHaveScreenshot('overview-full-page.png', {
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
      mask: [
        page.locator('[data-testid="resource-count-bar"]'),
        page.locator('#job-activity .page-chart'),
        page.getByRole('heading', { level: 1 }),
      ],
    });
  }
);
