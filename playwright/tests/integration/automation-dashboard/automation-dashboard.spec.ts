import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { platformUI } from '@ansible/playwright/commands/login';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';

const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;

async function mockReportRoute(
  page: import('playwright').Page,
  status: number = 200
): Promise<void> {
  await page.route(`**/api/metrics/v1/dashboard_reports/report/**`, async (route) => {
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
  await page.route(`**/api/metrics/v1/dashboard_reports/report/details`, async (route) => {
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
        top_users: [
          {
            id: 1,
            name: 'Test user',
            execution_count: 14,
          },
        ],
        top_projects: [
          {
            id: 15,
            name: 'Test Project 1',
            execution_count: 20,
          },
          {
            id: 9,
            name: 'Test Project 2',
            execution_count: 9,
          },
          {
            id: 8,
            name: 'Test Project 3',
            execution_count: 2,
          },
        ],
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

test.beforeEach(async ({ page }) => {
  // The feature flag for Automation Dashboard is off by default and
  // needs to be turned on for the tests
  await setupBefore({ path: '/settings/dev/flags' })({ page });
  const row = page.getByRole('row').filter({ hasText: 'Automation Dashboard' });
  await row.getByRole('gridcell', { name: 'Disabled' }).locator('span').click();
  await expect(row.locator('input[type="checkbox"]')).toHaveAttribute('aria-label', 'Enabled');
  await page.getByRole('button', { name: 'Automation Analytics' }).click();
  await page.getByTestId('awx-automation-dashboard').isVisible();
  await navigateTo(page, 'Automation Analytics', 'Automation Dashboard');
});

test.afterEach(async ({ page }) => {
  await page.goto(platformUIWithoutSlash + '/settings/dev/flags');
  const row = page.getByRole('row').filter({ hasText: 'Automation Dashboard' });
  await row.getByRole('gridcell', { name: 'Enabled' }).locator('span').click();
  await expect(row.locator('input[type="checkbox"]')).toHaveAttribute('aria-label', 'Disabled');
});

test.afterEach(setupAfter);

test.describe('Automation Dashboard', () => {
  test('Automation dashboard view for System Administrator', async ({ page }) => {
    await expect(
      page.getByTestId('page-title').filter({ hasText: 'Automation Dashboard' })
    ).toBeVisible();
  });

  test('Should have correct link in value cards', async ({ page }) => {
    await mockReportRoute(page);
    await mockReportDetailRoute(page);
    const successfulJobsCard = page
      .getByTestId('successful-jobs-card')
      .filter({ hasText: 'Successful jobs' });
    await successfulJobsCard.getByRole('link', { name: 'See all successful jobs in AAP' }).click();
    await expect(page).toHaveURL(new RegExp('/jobs\\?status=successful$'));

    await navigateTo(page, 'Automation Analytics', 'Automation Dashboard');
    const failedJobsCard = page.getByTestId('failed-jobs-card').filter({ hasText: 'Failed jobs' });
    await failedJobsCard.getByRole('link', { name: 'See all failed jobs in AAP' }).click();
    await expect(page).toHaveURL(new RegExp('/jobs\\?status=failed$'));
  });
});
