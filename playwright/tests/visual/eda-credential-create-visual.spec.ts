import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('EDA Credential Create Form - Visual Regression', () => {
  test(
    'credential create form has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential').click();
      await expect(
        page.getByRole('heading', { name: 'Create credential', exact: true })
      ).toBeVisible();

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
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential').click();
      await expect(
        page.getByRole('heading', { name: 'Create credential', exact: true })
      ).toBeVisible();

      const form = page.locator('form').first();
      await expect(form).toHaveScreenshot('eda-credential-create-form.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    }
  );
});
