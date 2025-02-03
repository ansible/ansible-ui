import { Page, expect } from '@playwright/test';
import { clickTableRowWithFilter } from '../../../commands/clickTableRow';
import { createE2EName } from '../../../commands/createE2EName';
import { navigateTo } from '../../../commands/navigateTo';
import { selectTableFilter } from '../../../commands/selectTableFilter';

export async function createJobTemplate(
  options: { name?: string; inventoryName?: string; projectName?: string; labels?: string[] },
  page: Page
) {
  const jobTemplateName = options.name ?? createE2EName('job-template');
  await navigateTo(page, 'Automation ExecutionAutomation Controller', 'Templates');
  await page.getByLabel('dropdown toggle', { exact: true }).click();
  await page.getByRole('menuitem', { name: 'Create job template' }).click();
  await page.getByPlaceholder('Enter job template name').fill(jobTemplateName);

  const inventoryName = options.inventoryName ?? 'Demo Inventory';
  await page.getByLabel('Inventory * Prompt on launch').click();
  await page.getByRole('option', { name: inventoryName }).click();

  const projectName = options.projectName ?? 'Demo Project';
  await page.locator('#project-select').click();
  await page.getByRole('option', { name: projectName }).click();

  if (options.labels) {
    for (const label of options.labels) {
      // await page.getByLabel('Labels').click();
      await page.getByPlaceholder('Select or create labels').fill(label);
      await page.getByRole('option', { name: label }).click();
    }
  }

  await expect(page.getByLabel('hello_world.yml')).toBeVisible({ timeout: 2 * 60 * 1000 });

  await page.getByRole('button', { name: 'Create job template' }).click();

  await expect(page.getByRole('heading', { name: jobTemplateName, exact: true })).toBeVisible();
  await expect(page.locator('#name')).toContainText(jobTemplateName);
  await expect(page.locator('#inventory')).toContainText(inventoryName);
  await expect(page.locator('#project')).toContainText(projectName);
  // await expect(page.locator('#execution-environment')).toContainText(
  //   'Default execution environment'
  // );
  await expect(page.locator('#playbook')).toContainText('hello_world.yml');

  return jobTemplateName;
}

export async function runJobTemplate(
  jobTemplateName: string,
  page: Page,
  options?: { doNotWait?: boolean }
) {
  await navigateTo(page, 'Automation Execution', 'Templates');
  await page.getByLabel('table view', { exact: true }).click();
  await selectTableFilter('Name', page);
  await page.getByRole('button', { name: 'Select name' }).click();
  await page.getByLabel('Search input').fill(jobTemplateName);
  await page.getByLabel(jobTemplateName).check();
  await page.getByRole('row', { name: jobTemplateName }).getByLabel('Launch template').click();
  await expect(page.getByRole('main')).toContainText(jobTemplateName);
  if (!options?.doNotWait) {
    await expect(page.getByText('Success', { exact: true })).toBeVisible({ timeout: 60000 });
  }
  await page.getByRole('tab', { name: 'Details' }).click();
  await expect(page.locator('#name')).toContainText(jobTemplateName);
  if (!options?.doNotWait) {
    await expect(page.locator('#status')).toContainText('Success');
  }
  await expect(page.locator('#job-template')).toContainText(jobTemplateName);
}

export async function deleteJobTemplate(jobTemplateName: string, page: Page) {
  await navigateTo(page, 'Automation ExecutionAutomation Controller', 'Templates');
  await clickTableRowWithFilter(jobTemplateName, page);

  await expect(page.getByRole('heading', { name: jobTemplateName, exact: true })).toBeVisible();
  await page.getByLabel('kebab dropdown toggle').click();
  await page.getByRole('menuitem', { name: 'Delete template' }).click();
  await page.getByText('Yes, I confirm that I want to').click();
  await page.getByRole('button', { name: 'Delete template' }).click();
  await expect(
    page.getByRole('heading', { name: 'Automation Templates', exact: true })
  ).toBeVisible();
}
