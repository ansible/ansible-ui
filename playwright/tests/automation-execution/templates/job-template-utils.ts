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
    survey?: boolean;
    createLabel?: boolean;
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
  await expect(page.getByRole('menuitem', { name: 'Create job template' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Create job template' }).click();
  await page.getByPlaceholder('Enter job template name').fill(jobTemplateName);
  await page.getByPlaceholder('Enter description').fill(jobTemplateDescription);
  if (options.PromptOnLaunch) {
    await page.locator('#ask_inventory_on_launch').check();
    await page.locator('#ask_execution_environment_on_launch').check();
    await page.locator('#ask_credential_on_launch').check();
    await page.locator('#ask_instance_groups_on_launch').check();
    await page.locator('#ask_labels_on_launch').check();
  } else {
    await page.getByRole('button', { name: 'Inventory' }).click();
    await page.getByRole('textbox', { name: 'Search input' }).fill(inventoryName);
    await page.getByRole('option', { name: inventoryName, exact: true }).click();
  }
  const projectName = options.projectName ?? 'Demo Project';
  await page.locator('#project-select').click();
  await page.getByRole('option', { name: projectName }).click();
  await expect(page.getByPlaceholder('Add a project, then select a')).toBeVisible();
  await page.getByPlaceholder('Add a project, then select a').click();
  await page.getByPlaceholder('Add a project, then select a').fill('hello');
  await expect(page.getByRole('option', { name: 'hello_world.yml' })).toBeVisible();
  await page.getByRole('option', { name: 'hello_world.yml' }).click();
  if (options.labels) {
    for (const label of options.labels) {
      await expect(page.getByPlaceholder('Select or create labels')).toBeVisible();
      await page.getByPlaceholder('Select or create labels').fill(label);
      if (options.createLabel) {
        await page.getByRole('option', { name: 'Create' }).click();
      } else {
        await page.getByRole('option', { name: label, exact: true }).click();
      }
    }
  }
  if (options.extraVarsPrompt) {
    await page.locator('#ask_variables_on_launch').check();
  }
  if (options.skipTagsPrompt) {
    await page.locator('#ask_skip_tags_on_launch').check();
  }
  await page.getByRole('combobox', { name: 'Type to filter' }).click();
  await page.getByRole('option', { name: 'hello_world.yml' }).click();
  await expect(page.getByPlaceholder('Add a project, then select a')).toHaveValue(
    'hello_world.yml'
  );
  await expect(page.getByRole('button', { name: 'Create job template' })).toBeVisible();
  await page.getByRole('button', { name: 'Create job template' }).click();
  await expect(page.getByRole('heading', { name: jobTemplateName })).toBeVisible();
  await expect(page.getByTestId('name').getByText(jobTemplateName)).toBeVisible();
  await expect(page.getByTestId('description').getByText(jobTemplateDescription)).toBeVisible();
  await expect(page.getByTestId('job-type').getByText('run')).toBeVisible();

  if (!options.PromptOnLaunch) {
    await expect(page.locator('#inventory')).toContainText(inventoryName);
  }
  await expect(page.locator('#project')).toContainText(projectName);
  await expect(page.locator('#playbook')).toContainText('hello_world.yml');
  if (options.survey) {
    await page.getByRole('tab', { name: 'Survey' }).click();
    await page.getByRole('link', { name: 'Create survey question' }).click();
    await page.getByRole('textbox', { name: 'Question' }).click();
    await page.getByRole('textbox', { name: 'Question' }).fill('Question 1');
    await page.getByRole('textbox', { name: 'Answer variable name' }).click();
    await page.getByRole('textbox', { name: 'Answer variable name' }).fill('Variable1');
    await page.getByRole('button', { name: 'Create survey question' }).click();
    await expect(page.getByText('Survey enabled')).toBeVisible();
    await page.getByText('Survey enabled').click();
  }
  return jobTemplateName;
}

export async function runJobTemplate(
  jobTemplateName: string,
  options: {
    doNotWait?: boolean;
    inventoryName?: string;
    labels?: string[];
    view?: 'list' | 'details';
    PromptOnLaunch?: boolean;
    survey?: {
      question: string;
      answerVar: string;
    };
  },
  page: Page
) {
  const inventoryName = options?.inventoryName ?? 'Demo Inventory';
  await navigateTo(page, 'Automation Execution', 'Templates');
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
    await page.getByRole('option', { name: inventoryName, exact: true }).click();
    await page.getByLabel('Execution environment').click();
    await page.getByRole('option', { name: 'Control Plane Execution' }).click();
    await page.getByLabel('Instance groups').click();
    await page.getByLabel('default').check();
    await page.getByRole('button', { name: 'Next' }).click();
    if (options?.survey) {
      await expect(page.getByLabel('Steps').getByRole('list')).toContainText('Survey');
      await page.getByRole('textbox', { name: options.survey.question }).fill('a1');
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.getByRole('code')).toContainText(options.survey.answerVar + ': a1');
    }
    await expect(page.locator('#inventory')).toContainText(inventoryName);
    await expect(page.locator('#execution-environment')).toContainText('Control Plane Execution');
    await expect(page.locator('#instance-groups')).toContainText('default');
    for (const label of options.labels ?? []) {
      await page.locator('#labels').scrollIntoViewIfNeeded();
      await expect(page.locator('#labels')).toContainText(label);
    }
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

import { JobTemplate } from '@ansible/awx-ui/interfaces/JobTemplate';
import { APIRequestContext } from '@playwright/test';
import { platformUI } from '../../../commands/login';
import { controllerAPI } from '../workflow-visualizer/controller-api';

interface CreateJobTemplateOptions {
  name?: string;
  inventoryId?: number;
  projectId?: number;
  playbook?: string;
  ask_inventory_on_launch?: boolean;
  ask_variables_on_launch?: boolean;
  ask_skip_tags_on_launch?: boolean;
  ask_labels_on_launch?: boolean;
  ask_credential_on_launch?: boolean;
  ask_instance_groups_on_launch?: boolean;
  labels?: string[];
}

export async function createJobTemplateAPI(
  request: APIRequestContext,
  options: CreateJobTemplateOptions = {}
): Promise<{ id: number; name: string }> {
  const name = options.name ?? `e2e-job-template-${Date.now()}`;
  const playbook = options.playbook ?? 'hello_world.yml';
  const url = platformUI + controllerAPI(`/job_templates/`);
  // sanitize and remove double slashes
  const sanitizedUrl = url.replace(/\/{2,}/g, '/');
  const cookie = (await request.storageState()).cookies.find(
    (cookie) => cookie.name === 'csrftoken'
  );

  const response = await request.post(sanitizedUrl, {
    data: {
      name,
      job_type: 'run',
      inventory: options.inventoryId ?? 1,
      project: options.projectId ?? 6,
      playbook,
      ask_inventory_on_launch: options.ask_inventory_on_launch ?? false,
      ask_credential_on_launch: options.ask_credential_on_launch ?? false,
      ask_instance_groups_on_launch: options.ask_instance_groups_on_launch ?? false,
      ask_variables_on_launch: options.ask_variables_on_launch ?? false,
      ask_skip_tags_on_launch: options.ask_skip_tags_on_launch ?? false,
      ask_labels_on_launch: options.ask_labels_on_launch ?? false,
    },
    headers: {
      'X-CSRFToken': cookie?.value as string,
    },
  });
  expect(response.ok()).toBeTruthy();
  const json = (await response.json()) as JobTemplate;
  return { id: json.id, name };
}

export async function deleteJobTemplateAPI(request: APIRequestContext, id: number): Promise<void> {
  const cookie = (await request.storageState()).cookies.find(
    (cookie) => cookie.name === 'csrftoken'
  );
  const url = platformUI + controllerAPI(`/job_templates/${id}/`);
  // sanitize and remove double slashes
  const sanitizedUrl = url.replace(/\/{2,}/g, '/');
  const response = await request.delete(sanitizedUrl, {
    headers: {
      'X-CSRFToken': cookie?.value ?? '',
    },
  });

  expect(response.ok()).toBeTruthy();
}
