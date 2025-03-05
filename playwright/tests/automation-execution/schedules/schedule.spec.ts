import { expect, test } from '@playwright/test';
import { clickPageAction } from '../../../commands/clickPageAction';
import { clickTableRowWithFilter } from '../../../commands/clickTableRow';
import { navigateTo } from '../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { deleteJobTemplate } from '../templates/job-template-utils';
import { createAwxJobTemplateSchedule, deleteAwxSchedule } from './schedule-utils';

test.beforeEach(setupBefore({ path: '/execution/schedules' }));
test.afterEach(setupAfter);

test('schedule - create, delete', { tag: ['@not_mock'] }, async ({ page }) => {
  const { scheduleName, jobTemplateName } = await createAwxJobTemplateSchedule({}, page);
  await deleteAwxSchedule(scheduleName, page);
  await deleteJobTemplate(jobTemplateName, page);
});
test('schedule - edit', { tag: ['@not_mock'] }, async ({ page }) => {
  const { scheduleName, jobTemplateName } = await createAwxJobTemplateSchedule({}, page);
  await navigateTo(page, 'Automation Execution', 'Schedules');
  await clickTableRowWithFilter(scheduleName, page);
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
  await deleteAwxSchedule(`${scheduleName}-edited`, page);
  await deleteJobTemplate(jobTemplateName, page);
});
test('schedule - edit with existing RRule', { tag: ['@not_mock'] }, async ({ page }) => {
  const { scheduleName, jobTemplateName } = await createAwxJobTemplateSchedule({}, page);
  await navigateTo(page, 'Automation Execution', 'Schedules');
  await clickTableRowWithFilter(scheduleName, page);
  await clickPageAction('Edit schedule', page);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Edit rule' }).click();
  await page.getByRole('button', { name: 'Minutes of the hour' }).click();
  await page.getByRole('checkbox', { name: '0', exact: true }).check();
  await page.getByRole('button', { name: 'Update rule' }).click();
  await expect(page.getByText('DTSTART;')).toContainText(/BYMINUTE=0;/);
  await page.getByRole('button', { name: 'Edit rule' }).click();
  await page.getByRole('button', { name: 'Minutes of the hour' }).click();
  await page.locator('[id="\\31 "]').getByText('1').click();
  await page.getByRole('checkbox', { name: '2', exact: true }).check();
  await page.getByRole('button', { name: 'Select start day' }).click();
  await page.getByRole('option', { name: 'Friday' }).click();
  await page.getByRole('button', { name: 'Update rule' }).click();
  await expect(page.getByText('DTSTART;')).toContainText(/WKST=FR;BYMINUTE=0,1,2;/);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('#name')).toContainText(scheduleName);
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(
    page.getByRole('heading', { name: scheduleName, exact: true }).first()
  ).toBeVisible();
  await deleteAwxSchedule(scheduleName, page);
  await deleteJobTemplate(jobTemplateName, page);
});
