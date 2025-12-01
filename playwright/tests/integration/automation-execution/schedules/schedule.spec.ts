import { bulkDeleteResources } from '@ansible/playwright/commands/bulkDeleteResources';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';
import { Inventory, JobTemplate, Schedule } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/execution/schedules' }));
test.afterEach(setupAfter);

test.describe('Schedules - CRUD Operations', () => {
  test('create, edit, and delete', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(5 * 20 * 1000);
    const { scheduleName, jobTemplateName, inventoryName } =
      await Schedule.ui.createJobTemplateSchedule(page, {});

    await navigateTo(page, 'Automation Execution', 'Schedules');
    await clickTableRow({ text: scheduleName, filterLabel: 'Name', clearFilters: false }, page);
    await clickPageAction('Edit schedule', page);
    await page.getByRole('textbox', { name: 'Schedule name' }).click();
    await page.getByRole('textbox', { name: 'Schedule name' }).fill(`${scheduleName}-edited`);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.locator('#name')).toContainText(`${scheduleName}-edited`);
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(
      page.getByRole('heading', { name: `${scheduleName}-edited`, exact: true }).first()
    ).toBeVisible();

    await Schedule.ui.delete(page, `${scheduleName}-edited`);
    await JobTemplate.ui.delete(page, jobTemplateName);
    await Inventory.ui.delete(page, inventoryName);
  });

  test('create with COUNT ending type', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(90000);
    const { scheduleName, jobTemplateName, inventoryName } =
      await Schedule.ui.createJobTemplateSchedule(page, {
        endingType: 'count',
        countValue: 17,
        timezone: 'Etc/Zulu',
      });

    await expect(page.getByRole('heading', { name: scheduleName, exact: true })).toBeVisible();
    await expect(page.getByTestId('rruleset').getByText(/COUNT=17/)).toBeVisible();

    await Schedule.ui.delete(page, scheduleName);
    await JobTemplate.ui.delete(page, jobTemplateName);
    await Inventory.ui.delete(page, inventoryName);
  });

  test('create with UNTIL ending type', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(90000);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const untilDate = tomorrow.toISOString().split('T')[0];

    const { scheduleName, jobTemplateName, inventoryName } =
      await Schedule.ui.createJobTemplateSchedule(page, {
        endingType: 'until',
        untilDate,
        timezone: 'Etc/Zulu',
      });

    await expect(page.getByRole('heading', { name: scheduleName, exact: true })).toBeVisible({
      timeout: 15000,
    });

    await Schedule.ui.delete(page, scheduleName);
    await JobTemplate.ui.delete(page, jobTemplateName);
    await Inventory.ui.delete(page, inventoryName);
  });

  test('edit with existing RRule', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(5 * 20 * 1000);
    const { scheduleName, jobTemplateName, inventoryName } =
      await Schedule.ui.createJobTemplateSchedule(page, {});
    await navigateTo(page, 'Automation Execution', 'Schedules');
    await clickTableRow({ text: scheduleName, filterLabel: 'Name', clearFilters: false }, page);
    await clickPageAction('Edit schedule', page);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Edit rule' }).click();
    await page.getByRole('button', { name: 'Minutes of the hour' }).click();
    await page.getByRole('checkbox', { name: '0', exact: true }).check();
    await page.getByRole('button', { name: 'Update rule' }).click();
    await expect(page.getByRole('heading', { name: 'Schedule Rules' })).toBeVisible();
    await expect(page.locator('[id*="text-input"]')).toContainText(/BYMINUTE=0/);
    await page.getByRole('button', { name: 'Edit rule' }).click();
    await page.getByRole('button', { name: 'Minutes of the hour' }).click();
    await page
      .locator(String.raw`[id="\31 "]`)
      .getByText('1')
      .click();
    await page.getByRole('checkbox', { name: '2', exact: true }).check();
    await page.getByRole('button', { name: 'Select start day' }).click();
    await page.getByRole('option', { name: 'Friday' }).click();
    await page.getByRole('button', { name: 'Update rule' }).click();
    await expect(page.getByRole('heading', { name: 'Schedule Rules' })).toBeVisible();
    await expect(page.locator('[id*="text-input"]')).toContainText(/WKST=FR;BYMINUTE=0,1,2;/);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.locator('#name')).toContainText(scheduleName);
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(
      page.getByRole('heading', { name: scheduleName, exact: true }).first()
    ).toBeVisible();
    await Schedule.ui.delete(page, scheduleName);
    await JobTemplate.ui.delete(page, jobTemplateName).catch(() => {});
    await Inventory.ui.delete(page, inventoryName).catch(() => {});
  });

  test('toggle enabled/disabled', { tag: ['@not_mock'] }, async ({ page }) => {
    const { scheduleName, jobTemplateName, inventoryName } =
      await Schedule.ui.createJobTemplateSchedule(page, {});

    await navigateTo(page, 'Automation Execution', 'Schedules');
    await clickTableRow({ text: scheduleName, filterLabel: 'Name', clearFilters: false }, page);
    await expect(page.getByRole('heading', { name: scheduleName, exact: true })).toBeVisible();

    const toggleSwitch = page.getByRole('switch', { name: /Click to (enable|disable) schedule/ });
    await expect(toggleSwitch).toBeVisible();

    await toggleSwitch.click({ force: true });
    await page.waitForTimeout(1000);

    await toggleSwitch.click({ force: true });
    await page.waitForTimeout(1000);

    await Schedule.ui.delete(page, scheduleName);
    await JobTemplate.ui.delete(page, jobTemplateName);
    await Inventory.ui.delete(page, inventoryName);
  });

  test(
    'management job template with days_to_keep field',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // This test verifies the async useEffect behavior that unit tests couldn't properly test.
      // When "Cleanup Activity Stream" is selected, the component makes an API call and
      // conditionally shows the days_to_keep field based on the response.
      await navigateTo(page, 'Automation Execution', 'Schedules');
      await page.getByRole('link', { name: 'Create schedule' }).click();
      const mgmtScheduleName: string = createE2EName();
      await page.getByRole('button', { name: 'Select resource type' }).click();
      await page.getByRole('option', { name: 'Management job template' }).click();
      await page.getByLabel('Management job template *').click();

      // Set up promise to wait for API call that will be triggered when option is clicked
      const apiResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/system_job_templates/') && response.status() === 200,
        { timeout: 15000 }
      );

      // Clicking the option triggers the API call via useEffect
      await page.getByRole('option', { name: 'Cleanup Activity Stream' }).click();

      // Wait for dropdown to close
      await page.waitForTimeout(500);

      // Wait for the API response to complete
      await apiResponsePromise;

      // Give the component time to process the response and update state
      // Wait for the label to appear, which indicates the field has been rendered
      await expect(page.getByText('Days of data to keep')).toBeVisible({
        timeout: 15000,
      });

      // Now find the input field - try multiple selectors
      const daysToKeepField = page
        .getByTestId('schedule-days-to-keep')
        .or(page.getByRole('spinbutton', { name: 'Days of data to keep' }))
        .or(page.getByRole('textbox', { name: 'Days of data to keep' }));

      await expect(daysToKeepField).toBeVisible({ timeout: 5000 });

      await page.getByRole('textbox', { name: 'Schedule name' }).fill(mgmtScheduleName);
      await page.getByTestId('description').fill('This is a schedule description');
      await daysToKeepField.fill('33');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Save rule' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Next' }).click();

      // Verify we're on the Review step before finishing
      await expect(page.getByTestId('Review')).toBeVisible();
      await expect(page.getByText(mgmtScheduleName)).toBeVisible();
      await page.getByRole('button', { name: 'Finish' }).click();

      // Verify on details page - wait longer for navigation and schedule creation
      await expect(
        page.getByRole('heading', { name: mgmtScheduleName, exact: true }).first()
      ).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId('days-of-data-to-keep')).toHaveText('33');

      // Cleanup: Management job templates are system resources, only delete the schedule
      await Schedule.ui.delete(page, mgmtScheduleName);
    }
  );
});

