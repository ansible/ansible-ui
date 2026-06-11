import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Settings } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('Troubleshooting Settings', () => {
  test(
    'should be able to edit troubleshooting settings',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await Settings.ui.revertAll(page, 'Troubleshooting');
      await expect(page.getByRole('heading', { name: 'Troubleshooting' })).toBeVisible();

      const tmpDirCleanupField = page.getByTestId('enable-or-disable-tmp-dir-cleanup');
      await tmpDirCleanupField.scrollIntoViewIfNeeded();
      await expect(tmpDirCleanupField).toContainText('Enabled');

      await page.getByRole('button', { name: 'Edit', exact: true }).click();

      const tmpDirCleanupToggle = page.getByTestId('AWX_CLEANUP_PATHS');
      await expect(tmpDirCleanupToggle).toBeChecked();
      await tmpDirCleanupToggle.click();
      await expect(tmpDirCleanupToggle).not.toBeChecked();

      await page.getByText('Save').click();

      await expect(tmpDirCleanupField).toContainText('Disabled');

      await Settings.ui.revertAll(page, 'Troubleshooting');
      await expect(tmpDirCleanupField).toContainText('Enabled');
    }
  );
});
