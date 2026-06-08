import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Settings } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('Policy Settings', () => {
  test(
    'should be able to edit job settings',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      await Settings.ui.revertAll(page, 'Policy');
      await expect(page.getByRole('heading', { name: 'Policy Settings' })).toBeVisible();

      const opaRetryField = page.getByTestId('opa-request-retry-count');
      await opaRetryField.scrollIntoViewIfNeeded();
      await expect(opaRetryField).toContainText('2');

      await page.getByRole('button', { name: 'Edit', exact: true }).click();

      const opaRetryInput = page.getByLabel('OPA request retry count');
      await opaRetryInput.fill('1');

      await page.getByText('Save').click();

      await expect(opaRetryField).toContainText('1');

      await Settings.ui.revertAll(page, 'Policy');
      await expect(opaRetryField).toContainText('2');
    }
  );
});
