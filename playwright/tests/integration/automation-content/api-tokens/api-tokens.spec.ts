import { expect, test } from '@playwright/test';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - API Tokens', () => {
  test(
    'should generate API token with warnings and display token',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Content', 'API Token');
      await expect(page.getByRole('heading', { name: 'API Token' })).toBeVisible();

      await expect(page.getByTestId('generate_token_warning')).toBeVisible();
      await expect(page.getByTestId('generate_token_warning')).toContainText(
        'Generating a new token will delete your old token.'
      );

      const tokenResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/galaxy/v3/auth/token/') && response.status() === 200
      );

      await page.getByTestId('generate_token').click();

      const tokenResponse = await tokenResponsePromise;
      const responseData = (await tokenResponse.json()) as { token: string };
      const actualToken = responseData.token;

      await expect(page.getByTestId('copy_token_warning')).toBeVisible();
      await expect(page.getByTestId('copy_token_warning')).toContainText(
        'Copy this token now. This is the only time you will ever see it.'
      );
      await expect(page.getByTestId('copy_token_cell')).toBeVisible();
      await expect(page.getByText(actualToken)).toBeVisible();
    }
  );
});
