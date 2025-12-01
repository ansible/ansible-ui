/** @deprecated Use WorkflowApproval from '@ansible/playwright/utils' instead */

import { Page, expect, test } from '@playwright/test';
import { awxAPI } from '@ansible/playwright/commands/apiClient';

/**
 * Adds a new approval node to the workflow visualizer.
 * Clicks the "Add step" button and creates an approval node with the given name and description.
 *
 * @param page - Playwright page object
 * @param options - Configuration for the approval node
 */
export async function addApprovalNode(page: Page, options: { name: string; description: string }) {
  const addStepButton = page.getByTestId('toolbar-add-node-button');
  await addStepButton.click();

  const addStepWizard = page.getByTestId('wizard');
  await expect(addStepWizard).toBeVisible();

  const nodeTypeSelect = page.getByTestId('node-type');
  await nodeTypeSelect.getByRole('button').click();
  await nodeTypeSelect.getByRole('option', { name: 'Approval' }).click();

  await page.getByLabel('Name').fill(options.name);
  await page.getByLabel('Description').fill(options.description);

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.getByRole('button', { name: 'Fit to Screen' }).click();

  await expect(addStepWizard).not.toBeVisible();
}

export interface AddLinkedApprovalNodeOptions {
  name: string;
  description?: string;
  runCondition?: 'always' | 'success' | 'fail';
}

/**
 * Adds a new approval node linked to an existing node in the workflow visualizer.
 * Clicks the kebab menu on the source node and selects "Add step and link".
 *
 * @param page - Playwright page object
 * @param fromNodeName - Name of the existing node to link from
 * @param options - Configuration for the new approval node
 */
export async function addLinkedApprovalNode(
  page: Page,
  fromNodeName: string,
  options: AddLinkedApprovalNodeOptions
) {
  const { name, description, runCondition = 'always' } = options;

  // Find the source node and click its action icon
  const sourceNode = page.locator('.pf-topology__node__label').filter({ hasText: fromNodeName });
  await expect(sourceNode).toBeVisible();

  const actionIcon = sourceNode.locator('.pf-topology__node__action-icon');
  await expect(actionIcon).toBeVisible();
  await actionIcon.click();

  // Click "Add step and link" menu item
  await page.getByRole('menuitem', { name: 'Add step and link' }).click();

  // Fill in the wizard
  const addStepWizard = page.getByTestId('wizard');
  await expect(addStepWizard).toBeVisible();

  const nodeTypeSelect = page.getByTestId('node-type');
  await nodeTypeSelect.getByRole('button').click();
  await nodeTypeSelect.getByRole('option', { name: 'Approval' }).click();

  await page.getByLabel('Name').fill(name);

  if (description) {
    await page.getByLabel('Description').fill(description);
  }

  // Set run condition if not 'always'
  if (runCondition !== 'always') {
    const nodeStatusSelect = page.getByTestId('node-status-type');
    await nodeStatusSelect.getByRole('button').click();

    const optionName = runCondition === 'success' ? 'Run on success' : 'Run on fail';
    await nodeStatusSelect.getByRole('option', { name: optionName }).click();
  }

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.getByRole('button', { name: 'Fit to Screen' }).click();

  await expect(addStepWizard).not.toBeVisible();
}

export async function confirmWorkflowApprovalAction(page: Page, action: 'Approve' | 'Deny') {
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('#confirm').click();
  await dialog.getByRole('button', { name: `${action} workflow approvals` }).click();
  await expect(dialog.getByRole('progressbar')).toBeVisible();
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).not.toBeVisible();
}

/**
 * Cleanup utility for workflow job template - deletes the workflow job template via API
 * Ensures all associated workflow jobs are canceled/deleted before deleting the template
 */
export async function deleteWorkflowTemplateAPI(
  options: { workflowTemplateName: string },
  page: Page
): Promise<void> {
  const { workflowTemplateName } = options;
  await test.step(`Delete workflow job template via API: ${workflowTemplateName}`, async () => {
    const workflows = await awxAPI.get<{ results: { id: number; name: string }[] }>(
      page,
      '/workflow_job_templates/',
      { params: { name: workflowTemplateName } }
    );

    if (workflows && workflows.results.length > 0) {
      const templateId = workflows.results[0].id;

      // Get all workflow jobs associated with this template
      const workflowJobs = await awxAPI.get<{
        results: { id: number; status: string; workflow_job_template: number }[];
      }>(page, '/workflow_jobs/', {
        params: { workflow_job_template: templateId },
      });

      // Cancel any running workflow jobs before deleting template
      if (workflowJobs && workflowJobs.results.length > 0) {
        for (const job of workflowJobs.results) {
          const isRunning = !['successful', 'failed', 'error', 'canceled'].includes(job.status);
          if (isRunning) {
            // Cancel the job
            await awxAPI.post(page, `/workflow_jobs/${job.id}/cancel/`, undefined, {
              expectStatus: 202,
            });
          }
        }

        // Poll for all workflow jobs to finish before deletion
        const maxAttempts = 10;
        for (const job of workflowJobs.results) {
          let attempts = 0;
          let jobStatus = job.status;

          while (
            attempts < maxAttempts &&
            !['successful', 'failed', 'error', 'canceled'].includes(jobStatus)
          ) {
            await page.waitForTimeout(1000);
            const updatedJob = await awxAPI.get<{ status: string }>(
              page,
              `/workflow_jobs/${job.id}/`
            );
            if (updatedJob) {
              jobStatus = updatedJob.status;
            }
            attempts++;
          }
        }

        // Delete all workflow jobs
        for (const job of workflowJobs.results) {
          await awxAPI.delete(page, `/workflow_jobs/${job.id}/`);
        }
      }

      // Now delete the template
      await awxAPI.delete(page, `/workflow_job_templates/${templateId}/`);
    }
  });
}
