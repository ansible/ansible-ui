import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);

test.describe('Templates List - Visual Regression', () => {
  test(
    'templates list page has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
      await expect(page.locator('tbody')).toBeVisible();

      // Main content area screenshot (excludes sidebar to avoid layout shift flakiness)
      const mainContent = page.locator('.pf-v6-c-page__main');
      await expect(mainContent).toHaveScreenshot('templates-list-full-page.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        mask: [page.locator('tbody'), page.locator('.pf-v6-c-pagination')],
      });
    }
  );
});
