import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { revertAllSettings } from '../settings-utils';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('Logging Settings', () => {
  test('should be able to edit job settings', { tag: ['@not_mock'] }, async ({ page }) => {
    await revertAllSettings(page, 'Logging');
    await expect(page.getByRole('heading', { name: 'Logging Settings' })).toBeVisible();

    const logSystemField = page.getByTestId('log-system-tracking-facts-individually');
    await logSystemField.scrollIntoViewIfNeeded();
    await expect(logSystemField).toContainText('Disabled');

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    const logSystemToggle = page.getByTestId('LOG_AGGREGATOR_INDIVIDUAL_FACTS');
    await expect(logSystemToggle).not.toBeChecked();
    await logSystemToggle.click();
    await expect(logSystemToggle).toBeChecked();

    await page.getByText('Save').click();

    await expect(logSystemField).toContainText('Enabled');

    await revertAllSettings(page, 'Logging');
    await expect(logSystemField).toContainText('Disabled');
  });
});
