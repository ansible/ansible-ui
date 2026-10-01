import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';

function buildJobsGraphResponse() {
  const now = new Date();
  const lastDay = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000
  );
  const previousDay = lastDay - 86_400;
  const expectedLastLabel = `${now.getUTCMonth() + 1}/${now.getUTCDate()}`;

  return {
    expectedLastLabel,
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
  };
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/controller/v2/dashboard/graphs/jobs/**', async (route) => {
    const { jobs } = buildJobsGraphResponse();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ jobs }),
    });
  });
  await setupBefore({ path: '/overview' })({ page });
});

test.afterEach(setupAfter);

test('should render the current-day category on the job activity chart', async ({ page }) => {
  if (!(await page.locator('#platform-awx').isVisible())) {
    await expect(page.locator('#job-activity')).not.toBeVisible();
    return;
  }

  const { expectedLastLabel } = buildJobsGraphResponse();
  const jobActivityChart = page.locator('#job-activity .page-chart');
  await expect(jobActivityChart).toBeVisible({ timeout: 60_000 });
  await expect(jobActivityChart.getByText(expectedLastLabel, { exact: true })).toBeVisible();
});
