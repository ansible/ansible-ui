/** @deprecated Use Project from '@ansible/playwright/utils' instead */

import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { expectRowToContain } from '@ansible/playwright/commands/expectRowToContain';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';
import { expect, Page } from '@playwright/test';

export async function createAwxProject(
  options: { projectName?: string; organizationName?: string },
  page: Page
) {
  await navigateTo(page, 'Automation Execution', 'Projects');
  await page.getByText('Create project', { exact: true }).click();
  const projectName = options.projectName ?? createE2EName();
  await expect(page.getByRole('heading')).toContainText('Create project');
  await page.getByRole('textbox', { name: 'Name' }).fill(projectName);
  const organizationName = options.organizationName;
  await singleSelectByLabel('Organization', organizationName ?? 'Default', page);
  await page.getByRole('button', { name: 'Select source control type' }).click();
  await page.getByRole('option', { name: 'Git' }).click();
  await page.getByLabel('Source Control URL').fill('https://github.com/ansible/ansible-ui');
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await expect(page.getByRole('heading', { name: projectName, exact: true })).toBeVisible();
  return projectName;
}

export async function syncAwxProject(projectName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Projects');
  await filterTable({ filterLabel: 'Name', filterValue: projectName, clearFilters: true }, page);
  await expectRowToContain(projectName, 'Success', page, 60 * 1000);
}

interface ProjectResponse {
  name: string;
  id: number;
}

function isProjectResponse(obj: unknown): obj is ProjectResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof obj.name === 'string' &&
    'id' in obj &&
    typeof obj.id === 'number'
  );
}

export async function copyAwxProject(projectName: string, page: Page): Promise<string> {
  await navigateTo(page, 'Automation Execution', 'Projects');
  await filterTable({ filterLabel: 'Name', filterValue: projectName, clearFilters: true }, page);

  // Set up API interception to capture copied project name
  const copyResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/copy/') && response.status() === 201
  );

  // Trigger copy from list row kebab menu
  const row = page.getByRole('row').filter({ hasText: projectName });
  await row.getByLabel('kebab dropdown toggle').click();
  await page.getByRole('menuitem', { name: 'Duplicate project' }).click();

  // Get the exact copied name from API response
  const copyResponse = await copyResponsePromise;
  const responseData: unknown = await copyResponse.json();

  if (!isProjectResponse(responseData)) {
    throw new Error('Invalid project response from API');
  }

  // Wait for success alert to appear (copy from list stays on list page)
  await expect(page.getByTestId('alert-toaster')).toContainText('duplicated', { timeout: 10000 });

  return responseData.name;
}

export async function deleteAwxProject(projectName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Projects');
  await clickTableRow(
    { text: projectName, filterLabel: 'Name', filterValue: projectName, clearFilters: true },
    page
  );
  await clickPageAction('Delete project', page);
  await confirmAndAssertDeletion(page);

  // After deletion, manually navigate back to Projects list to ensure we're on the correct page
  await navigateTo(page, 'Automation Execution', 'Projects');
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
}
