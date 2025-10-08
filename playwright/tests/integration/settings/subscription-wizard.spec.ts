import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';

test.beforeEach(setupBefore({ path: '/settings/subscription/wizard' }));
test.afterEach(setupAfter);

test('subscription settings edit- verify service account text exists', async ({ page }) => {
  await page.getByRole('button', { name: 'Service Account / Red Hat Satellite' }).click();
  await expect(page.locator('h4')).toContainText(
    'Info alert:Input client ID and client secret or username and password'
  );
  await expect(page.locator('#client-id-form-group')).toContainText(
    'Client ID / Satellite username'
  );
  await expect(page.locator('#client-secret-form-group')).toContainText(
    'Client secret / Satellite password'
  );
});
