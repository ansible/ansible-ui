import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import { AZURE_URL, SAAS_URL } from '@ansible/playwright/commands/constants';
import { login, platformUI } from '@ansible/playwright/commands/login';
import { logout } from '@ansible/playwright/commands/logout';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { User } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;

test.beforeEach(async ({ page }) => {
  // The feature flag for Persona View Switcher is off by default and needs to be turned on for the tests
  await setupBefore({ path: '/settings/dev/flags' })({ page });
  await page
    .getByRole('row')
    .filter({ hasText: 'View Switcher' })
    .getByRole('gridcell', { name: 'Disabled' })
    .locator('span')
    .click();
  await expect(page.locator('input[type="checkbox"]')).toHaveAttribute('aria-label', 'Enabled');
});

test.afterEach(setupAfter);

// Persona switcher is not available on SaaS deployments
test.describe('Persona Switcher', () => {
  // Skip all tests in this describe block on SaaS
  test.beforeEach(async ({ page }) => {
    const buildType = await checkBuildType(page);
    if (buildType === SAAS_URL || buildType === AZURE_URL) {
      test.skip(true, 'Persona switcher not available on SaaS deployments');
    }
  });

  test('Persona views for System Administrator', async ({ page }) => {
    // Administration View
    await expect(page.getByRole('button', { name: 'Administration View' })).toBeVisible();
    await expect(page.locator('#platform-overview')).toContainText('Overview');
    await expect(page.locator('#platform-awx')).toContainText('Automation Execution');
    await expect(page.locator('#platform-eda')).toContainText('Automation Decisions');
    await expect(page.locator('#platform-access')).toContainText('Access Management');
    await expect(page.locator('#platform-hub')).toContainText('Automation Content');
    await expect(page.locator('#awx-analytics')).toContainText('Automation Analytics');
    await expect(page.locator('#awx-settings')).toContainText('Settings');
    await expect(page.locator('#platform-quickstarts')).toContainText('QuickStarts');
    await page.locator('#platform-awx').click();
    await page.locator('#awx-administration').click();
    await expect(page.locator('#awx-management-jobs')).toContainText('Management Jobs');
    await page.locator('#awx-administration').click();
    await page.locator('#platform-awx').click();

    await page.getByRole('button', { name: 'Administration View' }).click();

    // Operator View
    await page.getByRole('menuitem', { name: 'Operator View The operator' }).click();
    await expect(page.locator('#awx-jobs')).toContainText('Jobs');
    await expect(page.locator('#awx-templates')).toContainText('Templates');
    await expect(page.locator('#awx-credentials')).toContainText('Credentials');
    await expect(page.locator('#awx-settings-preferences')).toContainText('User Preferences');
    await expect(page.locator('#platform-quickstarts')).toContainText('QuickStarts');
    await expect(page.locator('#platform-awx')).toBeHidden();
    await expect(page.locator('#platform-eda')).toBeHidden();
    await expect(page.locator('#platform-access')).toBeHidden();
    await expect(page.locator('#platform-overview')).toBeHidden();
    await expect(page.locator('#platform-hub')).toBeHidden();
    await expect(page.locator('#awx-analytics')).toBeHidden();
    await expect(page.locator('#awx-settings')).toBeHidden();
    // Turn off the feature flag for Persona View Switcher
    await page.goto(platformUIWithoutSlash + '/settings/dev/flags');
    await page
      .getByRole('row')
      .filter({ hasText: 'View Switcher' })
      .getByRole('gridcell', { name: 'Enabled' })
      .locator('span')
      .click();
    await expect(page.locator('input[type="checkbox"]')).toHaveAttribute('aria-label', 'Disabled');
  });

  test('Persona views for Normal User', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Administration View' })).toBeVisible();
    const username = await User.ui
      .create(page)
      .then((r) => (typeof r === 'string' ? r : r.userName));
    await page.locator('#platform-overview').click();

    // Logout as administrator
    await logout(page);

    // Login as normal user
    const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;
    await login(page, platformUIWithoutSlash + '/overview', {
      username,
      password: 'password',
    });

    // Administration View
    await expect(page.getByRole('button', { name: 'Administration View' })).toBeVisible();
    await expect(page.locator('#platform-overview')).toContainText('Overview');
    await expect(page.locator('#platform-awx')).toContainText('Automation Execution');
    await expect(page.locator('#platform-eda')).toContainText('Automation Decisions');
    await expect(page.locator('#platform-access')).toContainText('Access Management');
    await expect(page.locator('#platform-hub')).toContainText('Automation Content');
    await expect(page.locator('#awx-settings')).toContainText('Settings');
    await expect(page.locator('#platform-quickstarts')).toContainText('QuickStarts');
    await expect(page.locator('#awx-analytics')).toBeHidden();
    // Management jobs not shown for a normal user
    await page.locator('#platform-awx').click();
    await page.locator('#awx-administration').click();
    await expect(page.locator('#awx-management-jobs')).toBeHidden();
    await page.locator('#awx-administration').click();
    await page.locator('#platform-awx').click();

    await page.getByRole('button', { name: 'Administration View' }).click();

    // Operator View
    await page.getByRole('menuitem', { name: 'Operator View The operator' }).click();
    await expect(page.locator('#awx-jobs')).toContainText('Jobs');
    await expect(page.locator('#awx-templates')).toContainText('Templates');
    await expect(page.locator('#awx-credentials')).toContainText('Credentials');
    await expect(page.locator('#awx-settings-preferences')).toContainText('User Preferences');
    await expect(page.locator('#platform-quickstarts')).toContainText('QuickStarts');
    await expect(page.locator('#platform-awx')).toBeHidden();
    await expect(page.locator('#platform-eda')).toBeHidden();
    await expect(page.locator('#platform-access')).toBeHidden();
    await expect(page.locator('#platform-overview')).toBeHidden();
    await expect(page.locator('#platform-hub')).toBeHidden();
    await expect(page.locator('#awx-analytics')).toBeHidden();
    await expect(page.locator('#awx-settings')).toBeHidden();
    // Turn off the feature flag for Persona View Switcher
    await page.goto(platformUIWithoutSlash + '/settings/dev/flags');
    await page
      .getByRole('row')
      .filter({ hasText: 'View Switcher' })
      .getByRole('gridcell', { name: 'Enabled' })
      .locator('span')
      .click();
    await expect(page.locator('input[type="checkbox"]')).toHaveAttribute('aria-label', 'Disabled');
    // Logout as normal user
    await logout(page, { username });
  });
});
