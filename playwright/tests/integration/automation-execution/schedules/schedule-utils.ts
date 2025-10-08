import { expect, Page } from '@playwright/test';
import { clickPageAction } from '../../../../commands/clickPageAction';
import { clickTableRow } from '../../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../commands/createE2EName';
import { navigateTo } from '../../../../commands/navigateTo';
import { createInventory } from '../infrastructure/inventories/inventory-utils';
import { createJobTemplate } from '../templates/job-template-utils';

export async function createAwxJobTemplateSchedule(options: { scheduleName?: string }, page: Page) {
  const inventoryName = await createInventory({}, page);
  const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
  await navigateTo(page, 'Automation Execution', 'Schedules');
  await page.getByRole('link', { name: 'Create schedule' }).click();
  await expect(page.getByRole('heading', { name: 'Create schedule' })).toBeVisible();
  const scheduleName = options.scheduleName ?? createE2EName();
  await page.getByRole('button', { name: 'Select resource type' }).click();
  await page.getByRole('option', { name: 'Job template', exact: true }).click();
  await page.getByLabel('Job template *').click();
  await page.getByRole('textbox', { name: 'Search input' }).fill(jobTemplateName);
  await page.getByRole('option', { name: jobTemplateName }).click();
  await page.getByRole('textbox', { name: 'Schedule name' }).click();
  await page.getByRole('textbox', { name: 'Schedule name' }).fill(scheduleName);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Save rule' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText(scheduleName)).toBeVisible();
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('heading', { name: scheduleName, exact: true })).toBeVisible();
  return { scheduleName, jobTemplateName, inventoryName };
}

export async function deleteAwxSchedule(scheduleName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Schedules');
  await clickTableRow({ text: scheduleName, filterLabel: 'Name', clearFilters: false }, page);
  await clickPageAction('Delete schedule', page);
  await confirmAndAssertDeletion(page);
}