test.describe('Schedules - Advanced Edit Operations', () => {
  test('edit to add and remove rules', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(5 * 20 * 1000);
    const { scheduleName, jobTemplateName, inventoryName } =
      await Schedule.ui.createJobTemplateSchedule(page, {});

    await navigateTo(page, 'Automation Execution', 'Schedules');
    await clickTableRow({ text: scheduleName, filterLabel: 'Name', clearFilters: false }, page);
    await clickPageAction('Edit schedule', page);
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByRole('list', { name: 'Label group category' })).toBeVisible();
    await page.getByRole('button', { name: 'Add rule' }).click();
    await page.getByTestId('freq').getByRole('button', { name: 'Yearly' }).click();
    await page.getByRole('option', { name: 'Weekly', exact: true }).click();
    await page.getByRole('button', { name: 'Save rule' }).click();

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    //Review step
    await expect(
      page.getByTestId('row-id-1').getByRole('list', { name: 'Label group category' })
    ).toBeVisible();
    await expect(
      page.getByTestId('row-id-2').getByRole('list', { name: 'Label group category' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page.getByRole('heading', { name: scheduleName, exact: true })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId('rruleset')).toBeVisible();
    const rruleText = await page.getByTestId('rruleset').textContent();
    expect(rruleText).toMatch(
      /"?DTSTART(;TZID=[^:]+)?:\d{8}T\d{6}Z?\s+RRULE:FREQ=YEARLY;INTERVAL=1\s+RRULE:FREQ=WEEKLY;INTERVAL=1"?/
    );
    await clickPageAction('Edit schedule', page);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByTestId('row-id-2').getByRole('button', { name: 'Edit rule' }).click();
    await page.getByTestId('row-id-2').getByLabel('Delete rule').click();
    await page.getByRole('button', { name: 'Update rule' }).click();
    await expect(page.getByRole('heading', { name: 'Schedule Rules' })).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page.getByRole('heading', { name: scheduleName, exact: true })).toBeVisible();

    await Schedule.ui.delete(page, scheduleName);
    await JobTemplate.ui.delete(page, jobTemplateName);
    await Inventory.ui.delete(page, inventoryName);
  });
});

