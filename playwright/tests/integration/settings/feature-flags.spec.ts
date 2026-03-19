import { expect, test } from '@playwright/test';
import { login, platformUI } from '@ansible/playwright/commands/login';
import { logout } from '@ansible/playwright/commands/logout';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { FeatureFlags, SettingsFeatureFlags, User } from '@ansible/playwright/utils';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';

const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;

test.afterEach(setupAfter);

test.describe('Feature Flags - Page Visibility', () => {
  test('should show Feature Flags nav item when RUNTIME_FEATURE_FLAGS is enabled', async ({
    page,
  }) => {
    await SettingsFeatureFlags.mock.settings(page, { runtimeFeatureFlags: true });
    await FeatureFlags.mock.list(page);
    await login(page, platformUIWithoutSlash + '/overview');

    const nav = page.locator('.pf-v6-c-nav');
    await expect(nav).toBeVisible();

    const settingsItem = nav
      .locator('li')
      .filter({ hasText: /^Settings/i })
      .first();
    await expect(settingsItem).toBeVisible();

    if (!(await settingsItem.evaluate((el) => el.classList.contains('pf-m-expanded')))) {
      await settingsItem.getByRole('button').click();
    }

    const featureFlagsLink = settingsItem.locator('li').filter({ hasText: /^Feature Flags/i });
    await expect(featureFlagsLink).toBeVisible();

    await featureFlagsLink.getByRole('link').click();
    await expect(page.getByRole('heading', { name: 'Feature Flags' }).first()).toBeVisible();
  });

  test('should hide Feature Flags nav item when RUNTIME_FEATURE_FLAGS is disabled', async ({
    page,
  }) => {
    await SettingsFeatureFlags.mock.settings(page, { runtimeFeatureFlags: false });
    await login(page, platformUIWithoutSlash + '/overview');

    const nav = page.locator('.pf-v6-c-nav');
    await expect(nav).toBeVisible();

    const settingsItem = nav
      .locator('li')
      .filter({ hasText: /^Settings/i })
      .first();
    await expect(settingsItem).toBeVisible();

    if (!(await settingsItem.evaluate((el) => el.classList.contains('pf-m-expanded')))) {
      await settingsItem.getByRole('button').click();
    }

    const featureFlagsLink = settingsItem.locator('li').filter({ hasText: /^Feature Flags/i });
    await expect(featureFlagsLink).toBeHidden();

    await page.goto(platformUIWithoutSlash + '/settings/feature-flags');
    await expect(page.getByText('Page not found')).toBeVisible({ timeout: 30000 });
  });
});

test.describe('Feature Flags - Toggle', () => {
  test('should open confirmation dialog and toggle a feature flag', async ({ page }) => {
    await SettingsFeatureFlags.mock.settings(page, { runtimeFeatureFlags: true });
    await FeatureFlags.mock.list(page);
    const { getLastPatchBody } = await FeatureFlags.mock.toggle(page);
    await login(page, platformUIWithoutSlash + '/settings/feature-flags');

    await expect(page.getByRole('heading', { name: 'Feature Flags' }).first()).toBeVisible();

    // "Indirect Node Counting" is the only visible, runtime, public flag.
    // Locate its row by name, then click the toggle switch within that row.
    const flagRow = page.getByRole('row').filter({ hasText: 'Indirect Node Counting' });
    await expect(flagRow).toBeVisible();
    await flagRow.getByTestId('toggle-switch').click();

    // Confirmation dialog should appear
    const dialog = page.locator('dialog, [role="dialog"]').first();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Disable feature flag?' })).toBeVisible();

    // Confirm checkbox must be checked before the action button is enabled
    const confirmCheckbox = dialog.getByTestId('confirm');
    await expect(confirmCheckbox).toBeVisible();
    await confirmCheckbox.click();

    // Click the action button
    const submitButton = dialog.getByTestId('submit');
    await submitButton.click();

    // The result dialog auto-closes after success. Wait for the dialog to disappear.
    await expect(dialog).toBeHidden({ timeout: 5000 });

    // Verify the PATCH was sent with the correct body
    expect(getLastPatchBody()).toEqual({ value: 'False' });
  });

  test('should close confirmation dialog on cancel without making API call', async ({ page }) => {
    await SettingsFeatureFlags.mock.settings(page, { runtimeFeatureFlags: true });
    await FeatureFlags.mock.list(page);
    const { getLastPatchBody } = await FeatureFlags.mock.toggle(page);
    await login(page, platformUIWithoutSlash + '/settings/feature-flags');

    await expect(page.getByRole('heading', { name: 'Feature Flags' }).first()).toBeVisible();

    const flagRow = page.getByRole('row').filter({ hasText: 'Indirect Node Counting' });
    await expect(flagRow).toBeVisible();
    await flagRow.getByTestId('toggle-switch').click();

    // Confirmation dialog should appear
    const dialog = page.locator('dialog, [role="dialog"]').first();
    await expect(dialog).toBeVisible();

    // Click cancel
    const cancelButton = dialog.getByTestId('cancel');
    await cancelButton.click();

    // Dialog should close
    await expect(dialog).toBeHidden();

    // No PATCH should have been sent
    expect(getLastPatchBody()).toBeUndefined();
  });
});

