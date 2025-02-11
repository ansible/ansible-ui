import { Page, expect } from '@playwright/test';
import { clearTableFilters } from '../../../../commands/clearTableFilters';
import { createE2EName } from '../../../../commands/createE2EName';
import { navigateTo } from '../../../../commands/navigateTo';
import { selectTableFilter } from '../../../../commands/selectTableFilter';

export async function createExecutionEnvironment(
  page: Page,
  options: { executionEnvName?: string } = {}
) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
  await page.getByRole('button', { name: 'Create execution environment' }).click();
  const executionEnvName = options.executionEnvName ?? createE2EName();
  await page.getByPlaceholder('Enter execution environment').fill(executionEnvName);
  await page.getByPlaceholder('Enter image').fill('myimage');
  await page.getByRole('button', { name: 'Create execution environment' }).click();
  await expect(page.getByRole('heading', { name: executionEnvName, exact: true })).toBeVisible();
  return executionEnvName;
}
export async function deleteExecutionEnvironment(executionEnvName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
  await clearTableFilters(page);
  await selectTableFilter('Name', page);
  await page.getByRole('button', { name: 'Select name' }).click();
  await page.getByLabel('Search input').click();
  await page.getByLabel('Search input').fill(executionEnvName);
  await page.getByLabel('Search input').press('Enter');
  await page.locator('#filter-input-select').getByText(executionEnvName).click();
  await page.getByRole('row', { name: executionEnvName }).getByLabel('Select row').click();
  await page.getByLabel('toolbar actions').click();
  await page.getByRole('menuitem', { name: 'Delete execution environment' }).click();
  await page.getByText('Yes, I confirm that I want to').click();
  await page.getByRole('button', { name: 'Delete execution environments' }).click();
}
