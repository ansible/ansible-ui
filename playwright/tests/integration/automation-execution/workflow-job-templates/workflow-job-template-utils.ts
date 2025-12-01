/** @deprecated Use WorkflowJobTemplate from '@ansible/playwright/utils' instead */

import { Page, expect } from '@playwright/test';
import { WorkflowJobTemplate } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { platformUI } from '@ansible/playwright/commands/login';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';

export interface CreateWorkflowJobTemplateOptions {
  name?: string;
  description?: string;
  organizationName?: string;
  inventoryName?: string;
  limit?: string;
  scmBranch?: string;
  labels?: string[];
  jobTags?: string[];
  skipTags?: string[];
  askLimitOnLaunch?: boolean;
}

/**
 * Create a workflow job template via the UI form
 * Returns the name and ID captured from API response
 */
export async function createWorkflowJobTemplateViaForm(
  options: CreateWorkflowJobTemplateOptions,
  page: Page
): Promise<{ name: string; id?: number }> {
  const wfjtName = options.name ?? createE2EName('workflow-job-template');

  await navigateTo(page, 'Automation Execution', 'Templates');
  await expect(
    page.getByRole('heading', { name: 'Automation Templates', exact: true })
  ).toBeVisible();

  // Navigate directly to create page
  const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;
  await page.goto(`${platformUIWithoutSlash}/execution/templates/workflow-job-template/create`);

  // Fill in name (required field)
  await page.getByTestId('name').fill(wfjtName);

  // Fill in optional fields
  if (options.description) {
    await page.getByTestId('description').fill(options.description);
  }

  if (options.organizationName) {
    await singleSelectByLabel('Organization', options.organizationName, page);
  }

  if (options.inventoryName) {
    await singleSelectByLabel('Inventory', options.inventoryName, page);
  }

  if (options.limit) {
    await page.getByTestId('limit').fill(options.limit);
  }

  if (options.scmBranch) {
    await page.getByTestId('scm-branch').fill(options.scmBranch);
  }

  if (options.labels && options.labels.length > 0) {
    for (const label of options.labels) {
      await page.getByTestId('labels-typeahead-input').fill(label);
      await page.getByRole('option', { name: label, exact: true }).click();
    }
  }

  if (options.jobTags && options.jobTags.length > 0) {
    const jobTagsFormGroup = page.getByTestId('job_tags-form-group');
    for (const tag of options.jobTags) {
      await jobTagsFormGroup.getByRole('textbox').fill(tag);
      await page.getByRole('option', { name: `Create "${tag}"` }).click();
    }
  }

  if (options.skipTags && options.skipTags.length > 0) {
    const skipTagsFormGroup = page.getByTestId('skip_tags-form-group');
    for (const tag of options.skipTags) {
      await skipTagsFormGroup.getByRole('textbox').fill(tag);
      await page.getByRole('option', { name: `Create "${tag}"` }).click();
    }
  }

  if (options.askLimitOnLaunch) {
    await page.locator('#ask_limit_on_launch').check();
  }

  // Submit form
  await page.getByTestId('Submit').click();

  // Verify we're on the visualizer page
  await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible();

  // Return the generated name - tests can extract ID from URL if needed
  return { name: wfjtName };
}

/**
 * Edit a workflow job template from the templates list
 */
export async function editWorkflowJobTemplate(
  workflowJobTemplateName: string,
  updates: Partial<CreateWorkflowJobTemplateOptions>,
  page: Page
): Promise<void> {
  await navigateTo(page, 'Automation Execution', 'Templates');
  await filterTable({ filterLabel: 'Name', filterValue: workflowJobTemplateName }, page);

  // Click edit action from row
  await clickTableRowAction(
    {
      text: workflowJobTemplateName,
      action: 'Edit template',
    },
    page
  );

  // Apply updates
  if (updates.name) {
    await page.getByTestId('name').clear();
    await page.getByTestId('name').fill(updates.name);
  }

  if (updates.description) {
    await page.getByTestId('description').fill(updates.description);
  }

  if (updates.organizationName) {
    await singleSelectByLabel('Organization', updates.organizationName, page);
  }

  if (updates.inventoryName) {
    await singleSelectByLabel('Inventory', updates.inventoryName, page);
  }

  if (updates.limit) {
    await page.getByTestId('limit').fill(updates.limit);
  }

  if (updates.scmBranch) {
    await page.getByTestId('scm-branch').fill(updates.scmBranch);
  }

  // Save changes
  await page.getByRole('button', { name: 'Save workflow job template' }).click();

  // Verify we're on the details page with the updated name
  const finalName = updates.name ?? workflowJobTemplateName;
  await expect(page.getByRole('heading', { name: finalName, exact: true })).toBeVisible();
}

/**
 * Wait for a workflow job to complete with expected status
 */
export async function waitForWorkflowJobStatus(
  jobId: number,
  expectedStatus: 'successful' | 'failed' = 'successful',
  page: Page,
  timeout = 120000
): Promise<void> {
  const startTime = Date.now();
  const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;

  while (Date.now() - startTime < timeout) {
    const statusResponse = await page.request.get(
      `${platformUIWithoutSlash}/api/controller/v2/workflow_jobs/${jobId.toString()}/`
    );

    if (statusResponse.ok()) {
      const jobData = (await statusResponse.json()) as { status: string };
      const status = jobData.status as 'successful' | 'failed';

      if (status === expectedStatus) {
        return;
      }

      if (status === 'failed' && expectedStatus === 'successful') {
        throw new Error(`Workflow job ${jobId} failed unexpectedly`);
      }

      if (status === 'successful' && expectedStatus === 'failed') {
        throw new Error(`Workflow job ${jobId} succeeded unexpectedly`);
      }
    }

    await page.waitForTimeout(2000);
  }

  throw new Error(
    `Workflow job ${jobId} did not reach ${expectedStatus} status within ${timeout}ms`
  );
}

/**
 * Copy/duplicate a workflow job template from the list view
 * Returns the name of the copied workflow job template
 */
export async function copyWorkflowJobTemplate(
  workflowJobTemplateName: string,
  page: Page
): Promise<string> {
  await navigateTo(page, 'Automation Execution', 'Templates');
  await filterTable({ filterLabel: 'Name', filterValue: workflowJobTemplateName }, page);

  // Set up API response interception for copy
  const copyResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/workflow_job_templates/') &&
      response.url().includes('/copy/') &&
      response.status() === 201
  );

  // Click duplicate action from kebab menu
  await clickTableRowAction(
    {
      text: workflowJobTemplateName,
      action: 'Duplicate template',
      inKebab: true,
    },
    page
  );

  // Get the copied workflow job template from the response
  const copyResponse = await copyResponsePromise;
  const copiedWfjt = (await copyResponse.json()) as WorkflowJobTemplate;

  return copiedWfjt.name;
}

/**
 * Delete a workflow job template from its details page
 */
export async function deleteWorkflowJobTemplate(
  workflowJobTemplateName: string,
  page: Page
): Promise<void> {
  await navigateTo(page, 'Automation Execution', 'Templates');
  await clickTableRow(
    { text: workflowJobTemplateName, filterLabel: 'Name', clearFilters: true },
    page
  );
  await clickPageAction('Delete template', page);
  await confirmAndAssertDeletion(page);
}
