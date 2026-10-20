import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { installVisualMockApi } from './visualMockApi';
import { stabilizeVisualPage } from './visualStabilization';

test.beforeEach(async ({ page }) => {
  await installVisualMockApi(page, ['credentials']);
  await setupBefore({ path: '/decisions/infrastructure/credentials/create' })({ page });
  await stabilizeVisualPage(page);
});
test.afterEach(setupAfter);

test.describe('EDA Credential Create Form - Visual Regression', () => {
  test(
    'credential create form has no visual regressions',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Create credential', exact: true })
      ).toBeVisible();
      await stabilizeVisualPage(page);

      // Main content area screenshot (excludes sidebar to avoid layout shift flakiness)
      const mainContent = page.locator('.pf-v6-c-page__main');
      await expect(mainContent).toHaveScreenshot('eda-credential-create-full-page.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    }
  );

  test(
    'credential create form element has no visual regressions',
    { tag: ['@visual'] },
    async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Create credential', exact: true })
      ).toBeVisible();
      await stabilizeVisualPage(page);

      const form = page.locator('form').first();
      await expect(form).toHaveScreenshot('eda-credential-create-form.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    }
  );
});
