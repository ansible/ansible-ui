import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('Organization Create Wizard - Visual Regression', () => {
  test(
    'organization wizard details step has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await page.getByText('Create organization', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create organization' })).toBeVisible();

      // Main content area screenshot (excludes sidebar to avoid layout shift flakiness)
      const mainContent = page.locator('.pf-v6-c-page__main');
      await expect(mainContent).toHaveScreenshot('organization-wizard-details-step.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    }
  );

  test(
    'organization wizard review step has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await page.getByText('Create organization', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create organization' })).toBeVisible();

      // Fill required name field and advance to review step
      await page.getByLabel('Name').fill('Visual Test Org');
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      // Wait for review step to render
      await expect(page.getByRole('button', { name: 'Finish', exact: true })).toBeVisible();

      // Main content area screenshot (excludes sidebar to avoid layout shift flakiness)
      const mainContent = page.locator('.pf-v6-c-page__main');
      await expect(mainContent).toHaveScreenshot('organization-wizard-review-step.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    }
  );
});
