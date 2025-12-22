import { test, expect } from '@playwright/test';
import { setupBefore, setupAfter } from '../../../../../commands/setup';
import { waitForJobStatus } from '../../../../../commands/waitForJobStatus';
import { createE2EName } from '../../../../../commands/createE2EName';
import { clickPageAction } from '../../../../../commands/clickPageAction';

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

test.describe('Management Jobs - Schedules Tab', () => {
  const managementJobsList = [
    'Cleanup Activity Stream',
    'Cleanup Expired Sessions',
    'Cleanup Job Details',
  ];

  const autoGeneratedSchedules = [
    'Cleanup Activity Schedule',
    'Cleanup Expired Sessions',
    'Cleanup Job Schedule',
  ];

  for (let index = 0; index < managementJobsList.length; index++) {
    const jobName = managementJobsList[index];
    test(
      `should view existing auto generated schedule for management job: ${jobName}`,
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Navigate to management job and find schedules tab', async () => {
          await expect(
            page.getByRole('heading', { name: 'Management Jobs', level: 1 })
          ).toBeVisible();
          await page
            .getByRole('row', { name: jobName })
            .getByRole('link', { name: jobName })
            .click();
          await expect(page.getByTestId('page-title')).toHaveText(jobName);
        });

        await test.step('Click Schedules tab and verify auto-generated schedule', async () => {
          await page.getByRole('tab', { name: 'Schedules' }).click();
          await expect(page).toHaveURL(/\/schedules/);
          await expect(
            page.getByRole('link', { name: autoGeneratedSchedules[index], exact: true })
          ).toBeVisible();
        });
      }
    );
  }

  for (const jobName of managementJobsList) {
    test(
      `should perform CRUD operations on schedule for management job: ${jobName}`,
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(120000);
        const scheduleName = `${jobName} ${createE2EName()}`;
        let scheduleId: string;

        await test.step('Navigate to management job schedules', async () => {
          await expect(
            page.getByRole('heading', { name: 'Management Jobs', level: 1 })
          ).toBeVisible();
          await page
            .getByRole('row', { name: jobName })
            .getByRole('link', { name: jobName })
            .click();
          await expect(page.getByTestId('page-title')).toHaveText(jobName);
          await page.getByRole('tab', { name: 'Schedules' }).click();
          await expect(page).toHaveURL(/\/schedules/);
        });

        await test.step('Create new schedule', async () => {
          const createResponsePromise = page.waitForResponse(
            (response) => response.url().includes('/schedules/') && response.status() === 201
          );

          await page.getByTestId('create-schedule').click();
          await expect(
            page.getByRole('heading', { name: 'Create Schedule', level: 1 })
          ).toBeVisible();

          await page.getByTestId('name').fill(scheduleName);
          await page.getByTestId('description').fill('description');

          if (['Cleanup Activity Stream', 'Cleanup Job Details'].includes(jobName)) {
            await expect(page.getByTestId('schedule-days-to-keep')).toBeVisible();
            await page.getByTestId('schedule-days-to-keep').fill('10');
          } else if (jobName === 'Cleanup Expired Sessions') {
            await expect(page.getByTestId('schedule-days-to-keep')).not.toBeVisible();
          }

          await page.getByRole('button', { name: 'Next' }).click();
          await page.getByRole('button', { name: 'Save rule' }).click();
          await page.getByRole('button', { name: 'Next' }).click();
          await page.getByRole('button', { name: 'Next' }).click();
          await page.getByRole('button', { name: 'Finish' }).click();

          const createResponse = await createResponsePromise;
          const createdSchedule = (await createResponse.json()) as { id: number };
          scheduleId = createdSchedule.id.toString();

          await expect(page.getByTestId('page-title')).toHaveText(scheduleName, {
            timeout: 10000,
          });
        });

        await test.step('Edit the schedule', async () => {
          await page.getByRole('tab', { name: 'Back to Schedules' }).click();
          await expect(page).toHaveURL(/\/schedules/);

          const scheduleRow = page.getByRole('row', { name: new RegExp(scheduleName) });
          await scheduleRow.getByTestId('actions-dropdown').click();
          await scheduleRow.getByTestId('edit-schedule').click();

          await expect(page).toHaveURL(/\/edit$/);
          await expect(page.getByTestId('page-title')).toHaveText(`Edit ${scheduleName}`);
          await page.getByTestId('description').clear();
          await page.getByTestId('description').fill('edited description');
          await page.getByRole('button', { name: 'Next' }).click();
          await page.getByRole('button', { name: 'Next' }).click();
          await page.getByRole('button', { name: 'Next' }).click();
          await page.getByRole('button', { name: 'Finish' }).click();

          await expect(page.getByTestId('page-title')).toHaveText(scheduleName);
        });

        await test.step('Delete the schedule', async () => {
          const deleteResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes(`/schedules/${scheduleId}/`) &&
              response.status() === 204 &&
              response.request().method() === 'DELETE'
          );

          await clickPageAction('Delete schedule', page);
          await page.getByRole('checkbox', { name: 'I confirm that I want to delete' }).click();
          await page.getByRole('button', { name: /^Delete schedule/ }).click();

          await deleteResponsePromise;
          await expect(page.getByTestId('page-title')).toHaveText(jobName, { timeout: 10000 });
        });
      }
    );
  }
});
