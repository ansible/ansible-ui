import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import { AZURE_URL, SAAS_URL } from '@ansible/playwright/commands/constants';
import { platformUI } from '@ansible/playwright/commands/login';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';

test.afterEach(setupAfter);

test.describe('Overview - Quick Starts - Smoke', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await setupBefore()({ page });
    const buildType = await checkBuildType(page);
    await page.close();

    if (buildType === SAAS_URL || buildType === AZURE_URL) {
      test.skip(true, 'Quick starts not available on SaaS/Azure deployments');
    }
  });

  test.beforeEach(async ({ page }) => {
    await setupBefore()({ page });
    await page.goto(`${platformUI}/quickstarts`);
    await page.locator('[class*="catalog-item"]').first().waitFor({ timeout: 30000 });
  });

  test(
    'should display quick starts catalog with all expected items',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Quick Starts' })).toBeVisible();

      const catalogTitles = page.locator(
        '[class*="catalog-item"] [class*="card__title-text"] [data-test="title"]'
      );
      await expect(catalogTitles.first()).toBeVisible();
      const titleCount = await catalogTitles.count();
      expect(titleCount).toBeGreaterThanOrEqual(22);
    }
  );
});
