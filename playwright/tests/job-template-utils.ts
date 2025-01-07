import { Page, expect } from '@playwright/test';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';

export async function createJobTemplate(
  options: { name?: string; inventoryName?: string; projectName?: string },
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

  await new Promise((r) => setTimeout(r, 1000)); // TODO need to figure this out...
  await page.getByRole('button', { name: 'Create job template' }).click();
  await expect(page.getByRole('heading').first()).toContainText(jobTemplateName);
  await expect(page.locator('#name')).toContainText(jobTemplateName);
  await expect(page.locator('#inventory')).toContainText(inventoryName);
  await expect(page.locator('#project')).toContainText(projectName);
  // await expect(page.locator('#execution-environment')).toContainText(
  //   'Default execution environment'
  // );
  await expect(page.locator('#playbook')).toContainText('hello_world.yml');
  return jobTemplateName;
}

export async function runJobTemplate(jobTemplateName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Templates');
  await page.getByRole('button', { name: 'Select name' }).click();
  await page.getByLabel('Search input').fill(jobTemplateName);
  await page.getByLabel(jobTemplateName).check();
  await page.getByRole('row', { name: jobTemplateName }).getByLabel('Launch template').click();
  await expect(page.getByRole('main')).toContainText(jobTemplateName);
  await expect(page.getByText('Success', { exact: true })).toBeVisible({ timeout: 60000 });
  await page.getByRole('tab', { name: 'Details' }).click();
  await expect(page.locator('#name')).toContainText(jobTemplateName);
  await expect(page.locator('#status')).toContainText('Success');
  await expect(page.locator('#job-template')).toContainText(jobTemplateName);
}

export async function deleteJobTemplate(jobTemplateName: string, page: Page) {
  await navigateTo(page, 'Automation ExecutionAutomation Controller', 'Templates');
  await page.getByRole('button', { name: 'Select name' }).click();
  await page.getByLabel('Search input').fill(jobTemplateName);
  await page.getByLabel(jobTemplateName).check();
  await page.getByRole('link', { name: jobTemplateName }).click();
  await expect(page.getByRole('heading')).toContainText(jobTemplateName);
  await page.getByLabel('kebab dropdown toggle').click();
  await page.getByRole('menuitem', { name: 'Delete template' }).click();
  await page.getByText('Yes, I confirm that I want to').click();
  await page.getByRole('button', { name: 'Delete template' }).click();
  await expect(page.getByRole('heading')).toContainText('Templates');
}
