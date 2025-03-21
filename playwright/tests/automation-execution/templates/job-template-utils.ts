import { Page, expect } from '@playwright/test';
import { clickTableRow } from '../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../commands/createE2EName';
import { filterTable } from '../../../commands/filterTable';
import { navigateTo } from '../../../commands/navigateTo';

export async function createJobTemplate(
  options: {
    name?: string;
    inventoryName?: string;
    projectName?: string;
    labels?: string[];
    PromptOnLaunch?: boolean;
    skipTagsPrompt?: boolean;
    extraVarsPrompt?: boolean;
  },
  page: Page
) {
  const jobTemplateName = options.name ?? createE2EName('job-template');
  const jobTemplateDescription = 'This is a JT description';
  const inventoryName = options.inventoryName ?? 'Demo Inventory';
  await navigateTo(page, 'Automation Execution', 'Templates');
  await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('button', { name: 'dropdown toggle', exact: true })).toBeVisible({
    timeout: 5000,
  });
  await page.getByText('Create template', { exact: true }).click();
  await page.getByRole('menuitem', { name: 'Create job template' }).click();
  await page.getByPlaceholder('Enter job template name').fill(jobTemplateName);
  await page.getByPlaceholder('Enter description').fill(jobTemplateDescription);
  if (options.PromptOnLaunch) {
    await page.locator('#ask_inventory_on_launch').check();
    await page.locator('#ask_execution_environment_on_launch').check();
    await page.locator('#ask_credential_on_launch').check();
    await page.locator('#ask_instance_groups_on_launch').check();
  } else {
    await page.getByRole('button', { name: 'Inventory' }).click();
    await page.getByRole('option', { name: inventoryName }).click();
  }
  const projectName = options.projectName ?? 'Demo Project';
  await page.locator('#project-select').click();
  await page.getByRole('option', { name: projectName }).click();
  if (options.labels) {
    for (const label of options.labels) {
      await page.getByPlaceholder('Select or create labels').fill(label);
      await page.getByRole('option', { name: label }).click();
    }
  }
  if (options.extraVarsPrompt) {
    await page.locator('#ask_variables_on_launch').check();
  }
  if (options.skipTagsPrompt) {
    await page.locator('#ask_skip_tags_on_launch').check();
  }
  await expect(page.getByRole('button', { name: 'hello_world.yml' })).toBeVisible({
    timeout: 2 * 60 * 1000,
  });
  await page.getByRole('button', { name: 'Create job template' }).click();
  await expect(page.getByRole('heading', { name: jobTemplateName, exact: true })).toBeVisible();
  await expect(page.locator('#name')).toContainText(jobTemplateName);
  await expect(page.locator('#description')).toContainText(jobTemplateDescription);
  await expect(page.locator('#job-type')).toContainText('run');
  await expect(page.locator('#organization')).toContainText('Default');
  if (!options.PromptOnLaunch) {
    await expect(page.locator('#inventory')).toContainText(inventoryName);
  }
  await expect(page.locator('#project')).toContainText(projectName);
  await expect(page.locator('#playbook')).toContainText('hello_world.yml');
  return jobTemplateName;
}

export async function runJobTemplate(
  jobTemplateName: string,
  options: {
    doNotWait?: boolean;
    inventoryName?: string;
    view?: 'list' | 'details';
    PromptOnLaunch?: boolean;
  },
  page: Page
) {
  const inventoryName = options?.inventoryName ?? 'Demo Inventory';
  await navigateTo(page, 'Automation Execution', 'Templates');
  await page.getByLabel('table view', { exact: true }).click();
  if (options?.view === 'details') {
    await clickTableRow({ text: jobTemplateName }, page);
    await expect(page.getByRole('main')).toContainText(jobTemplateName);
    await page.locator('#launch-template').click();
  } else {
    await filterTable(
      { filterLabel: 'Name', filterValue: jobTemplateName, clearFilters: true },
      page
    );
    await page.getByRole('row', { name: jobTemplateName }).getByLabel('Launch template').click();
  }
  if (options?.PromptOnLaunch) {
    await expect(page.getByRole('heading', { name: 'Prompt on Launch', exact: true })).toBeVisible({
      timeout: 30000,
    });
    await page.getByRole('button', { name: 'Inventory' }).click();
    await page.getByRole('option', { name: inventoryName }).click();
    await page.getByLabel('Execution environment').click();
    await page.getByRole('option', { name: 'Control Plane Execution' }).click();
    await page.getByLabel('Instance groups').click();
    await page.getByLabel('default').check();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.locator('#inventory')).toContainText(inventoryName);
    await expect(page.locator('#execution-environment')).toContainText('Control Plane Execution');
    await expect(page.locator('#instance-groups')).toContainText('default');
    await page.getByRole('button', { name: 'Finish' }).click();
  }
  await expect(page.getByRole('main')).toContainText('Output');
  if (!options?.doNotWait) {
    await expect(page.getByText('Success', { exact: true })).toBeVisible({ timeout: 120000 });
  }
  await page.getByRole('tab', { name: 'Details' }).click();
  await expect(page.locator('#name')).toContainText(jobTemplateName);
  if (!options?.doNotWait) {
    await expect(page.locator('#status')).toContainText('Success');
  }
  await expect(page.locator('#job-template')).toContainText(jobTemplateName);
}

export async function deleteJobTemplate(
  jobTemplateName: string,
  page: Page,
  view?: 'list' | 'details'
) {
  await navigateTo(page, 'Automation Execution', 'Templates');
  await page.getByLabel('table view', { exact: true }).click();
  if (view === 'details') {
    await clickTableRow({ text: jobTemplateName }, page);
    await page.getByLabel('kebab dropdown toggle').click();
    await page.getByRole('menuitem', { name: 'Delete template' }).click();
  } else {
    await filterTable(
      { filterLabel: 'Name', filterValue: jobTemplateName, clearFilters: true },
      page
    );
    await page.getByRole('row', { name: jobTemplateName }).getByLabel('Select row').click();
    await page.getByLabel('toolbar actions').click();
    await page.getByRole('menuitem', { name: 'Delete template' }).click();
  }
  await confirmAndAssertDeletion(page);
}
