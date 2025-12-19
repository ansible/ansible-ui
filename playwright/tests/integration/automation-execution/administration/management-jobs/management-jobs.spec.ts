import { test, expect } from '@playwright/test';
import { setupBefore, setupAfter } from '../../../../../commands/setup';
import { waitForJobStatus } from '../../../../../commands/waitForJobStatus';

test.beforeEach(setupBefore({ path: '/execution/administration/management-jobs' }));
test.afterEach(setupAfter);

test.describe('Management Jobs - List and Launch Jobs', () => {
  test(
    'should render the management jobs list page and assert expected jobs are listed',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Management Jobs', level: 1 })).toBeVisible();
      const expectedJobs = [
        'Cleanup Activity Stream',
        'Cleanup Expired Sessions',
        'Cleanup Job Details',
        'Cleanup Expired OAuth 2 Tokens',
      ];

      await expect(page.locator('table')).toBeVisible();

      for (const expectedJob of expectedJobs) {
        await expect(page.getByRole('gridcell', { name: expectedJob, exact: true })).toBeVisible();
      }
    }
  );

  test(
    'should launch management job: Cleanup Expired Sessions',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const jobName = 'Cleanup Expired Sessions';
      let jobId: string;

      await test.step('Launch the management job', async () => {
        const responsePromise = page.waitForResponse(
          (response) => response.url().includes('/launch/') && response.status() === 201
        );

        await page.getByRole('row', { name: jobName }).getByTestId('launch-management-job').click();

        const response = await responsePromise;
        const responseData = (await response.json()) as { id: number };
        jobId = responseData.id.toString();
      });

      await test.step('Verify navigation to job output page', async () => {
        await expect(page).toHaveURL(new RegExp(`/jobs/management/${jobId}/output`));
        await expect(page.getByTestId('page-title')).toHaveText(jobName, { timeout: 10000 });
      });

      await test.step('Wait for job to complete successfully', async () => {
        await waitForJobStatus(
          {
            jobType: 'system_jobs',
            jobId,
            desiredStatus: ['successful'],
            timeout: 120000,
            throwOnFailure: false,
          },
          page
        );

        await expect(page.getByTestId('success-status')).toBeVisible({ timeout: 10000 });
      });

      await test.step('Navigate to Details tab and verify job information', async () => {
        await page.getByRole('tab', { name: 'Details' }).click();
        await expect(page).toHaveURL(new RegExp(`/jobs/management/${jobId}/details`));

        await expect(page.getByTestId('id')).toHaveText(jobId.toString());
        await expect(page.getByTestId('name')).toHaveText(jobName);
        await expect(page.getByTestId('type')).toHaveText('Management job');
      });
    }
  );

  test(
    'should launch management job: Cleanup Expired OAuth 2 Tokens',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const jobName = 'Cleanup Expired OAuth 2 Tokens';
      let jobId: string;

      await test.step('Launch the management job', async () => {
        const responsePromise = page.waitForResponse(
          (response) => response.url().includes('/launch/') && response.status() === 201
        );

        await page.getByRole('row', { name: jobName }).getByTestId('launch-management-job').click();

        const response = await responsePromise;
        const responseData = (await response.json()) as { id: number };
        jobId = responseData.id.toString();
      });

      await test.step('Verify navigation to job output page', async () => {
        await expect(page).toHaveURL(new RegExp(`/jobs/management/${jobId}/output`));
        await expect(page.getByTestId('page-title')).toHaveText(jobName, { timeout: 10000 });
      });

      await test.step('Wait for job to complete successfully', async () => {
        await waitForJobStatus(
          {
            jobType: 'system_jobs',
            jobId,
            desiredStatus: ['successful'],
            timeout: 120000,
            throwOnFailure: false,
          },
          page
        );

        await expect(page.getByTestId('success-status')).toBeVisible({ timeout: 10000 });
      });

      await test.step('Navigate to Details tab and verify job information', async () => {
        await page.getByRole('tab', { name: 'Details' }).click();
        await expect(page).toHaveURL(new RegExp(`/jobs/management/${jobId}/details`));

        await expect(page.getByTestId('id')).toHaveText(jobId.toString());
        await expect(page.getByTestId('name')).toHaveText(jobName);
        await expect(page.getByTestId('type')).toHaveText('Management job');
      });
    }
  );

  const managementJobsWithModal = [
    { name: 'Cleanup Activity Stream' },
    { name: 'Cleanup Job Details' },
  ];

  for (const job of managementJobsWithModal) {
    test(
      `should launch management job: ${job.name} with retention days set`,
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const jobName = job.name;
        const retentionDays = '4';
        let jobId: string;

        await test.step('Launch the management job with retention days', async () => {
          const responsePromise = page.waitForResponse(
            (response) => response.url().includes('/launch/') && response.status() === 201
          );

          await page
            .getByRole('row', { name: jobName })
            .getByTestId('launch-management-job')
            .click();

          await expect(page.getByTestId('extra-vars-days')).toBeVisible();
          await page.getByTestId('extra-vars-days').fill(retentionDays);

          await page.getByRole('button', { name: /^Launch/i }).click();

          const response = await responsePromise;
          const responseData = (await response.json()) as { id: number };
          jobId = responseData.id.toString();
        });

        await test.step('Verify navigation to job output page', async () => {
          await expect(page).toHaveURL(new RegExp(`/jobs/management/${jobId}/output`));
          await expect(page.getByTestId('page-title')).toHaveText(jobName, { timeout: 10000 });
        });

        await test.step('Wait for job to complete successfully', async () => {
          await waitForJobStatus(
            {
              jobType: 'system_jobs',
              jobId,
              desiredStatus: ['successful'],
              timeout: 120000,
              throwOnFailure: false,
            },
            page
          );

          await expect(page.getByTestId('success-status')).toBeVisible({ timeout: 10000 });
        });

        await test.step('Navigate to Details tab and verify job information', async () => {
          await page.getByRole('tab', { name: 'Details' }).click();
          await expect(page).toHaveURL(new RegExp(`/jobs/management/${jobId}/details`));

          await expect(page.getByTestId('id')).toHaveText(jobId.toString());
          await expect(page.getByTestId('name')).toHaveText(jobName);
          await expect(page.getByTestId('type')).toHaveText('Management job');
          await expect(page.getByTestId('success-status')).toBeVisible({ timeout: 10000 });
        });
      }
    );
  }
});
