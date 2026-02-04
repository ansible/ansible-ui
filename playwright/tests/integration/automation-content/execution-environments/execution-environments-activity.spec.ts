import { expect, test } from '@playwright/test';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Execution Environment - Activity Tab', () => {
  test(
    'should display activity tab for existing execution environment',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await test.step('Navigate to execution environments and find an existing one', async () => {
        await navigateTo(page, 'Automation Content', 'Execution Environments');
        await expect(page.getByTestId('page-title')).toHaveText('Execution Environments');

        const rows = page.getByRole('row');
        const rowCount = await rows.count();

        if (rowCount <= 1) {
          test.skip(true, 'No execution environments found on this deployment');
        }

        const firstEELink = rows.nth(1).getByRole('link').first();
        await firstEELink.click();
      });

      await test.step('Navigate to activity tab', async () => {
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        await page.getByTestId('execution-environment-activity-tab').click();
      });

      await test.step('Verify activity tab displays correctly', async () => {
        await page.waitForResponse(
          (response) => response.url().includes('/_content/history/') && response.status() === 200,
          { timeout: 10000 }
        );

        await expect(page.getByText('Change')).toBeVisible();
        await expect(page.getByText('Date')).toBeVisible();
      });
    }
  );
});
