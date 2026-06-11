import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { HubExecutionEnvironment } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Execution Environment - Activity Tab', () => {
  test(
    'should display activity tab for existing execution environment',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      let executionEnvironmentName!: string;

      await test.step('Find an existing execution environment via API', async () => {
        const eeList = await HubExecutionEnvironment.api.list(page, { limit: 1 });

        if (!eeList?.data?.length) {
          test.skip(true, 'No execution environments found on this deployment');
          return;
        }

        executionEnvironmentName = eeList.data[0].name;
      });

      await test.step('Navigate to execution environment details', async () => {
        await navigateTo(page, 'Automation Content', 'Execution Environments');
        await expect(page.getByTestId('page-title')).toHaveText('Execution Environments');

        await clickTableRow({ filterLabel: 'Name', text: executionEnvironmentName }, page);
      });

      await test.step('Navigate to activity tab', async () => {
        await page.getByTestId('execution-environment-activity-tab').click();

        await page.waitForResponse(
          (response) => response.url().includes('/_content/history/') && response.status() === 200,
          { timeout: 10000 }
        );
      });

      await test.step('Verify activity tab displays correctly', async () => {
        const hasActivity = await page
          .getByText('Change')
          .isVisible()
          .catch(() => false);

        if (hasActivity) {
          await expect(page.getByText('Change')).toBeVisible();
          await expect(page.getByText('Date')).toBeVisible();
        } else {
          await expect(page.getByText('No activities yet')).toBeVisible();
        }
      });
    }
  );
});
