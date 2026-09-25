import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';

async function mockReportRoute(
  page: import('playwright').Page,
  status: number = 200
): Promise<void> {
  await page.route(`**/api/metrics/v1/dashboard_reports/report/*`, async (route) => {
    await route.fulfill({
      status: status,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            template_name: 'test-template',
            id: 10,
            time_taken_manually_execute_minutes: 212,
            time_taken_create_automation_minutes: 29,
            runs: 3,
            successful_runs: 0,
            failed_runs: 3,
            elapsed: '65.00',
            elapsed_str: '1min 5sec',
            automated_costs: '100.00',
            manual_costs: '5000.00',
            time_savings: '1740.00',
            time_savings_str: '29min 0sec',
            savings: '4900.00',
          },
        ],
      }),
    });
  });
}

async function mockReportDetailRoute(
  page: import('playwright').Page,
  status: number = 200
): Promise<void> {
  await page.route(`**/api/metrics/v1/dashboard_reports/report/details/**`, async (route) => {
    await route.fulfill({
      status: status,
      contentType: 'application/json',
      body: JSON.stringify({
        total_number_of_job_runs: 34,
        total_number_of_successful_jobs: 31,
        total_number_of_failed_jobs: 3,
        total_number_of_host_job_runs: 611,
        total_hours_of_automation: 9.72,
        cost_of_automated_execution: 87725.66,
        cost_of_manual_automation: 7006057.8,
        total_saving: 6918332.14,
        total_time_saving: 556.36,
        total_number_of_unique_hosts: 31,
        job_chart: {
          kind: 'month',
          items: [
            {
              label: '2026-01-01T00:00:00Z',
              value: 0,
            },
            {
              label: '2026-02-01T00:00:00Z',
              value: 34,
            },
            {
              label: '2026-03-01T00:00:00Z',
              value: 0,
            },
            {
              label: '2026-04-01T00:00:00Z',
              value: 0,
            },
          ],
        },
        host_chart: {
          kind: 'month',
          items: [
            {
              label: '2026-01-01T00:00:00Z',
              value: 0,
            },
            {
              label: '2026-02-01T00:00:00Z',
              value: 611,
            },
            {
              label: '2026-03-01T00:00:00Z',
              value: 0,
            },
            {
              label: '2026-04-01T00:00:00Z',
              value: 0,
            },
          ],
        },
      }),
    });
  });
}

async function mockLeaderboardRoute(
  page: import('playwright').Page,
  status: number = 200
): Promise<void> {
  await page.route(`**/api/metrics/v1/dashboard_reports/leaderboard/`, async (route) => {
    await route.fulfill({
      status: status,
      contentType: 'application/json',
      body: JSON.stringify({
        job_runs: 1234,
        active_organizations: 56,
        featured_template: { id: 9, name: 'Infrastructure provisioning', run_count: 3558 },
        enterprise_streak: {
          streak: 16,
          daily: [{ date: '2026-08-21', successful_runs: 167 }],
        },
        org_streak: {
          streak: 8,
          organization: { id: 1, name: 'Platform Engineering', run_count: 2840 },
          daily: [{ date: '2026-08-21', successful_runs: 96 }],
        },
        organization_leaderboard: {
          user_organization_rank: 1,
          total_organizations: 42,
          leaderboard: [
            { rank: 1, name: 'Platform Engineering', runs: 2840 },
            { rank: 2, name: 'Security Operations', runs: 1923 },
          ],
        },
        org_achievements: ['sustained', 'rising'],
        activity_levels: [
          {
            id: 'volume',
            current_user_rank: 3,
            total_users: 84,
            leaderboard: [{ rank: 1, username: 'SL', runs: 612 }],
          },
          {
            id: 'breadth',
            current_user_rank: 1,
            total_users: 84,
            leaderboard: [{ rank: 1, username: 'Jamie Ortiz', runs: 12, is_current_user: true }],
          },
          {
            id: 'consistency',
            current_user_rank: 14,
            total_users: 84,
            leaderboard: [{ rank: 1, username: 'MC', runs: 29 }],
          },
        ],
        user_achievements: ['ignition', 'week_warrior', 'explorer', 'centurion'],
      }),
    });
  });
}

test.beforeEach(async ({ page }) => {
  // Register all route mocks BEFORE login/navigation so they intercept initial API calls.
  // The collection_status response controls whether the Automation Dashboard nav item appears.
  // show_dashboard and show_gamification must both be true for the Dashboard and Leaderboards
  // tabs; a missing (null) flag hides that view, so the page could show only one view or none.
  // min_collection_timestamp must be set (not null) — the Leaderboards tab treats a null
  // timestamp as "never synced" and renders its empty state instead of the leaderboard data.
  await page.route(`**/api/metrics/v1/dashboard_reports/collection_status/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        enabled: true,
        min_collection_timestamp: '2026-09-01T14:00:00.000Z',
        show_dashboard: true,
        show_gamification: true,
      }),
    });
  });
  await mockReportRoute(page);
  await mockReportDetailRoute(page);
  await setupBefore()({ page });
  await navigateTo(page, 'Automation Analytics', 'Automation Dashboard');
});

test.afterEach(setupAfter);

test.describe('Automation Dashboard', () => {
  test('Automation dashboard view for System Administrator', async ({ page }) => {
    await expect(
      page.getByTestId('page-title').filter({ hasText: 'Automation Dashboard' })
    ).toBeVisible();
  });

  test('should show the Dashboard and Leaderboards tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Leaderboards' })).toBeVisible();
  });

  test('Should have correct link in value cards', async ({ page }) => {
    // Wait for dashboard data to load by checking for specific values from our mock
    const successfulJobsCard = page
      .getByTestId('successful-jobs-card')
      .filter({ hasText: 'Successful jobs' });

    // Wait for the card to show the mocked value (31 successful jobs) - this ensures data loaded successfully
    await expect(successfulJobsCard.getByText('31')).toBeVisible();

    // Now the link should be visible since data loaded without error
    await successfulJobsCard.getByRole('link', { name: 'See all successful jobs' }).click();
    await expect(page).toHaveURL(new RegExp('/jobs\\?status=successful$'));

    await navigateTo(page, 'Automation Analytics', 'Automation Dashboard');

    const failedJobsCard = page.getByTestId('failed-jobs-card').filter({ hasText: 'Failed jobs' });
    // Wait for the card to show the mocked value (3 failed jobs)
    await expect(failedJobsCard.getByText('3')).toBeVisible();

    await failedJobsCard.getByRole('link', { name: 'See all failed jobs' }).click();
    await expect(page).toHaveURL(new RegExp('/jobs\\?status=failed$'));
  });
});

test.describe('Automation Dashboard - Leaderboards tab', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeaderboardRoute(page);
  });

  test('should show the leaderboard sections when the Leaderboards tab is selected', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: 'Leaderboards' }).click();

    await expect(page.getByRole('heading', { name: 'At a glance' })).toBeVisible();
    await expect(page.getByTestId('automation-streak')).toBeVisible();
    await expect(page.getByTestId('activity-levels')).toBeVisible();
    await expect(page.getByTestId('highlights-leaderboard-card')).toBeVisible();
    await expect(page.getByTestId('milestone-badges-card')).toBeVisible();
  });
});
