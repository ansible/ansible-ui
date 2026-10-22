import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test, type Page } from '@playwright/test';

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

async function waitForOverviewAwxSection(page: Page): Promise<'present' | 'absent'> {
  const platformAwx = page.locator('#platform-awx');
  const jobActivity = page.locator('#job-activity');
  const resourceCounts = page.locator('#resource-counts');
  const platformEda = page.locator('#platform-eda');
  let state: 'present' | 'absent' = 'absent';

  await expect
    .poll(
      async () => {
        if (await platformAwx.isVisible()) {
          state = 'present';
          return 'present';
        }
        if (await jobActivity.isVisible()) {
          state = 'present';
          return 'present';
        }
        if (await resourceCounts.isVisible()) {
          state = 'present';
          return 'present';
        }
        if (await platformEda.isVisible()) {
          const awxMounted =
            (await platformAwx.count()) > 0 ||
            (await jobActivity.count()) > 0 ||
            (await resourceCounts.count()) > 0;
          if (!awxMounted) {
            state = 'absent';
            return 'absent';
          }
          return 'pending';
        }
        return 'pending';
      },
      { timeout: 60_000, intervals: [250, 500, 1000] }
    )
    .toMatch(/^(present|absent)$/);

  return state;
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

    const awxSectionState = await waitForOverviewAwxSection(page);
    if (awxSectionState === 'absent') {
      await expect(page.locator('#job-activity')).not.toBeVisible();
      return;
    }

    await expect(page.locator('#platform-awx')).toBeVisible({ timeout: 60_000 });

    const jobActivityChart = page.locator('#job-activity .page-chart');
    await expect(jobActivityChart).toBeVisible({ timeout: 60_000 });
    await expect(
      jobActivityChart.getByText(jobsGraphFixture.expectedLastLabel, { exact: true })
    ).toBeVisible();
  });
});
