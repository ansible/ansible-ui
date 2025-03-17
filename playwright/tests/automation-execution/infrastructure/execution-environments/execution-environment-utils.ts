import { Page, expect } from '@playwright/test';
import { createE2EName } from '../../../../commands/createE2EName';
import { navigateTo } from '../../../../commands/navigateTo';
import { confirmAndAssertDeletion } from '../../../../commands/confirmAndAssertDeletion';
import { clickPageAction } from '../../../../commands/clickPageAction';
import { clickTableRow } from '../../../../commands/clickTableRow';

export async function createExecutionEnvironment(
  page: Page,
  options: { executionEnvName?: string } = {}
) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
  await page.getByText('Create execution environment', { exact: true }).click();
  const executionEnvName = options.executionEnvName ?? createE2EName();
  await page.getByPlaceholder('Enter execution environment').fill(executionEnvName);
  await page.getByPlaceholder('Enter image').fill('myimage');
  await page.getByRole('button', { name: 'Create execution environment' }).click();
  await expect(page.getByRole('heading', { name: executionEnvName, exact: true })).toBeVisible();
  return executionEnvName;
}
export async function deleteExecutionEnvironment(executionEnvName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
  await clickTableRow({ filterLabel: 'Name', text: executionEnvName }, page);
  await clickPageAction('Delete execution environment', page);
  await confirmAndAssertDeletion(page);
}
