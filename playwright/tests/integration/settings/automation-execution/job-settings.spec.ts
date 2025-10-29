import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { revertAllSettings } from '../settings-utils';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('Job Settings', () => {
  test('should be able to edit job settings', { tag: ['@not_mock'] }, async ({ page }) => {
    await revertAllSettings(page, 'Job');
    await expect(page.getByRole('heading', { name: 'Job Settings' })).toBeVisible();

    const roleDownloadField = page.getByTestId('enable-role-download');
    await roleDownloadField.scrollIntoViewIfNeeded();
    await expect(roleDownloadField).toContainText('Enabled');

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    const awxRolesToggle = page.getByTestId('AWX_ROLES_ENABLED');
    await expect(awxRolesToggle).toBeChecked();
    await awxRolesToggle.click();
    await expect(awxRolesToggle).not.toBeChecked();

    await page.getByTestId('Submit').click();

    await expect(roleDownloadField).toContainText('Disabled');

    await revertAllSettings(page, 'Job');
    await expect(roleDownloadField).toContainText('Enabled');
  });
});
