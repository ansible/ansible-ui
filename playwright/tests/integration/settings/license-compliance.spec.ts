import { expect, test } from '@playwright/test';
import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import { AZURE_URL, SAAS_URL } from '@ansible/playwright/commands/constants';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

interface LicenseInfo {
  compliant: boolean;
}

interface Config {
  license_info?: LicenseInfo;
}

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('License Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Check build type and skip for SaaS/Azure
    const buildType = await checkBuildType(page);
    if (buildType === SAAS_URL || buildType === AZURE_URL) {
      test.skip(true, 'Test should not run on SaaS/Azure deployment');
    }
  });
  test('checks license compliance status', { tag: ['@not_mock'] }, async ({ page }) => {
    // Set up response promise before triggering the request
    const configResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/controller/v2/config') && response.status() === 200,
      { timeout: 10000 }
    );

    // Reload to trigger the config API call
    await page.reload();

    // Wait for the config API response
    const configResponse = await configResponsePromise;
    const config = (await configResponse.json()) as Config;

    // Check if license_info exists, if not, skip the test
    if (!config.license_info) {
      test.skip(true, 'license_info not available in config response');
      return; // Stop execution if skipping
    }

    // TypeScript knows licenseInfo is defined after the skip check above
    const licenseInfo = config.license_info;

    if (!licenseInfo.compliant) {
      // License is not compliant - check for banner and edit subscription flow
      await expect(page.locator('[data-testid="subscription-grace-period-banner"]')).toContainText(
        'Your subscription is out of compliance.'
      );

      // Navigate to subscription details
      await navigateTo(page, 'Settings', 'Subscription');

      await expect(page.locator('[data-testid="status"]')).toHaveText('Out of compliance');

      await page.getByRole('button', { name: /^Edit subscription/ }).click();

      await expect(
        page.getByRole('heading', { name: 'Welcome to Red Hat Ansible Automation Platform!' })
      ).toBeVisible();

      await expect(page).toHaveURL(/settings\/subscription\/wizard/);
    } else {
      // License is compliant - verify no banner and check subscription details
      await expect(
        page.locator('[data-testid="subscription-grace-period-banner"]')
      ).not.toBeVisible();

      // Navigate to subscription details
      await navigateTo(page, 'Settings', 'Subscription');

      await expect(page.locator('[data-testid="status"]')).toHaveText('Compliant');

      await page.getByRole('button', { name: /^Edit subscription/ }).click();

      await expect(
        page.getByRole('heading', { name: 'Welcome to Red Hat Ansible Automation Platform!' })
      ).toBeVisible();

      await expect(page).toHaveURL(/settings\/subscription\/wizard/);
    }
  });
});