test.describe('Feature Flags - Access Control', () => {
  let normalUser: PlatformUser;
  let auditorUser: PlatformUser;
  const userPassword = 'password';

  test.beforeEach(async ({ page }) => {
    await setupBefore({ path: '/overview' })({ page });
    normalUser = await User.api.create(page, { password: userPassword });
    auditorUser = await User.api.create(page, {
      password: userPassword,
      isPlatformAuditor: true,
    });
  });

  test.afterEach(async ({ page }) => {
    await User.api.delete(page, normalUser.id).catch(() => {});
    await User.api.delete(page, auditorUser.id).catch(() => {});
  });

  test('should show Feature Flags page with toggle switches for admin', async ({ page }) => {
    await SettingsFeatureFlags.mock.settings(page, { runtimeFeatureFlags: true });
    await FeatureFlags.mock.list(page);
    await page.goto(platformUIWithoutSlash + '/settings/feature-flags');

    await expect(page.getByRole('heading', { name: 'Feature Flags' }).first()).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId('toggle-switch').first()).toBeVisible();
  });

  test('should show Feature Flags page as read-only for auditor', async ({ page }) => {
    await SettingsFeatureFlags.mock.settings(page, { runtimeFeatureFlags: true });
    await FeatureFlags.mock.list(page);
    await logout(page);
    await page.goto(platformUIWithoutSlash + '/overview');
    await expect(page).toHaveTitle(/Ansible Automation Platform/, { timeout: 30000 });
    await page.fill('#pf-login-username-id', auditorUser.username);
    await page.fill('#pf-login-password-id', userPassword);
    await page.click('button[type="submit"]');
    await expect(
      page.getByTestId('toolbar').getByRole('button', { name: auditorUser.username })
    ).toBeVisible();

    await navigateTo(page, 'Settings', 'Feature Flags');
    await expect(page.getByRole('heading', { name: 'Feature Flags' }).first()).toBeVisible();

    await expect(page.getByTestId('toggle-switch')).toHaveCount(0);
  });

  test(
    'should hide Feature Flags for normal user and show page not found on direct access',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await logout(page);
      await login(page, platformUIWithoutSlash + '/overview', {
        username: normalUser.username,
        password: userPassword,
      });

      const nav = page.locator('.pf-v6-c-nav');
      await expect(nav).toBeVisible();

      const settingsItem = nav
        .locator('li')
        .filter({ hasText: /^Settings/i })
        .first();
      await expect(settingsItem).toBeVisible();

      if (!(await settingsItem.evaluate((el) => el.classList.contains('pf-m-expanded')))) {
        await settingsItem.getByRole('button').click();
      }

      const featureFlagsLink = settingsItem.locator('li').filter({ hasText: /^Feature Flags/i });
      await expect(featureFlagsLink).toBeHidden();

      await page.goto(platformUIWithoutSlash + '/settings/feature-flags');
      await expect(page.getByText('Page not found')).toBeVisible({ timeout: 30000 });
    }
  );
});
