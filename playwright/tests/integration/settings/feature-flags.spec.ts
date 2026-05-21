import { expect, test } from '@playwright/test';
import { login, platformUI } from '@ansible/playwright/commands/login';
import { logout } from '@ansible/playwright/commands/logout';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { FeatureFlags, SettingsFeatureFlags, User } from '@ansible/playwright/utils';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';

const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;

test.afterEach(setupAfter);

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

test.describe('Feature Flags - Private Flag Visibility', () => {
  const createMockFlag = (overrides: Record<string, unknown> & { id: number }) => ({
    url: `/api/gateway/v1/feature_flags/${String(overrides.id)}/`,
    related: {
      activity_stream: '/api/gateway/v1/activitystream/?content_type=29&object_id=1',
      created_by: '/api/gateway/v1/users/1/',
      modified_by: '/api/gateway/v1/users/1/',
    },
    summary_fields: {
      modified_by: { id: 1, username: '_system', first_name: '', last_name: '' },
      created_by: { id: 1, username: '_system', first_name: '', last_name: '' },
      resource: { ansible_id: 'test-id', resource_type: 'shared.aapflag' },
    },
    created: '2026-03-10T14:00:05.323834Z',
    created_by: 1,
    modified: '2026-03-10T14:00:05.323834Z',
    modified_by: 1,
    name: 'FEATURE_TEST',
    ui_name: 'Test Feature',
    condition: 'boolean',
    value: 'False',
    required: false,
    support_level: 'TECHNOLOGY_PREVIEW',
    visibility: true,
    toggle_type: 'run-time',
    description: 'A test feature flag.',
    support_url: '',
    labels: [],
    state: false,
    ...overrides,
  });

  const mockFlags = [
    createMockFlag({
      id: 1,
      name: 'FEATURE_PUBLIC_ENABLED_RUNTIME',
      ui_name: 'Public Enabled Runtime Flag',
      visibility: true,
      state: true,
      value: 'True',
    }),
    createMockFlag({
      id: 2,
      name: 'FEATURE_PRIVATE_DISABLED_RUNTIME',
      ui_name: 'Private Disabled Runtime Flag',
      visibility: false,
      state: false,
      value: 'False',
    }),
    createMockFlag({
      id: 3,
      name: 'FEATURE_PRIVATE_ENABLED_RUNTIME',
      ui_name: 'Private Enabled Runtime Flag',
      visibility: false,
      state: true,
      value: 'True',
      support_level: 'DEVELOPER_PREVIEW',
    }),
    createMockFlag({
      id: 4,
      name: 'FEATURE_PRIVATE_ENABLED_INSTALL_TIME',
      ui_name: 'Private Enabled Install Flag',
      visibility: false,
      state: true,
      value: 'True',
      toggle_type: 'install-time',
    }),
  ];

  test('should hide private disabled flags and show private enabled flags regardless of toggle type', async ({
    page,
  }) => {
    await SettingsFeatureFlags.mock.settings(page, { runtimeFeatureFlags: true });

    // Stateful list mock: after PATCH disables flag 3, subsequent GETs reflect the change
    let flag3Disabled = false;
    await page.route('**/api/gateway/v1/feature_flags/', async (route) => {
      const results = mockFlags.map((flag) => {
        if (flag.id === 3 && flag3Disabled) {
          return { ...flag, value: 'False', state: false };
        }
        return flag;
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: results.length, next: null, previous: null, results }),
      });
    });

    // Mock the PATCH endpoint for toggling
    await page.route(/\/api\/gateway\/v1\/feature_flags\/\d+\//, async (route) => {
      if (route.request().method() === 'PATCH') {
        flag3Disabled = true;
        const flag = mockFlags.find((f) => f.id === 3)!;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...flag, value: 'False', state: false }),
        });
      } else {
        await route.continue();
      }
    });

    await login(page, platformUIWithoutSlash + '/settings/feature-flags');
    await expect(page.getByRole('heading', { name: 'Feature Flags' }).first()).toBeVisible();

    // Public enabled flag should be visible
    await expect(
      page.getByRole('row').filter({ hasText: 'Public Enabled Runtime Flag' })
    ).toBeVisible();

    // Private disabled flag should NOT be visible
    await expect(
      page.getByRole('row').filter({ hasText: 'Private Disabled Runtime Flag' })
    ).toBeHidden();

    // Private enabled runtime flag should be visible with "Private" badge and an enabled toggle
    const privateRuntimeRow = page
      .getByRole('row')
      .filter({ hasText: 'Private Enabled Runtime Flag' });
    await expect(privateRuntimeRow).toBeVisible();
    await expect(privateRuntimeRow.getByText('Private')).toBeVisible();
    const runtimeToggle = privateRuntimeRow.getByTestId('toggle-switch').locator('input');
    await expect(runtimeToggle).toBeEnabled();

    // Private enabled install-time flag should be visible with a disabled toggle
    const privateInstallRow = page
      .getByRole('row')
      .filter({ hasText: 'Private Enabled Install Flag' });
    await expect(privateInstallRow).toBeVisible();
    await expect(privateInstallRow.getByText('Private')).toBeVisible();
    const installToggle = privateInstallRow.getByTestId('toggle-switch').locator('input');
    await expect(installToggle).toBeDisabled();

    // Disable the private enabled runtime flag
    await privateRuntimeRow.getByTestId('toggle-switch').click();

    const dialog = page.locator('dialog, [role="dialog"]').first();
    await expect(dialog).toBeVisible();
    await dialog.getByTestId('confirm').click();
    await dialog.getByTestId('submit').click();
    await expect(dialog).toBeHidden({ timeout: 5000 });

    // After disabling, the private runtime flag should disappear from the table
    await expect(
      page.getByRole('row').filter({ hasText: 'Private Enabled Runtime Flag' })
    ).toBeHidden();

    // Public flag and private install-time flag should still be visible
    await expect(
      page.getByRole('row').filter({ hasText: 'Public Enabled Runtime Flag' })
    ).toBeVisible();
    await expect(
      page.getByRole('row').filter({ hasText: 'Private Enabled Install Flag' })
    ).toBeVisible();
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
      is_platform_auditor: true,
    });
  });

  test.afterEach(async ({ page }) => {
    await User.api.delete(page, normalUser.id).catch(() => {});
    await User.api.delete(page, auditorUser.id).catch(() => {});
  });

  test('should show Feature Flags page as read-only for auditor', async ({ page }) => {
    await SettingsFeatureFlags.mock.settings(page, { runtimeFeatureFlags: true });
    await FeatureFlags.mock.list(page);
    await logout(page);
    await login(page, platformUIWithoutSlash + '/overview', {
      username: auditorUser.username,
      password: userPassword,
    });

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
