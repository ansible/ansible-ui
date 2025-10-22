import { Page, expect } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';

export async function createExecutionEnvironment(
  page: Page,
  options: { executionEnvName?: string; organizationName?: string } = {}
) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
  await page.getByText('Create execution environment', { exact: true }).click();
  const executionEnvName = options.executionEnvName ?? createE2EName();
  await page.getByPlaceholder('Enter execution environment').fill(executionEnvName);
  await page.getByPlaceholder('Enter image').fill('myimage');

  // Set organization if provided
  if (options.organizationName) {
    await singleSelectByLabel('Organization', options.organizationName, page);
  }

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
