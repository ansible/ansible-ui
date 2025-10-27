import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore({ path: '/settings/automation-execution/system' }));
test.afterEach(setupAfter);

test('system settings edit- can add client id/secret for analytics', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit' }).click();
  await page
    .getByRole('textbox', { name: 'Red Hat Client ID for Analytics' })
    .fill('testAnalyticsId');
  await page
    .getByRole('textbox', { name: 'Red Hat Client Secret for Analytics' })
    .fill('testAnalyticsSecret');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('#red-hat-client-id-for-analytics')).toContainText('testAnalyticsId');
  if (page.mock.enabled) {
    await expect(page.locator('#red-hat-client-secret-for-analytics')).toContainText(
      'testAnalyticsSecret'
    );
  } else {
    await expect(page.locator('#red-hat-client-secret-for-analytics')).toContainText('$encrypted$');
  }
});