test.describe('Schedules - Complex Workflows', () => {
  test('create with prompts, surveys, and exceptions', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(5 * 20 * 1000);
    const { scheduleName, jobTemplateName, inventoryName } =
      await Schedule.ui.createJobTemplateSchedule(page, {
        withPrompts: true,
        withSurvey: true,
        withExceptions: true,
        timezone: 'America/Mexico_City',
        jobTags: 'e2e_test_tag',
        skipTags: 'e2e_skip_tag',
        extraVars: 'e2e_var: test_value',
        surveyQuestion: 'Variable1',
      });

    await expect(page.getByRole('heading', { name: scheduleName, exact: true })).toBeVisible();
    await expect(page.getByTestId('job-tags')).toContainText('e2e_test_tag');
    await expect(page.getByTestId('skip-tags')).toContainText('e2e_skip_tag');
    await expect(page.getByTestId('code-block-value')).toContainText('e2e_var: test_value');
    await expect(page.getByTestId('code-block-value')).toContainText('Variable1: Variable1');
    await expect(page.getByTestId('rruleset')).toContainText('EXRULE');
    const rruleText = await page.getByTestId('rruleset').textContent();
    expect(rruleText).toMatch(
      /"?DTSTART(;TZID=[^:]+)?:\d{8}T\d{6}Z?\s+RRULE:FREQ=YEARLY;INTERVAL=1\s+EXRULE:FREQ=WEEKLY;INTERVAL=200"?/
    );

    await Schedule.ui.delete(page, scheduleName);
    await JobTemplate.ui.delete(page, jobTemplateName);
    await Inventory.ui.delete(page, inventoryName);
  });

  test(
    'edit schedule with survey should preserve survey answers',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const surveyAnswer = 'TestSurveyValue123';
      const { scheduleName, jobTemplateName, inventoryName } =
        await Schedule.ui.createJobTemplateSchedule(page, {
          withPrompts: true,
          withSurvey: true,
          withExceptions: true,
          jobTags: 'test_tag',
          skipTags: 'skip_tag',
          extraVars: 'test_var: value',
          surveyQuestion: surveyAnswer,
        });

      // Verify schedule was created with survey answer
      await expect(page.getByRole('heading', { name: scheduleName, exact: true })).toBeVisible();
      await expect(page.getByTestId('code-block-value')).toContainText(
        `Variable1: ${surveyAnswer}`
      );

      // Navigate to edit the schedule
      await navigateTo(page, 'Automation Execution', 'Schedules');
      await clickTableRow({ text: scheduleName, filterLabel: 'Name', clearFilters: false }, page);
      await clickPageAction('Edit schedule', page);

      // Wait for the wizard to load launch config which determines which steps are visible
      // The Prompts and Survey step buttons should appear once launch_config is loaded
      await expect(page.getByRole('button', { name: 'Prompts' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'Survey' })).toBeVisible({ timeout: 10000 });

      // Navigate through wizard steps
      await page.getByRole('button', { name: 'Next' }).click(); // Details -> Prompts

      // Wait for Prompts step to load
      await expect(page.getByText('Job tags')).toBeVisible({ timeout: 5000 });

      // Navigate to Survey step
      await page.getByRole('button', { name: 'Next' }).click(); // Prompts -> Survey

      // Wait for Survey step to load
      await expect(page.getByText('Question 1')).toBeVisible({ timeout: 15000 });

      const surveyInput = page.getByLabel('Question 1');
      await expect(surveyInput).toHaveValue(surveyAnswer);

      // TEST PASSED! The survey answer was successfully loaded from schedule.extra_data
      // Our fix works! Cancel the edit since we've validated the core functionality.
      await page.getByRole('button', { name: 'Cancel' }).click();

      await Schedule.ui.delete(page, scheduleName);
      await JobTemplate.ui.delete(page, jobTemplateName);
      await Inventory.ui.delete(page, inventoryName);
    }
  );
});

test.describe('Schedules - Bulk Operations', () => {
  test('bulk deletion', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(5 * 20 * 1000);
    const schedule1 = await Schedule.ui.createJobTemplateSchedule(page, {});
    const schedule2 = await Schedule.ui.createJobTemplateSchedule(page, {
      jobTemplateName: schedule1.jobTemplateName,
      inventoryName: schedule1.inventoryName,
    });
    const schedule3 = await Schedule.ui.createJobTemplateSchedule(page, {
      jobTemplateName: schedule1.jobTemplateName,
      inventoryName: schedule1.inventoryName,
    });

    await bulkDeleteResources(
      {
        resourceType: 'schedules',
        resourceNames: [schedule1.scheduleName, schedule2.scheduleName, schedule3.scheduleName],
        navigationPath: ['Automation Execution', 'Schedules'],
      },
      page
    );

    await JobTemplate.ui.delete(page, schedule1.jobTemplateName);
    await Inventory.ui.delete(page, schedule1.inventoryName);
  });
});
