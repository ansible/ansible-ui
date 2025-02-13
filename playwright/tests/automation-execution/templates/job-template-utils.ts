import { Page, expect } from '@playwright/test';
import { clickTableRowWithFilter } from '../../../commands/clickTableRow';
import { createE2EName } from '../../../commands/createE2EName';
import { navigateTo } from '../../../commands/navigateTo';
import { selectTableFilter } from '../../../commands/selectTableFilter';
import { clearTableFilters } from '../../../commands/clearTableFilters';
import { filterTableBySelect } from '../../../commands/filterTableBySelect';

export async function createJobTemplate(
  options: {
    name?: string;
    inventoryName?: string;
    projectName?: string;
    labels?: string[];
    PromptOnLaunch?: boolean;
  },
  page: Page
) {
  const jobTemplateName = options.name ?? createE2EName('job-template');
  const jobTemplateDescription = 'This is a JT description';
  const inventoryName = options.inventoryName ?? 'Demo Inventory';
  await navigateTo(page, 'Automation ExecutionAutomation Controller', 'Templates');
  await page.getByLabel('dropdown toggle', { exact: true }).click();
  await page.getByRole('menuitem', { name: 'Create job template' }).click();
  await page.getByPlaceholder('Enter job template name').fill(jobTemplateName);
  await page.getByPlaceholder('Enter description').fill(jobTemplateDescription);

  if (options.PromptOnLaunch) {
    await page.getByPlaceholder('Select inventory').fill('');
    await page.getByPlaceholder('Select inventory').press('Backspace');
    await page.locator('#ask_inventory_on_launch').check();
    await page.locator('#ask_execution_environment_on_launch').check();
    await page.locator('#ask_credential_on_launch').check();
    await page.locator('#ask_instance_groups_on_launch').check();
  } else {
    await page.getByLabel('Inventory * Prompt on launch').click();
    await page.getByRole('option', { name: inventoryName }).click();
  }

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
  // await expect(page.locator('#execution-environment')).toContainText(
  //   'Default execution environment'
  // );
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
    await clickTableRowWithFilter(jobTemplateName, page);
    await expect(page.getByRole('main')).toContainText(jobTemplateName);
    await page.locator('#launch-template').click();
  } else {
    await clearTableFilters(page);
    await selectTableFilter('Name', page);
    await filterTableBySelect(jobTemplateName, page);
    await page.getByRole('row', { name: jobTemplateName }).getByLabel('Launch template').click();
  }
  if (options?.PromptOnLaunch) {
    await expect(page.getByRole('heading', { name: 'Prompt on Launch', exact: true })).toBeVisible({
      timeout: 30000,
    });
    await page.getByPlaceholder('Select inventory').click();
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
  await expect(page.getByRole('main')).toContainText(jobTemplateName);
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
  await navigateTo(page, 'Automation ExecutionAutomation Controller', 'Templates');
  await page.getByLabel('table view', { exact: true }).click();
  if (view === 'details') {
    await clickTableRowWithFilter(jobTemplateName, page);
    await expect(page.getByRole('heading', { name: jobTemplateName, exact: true })).toBeVisible();
    await page.getByLabel('kebab dropdown toggle').click();
    await page.getByRole('menuitem', { name: 'Delete template' }).click();
  } else {
    await clearTableFilters(page);
    await selectTableFilter('Name', page);
    await filterTableBySelect(jobTemplateName, page);
    await page.getByRole('row', { name: jobTemplateName }).getByLabel('Select row').click();
    await page.getByLabel('toolbar actions').click();
    await page.getByRole('menuitem', { name: 'Delete template' }).click();
  }
  await page.getByText('Yes, I confirm that I want to').click();
  await page.getByRole('button', { name: 'Delete template' }).click();
  await expect(
    page.getByRole('heading', { name: 'Automation Templates', exact: true })
  ).toBeVisible();
}
