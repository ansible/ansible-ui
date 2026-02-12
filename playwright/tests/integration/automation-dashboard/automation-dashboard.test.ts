import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { platformUI } from '@ansible/playwright/commands/login';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';

const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;

test.beforeEach(async ({ page }) => {
  // The feature flag for Automation Dashboard is off by default and
  // needs to be turned on for the tests
  await setupBefore({ path: '/settings/dev/flags' })({ page });
  const row = page.getByRole('row').filter({ hasText: 'Automation Dashboard' });
  await row.getByRole('gridcell', { name: 'Disabled' }).locator('span').click();
  await expect(row.locator('input[type="checkbox"]')).toHaveAttribute('aria-label', 'Enabled');
  await page.getByRole('button', { name: 'Automation Analytics' }).click();
});

test.afterEach(async ({ page }) => {
  await page.goto(platformUIWithoutSlash + '/settings/dev/flags');
  const row = page.getByRole('row').filter({ hasText: 'Automation Dashboard' });
  await row.getByRole('gridcell', { name: 'Enabled' }).locator('span').click();
  await expect(row.locator('input[type="checkbox"]')).toHaveAttribute('aria-label', 'Disabled');
});

test.afterEach(setupAfter);

test.describe('Automation Dashboard', () => {
  test('Automation dashboard view for System Administrator', async ({ page }) => {
    await page.getByTestId('awx-automation-dashboard').isVisible();
    await navigateTo(page, 'Automation Analytics', 'Automation Dashboard');
    await expect(
      page.getByTestId('page-title').filter({ hasText: 'Automation Dashboard' })
    ).toBeVisible();
  });
});
