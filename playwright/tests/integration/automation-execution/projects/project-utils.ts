import { expect, Page } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { expectRowToContain } from '@ansible/playwright/commands/expectRowToContain';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';

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
