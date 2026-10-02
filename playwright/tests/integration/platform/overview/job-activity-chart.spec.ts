import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';

function buildJobsGraphFixture() {
  const now = new Date();
  const lastDay = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000
  );
  const previousDay = lastDay - 86_400;
  const expectedLastLabel = `${now.getUTCMonth() + 1}/${now.getUTCDate()}`;

  return {
    expectedLastLabel,
    body: {
      jobs: {
        successful: [
          [previousDay, 10],
          [lastDay, 11],
        ],
        failed: [
          [previousDay, 2],
          [lastDay, 1],
        ],
        canceled: [[lastDay, 0]],
        error: [[lastDay, 0]],
      },
    },
  };
}

test.describe('Overview - Job Activity chart', () => {
  let jobsGraphFixture: ReturnType<typeof buildJobsGraphFixture>;

  test.beforeEach(async ({ page }) => {
    jobsGraphFixture = buildJobsGraphFixture();
    await page.route('**/dashboard/graphs/jobs/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(jobsGraphFixture.body),
      });
    });
    await setupBefore({ path: '/overview' })({ page });
  });

  test.afterEach(setupAfter);

  test('should render the current-day category on the job activity chart', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Welcome to (?:the )?Ansible/, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    const platformAwx = page.locator('#platform-awx');
    if ((await platformAwx.count()) === 0) {
      test.skip(true, 'AWX overview is not available in this deployment');
    }
    await expect(platformAwx).toBeVisible({ timeout: 60_000 });

    const jobActivityChart = page.locator('#job-activity .page-chart');
    await expect(jobActivityChart).toBeVisible({ timeout: 60_000 });
    await expect(
      jobActivityChart.getByText(jobsGraphFixture.expectedLastLabel, { exact: true })
    ).toBeVisible();
  });
});
