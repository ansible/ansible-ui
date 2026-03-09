import { Page, expect, test } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';

export interface AddApprovalNodeOptions {
  name: string;
  description: string;
}

export interface AddLinkedApprovalNodeOptions {
  name: string;
  description?: string;
  runCondition?: 'always' | 'success' | 'fail';
}

export const WorkflowApproval = {
  api: {
    /**
     * Checks if a workflow approval is actionable (pending/waiting state).
     *
     * In chained approval workflows, downstream nodes may take time to transition
     * from 'new' to 'pending'/'waiting' after upstream actions complete.
     *
     * Returns:
     * - true: Approval is in pending/waiting state (ready for approve/deny/cancel)
     * - false: Approval not actionable after maxWaitTime
     */
    checkApprovalActionable: async (
      page: Page,
      approvalName: string,
      maxWaitTime = 30000
    ): Promise<boolean> => {
      const checkInterval = 2000;
      const startTime = Date.now();
      let pollCount = 0;

      while (Date.now() - startTime < maxWaitTime) {
        pollCount++;

        try {
          const approvals = await awxAPI.get<{
            results: Array<{ id: number; name: string; status: string }>;
          }>(page, '/workflow_approvals/', { params: { name: approvalName } });

          if (!approvals?.results?.[0]) {
            await page.waitForTimeout(checkInterval);
            continue;
          }

          const approval = approvals.results[0];
          const status = String(approval.status || '');

          if (status === 'pending' || status === 'waiting') {
            // eslint-disable-next-line no-console
            console.log(
              `Approval "${approvalName}" actionable (status: "${status}") after ${pollCount} polls (${Date.now() - startTime}ms)`
            );
            return true;
          }

          if (['successful', 'failed', 'error', 'canceled'].includes(status)) {
            // eslint-disable-next-line no-console
            console.log(
              `Approval "${approvalName}" already in terminal state "${status}" after ${pollCount} polls`
            );
            return false;
          }
        } catch {
          return false;
        }

        await page.waitForTimeout(checkInterval);
      }

      const totalTime = Date.now() - startTime;
      // eslint-disable-next-line no-console
      console.log(
        `Approval "${approvalName}" not actionable after ${pollCount} polls in ${totalTime}ms (max: ${maxWaitTime}ms)`
      );
      return false;
    },

    /**
     * Polls the API until a workflow approval reaches the expected status.
     * Use this before UI assertions to avoid long UI polling timeouts.
     *
     * Returns true if the expected status was reached, false if timed out.
     */
    waitForApprovalStatus: async (
      page: Page,
      approvalName: string,
      expectedStatus: string,
      maxWaitTime = 20000
    ): Promise<boolean> => {
      const checkInterval = 2000;
      const startTime = Date.now();

      while (Date.now() - startTime < maxWaitTime) {
        try {
          const approvals = await awxAPI.get<{
            results: Array<{ id: number; name: string; status: string }>;
          }>(page, '/workflow_approvals/', { params: { name: approvalName } });

          if (approvals?.results?.[0]?.status === expectedStatus) {
            return true;
          }
        } catch {
          // Continue polling on transient errors
        }

        await page.waitForTimeout(checkInterval);
      }

      return false;
    },

    /**
     * Polls the API until all workflow approvals matching a description reach the expected status.
     * Useful for bulk approve/deny scenarios where multiple approvals share the same description.
     */
    waitForAllApprovalsStatus: async (
      page: Page,
      description: string,
      expectedStatus: string,
      expectedCount: number,
      maxWaitTime = 20000
    ): Promise<boolean> => {
      const checkInterval = 2000;
      const startTime = Date.now();

      while (Date.now() - startTime < maxWaitTime) {
        try {
          const approvals = await awxAPI.get<{
            results: Array<{ id: number; name: string; status: string; description: string }>;
          }>(page, '/workflow_approvals/', { params: { description } });

          const results = approvals?.results;
          if (
            results &&
            results.length >= expectedCount &&
            results.slice(0, expectedCount).every((a) => a.status === expectedStatus)
          ) {
            return true;
          }
        } catch {
          // Continue polling on transient errors
        }

        await page.waitForTimeout(checkInterval);
      }

      return false;
    },

    /**
     * Fetches a workflow approval by name and returns its ID.
     * Throws if the approval is not found.
     */
    getApprovalId: async (page: Page, approvalName: string): Promise<number> => {
      const approvals = await awxAPI.get<{
        results: Array<{ id: number; name: string }>;
      }>(page, '/workflow_approvals/', { params: { name: approvalName } });

      if (!approvals?.results?.[0]?.id) {
        throw new Error(`Could not find workflow approval: ${approvalName}`);
      }

      return approvals.results[0].id;
    },

    /**
     * Fetches the workflow job ID associated with a workflow approval.
     * Returns the job ID, or undefined if not found.
     */
    getWorkflowJobId: async (page: Page, approvalName: string): Promise<number | undefined> => {
      const approvals = await awxAPI.get<{
        results: Array<{
          id: number;
          name: string;
          summary_fields: { workflow_job: { id: number } };
        }>;
      }>(page, '/workflow_approvals/', { params: { name: approvalName } });

      return approvals?.results?.[0]?.summary_fields?.workflow_job?.id;
    },

    deleteWorkflowTemplate: async (page: Page, workflowTemplateName: string): Promise<void> => {
      await test.step(`Delete workflow job template via API: ${workflowTemplateName}`, async () => {
        const workflows = await awxAPI.get<{ results: { id: number; name: string }[] }>(
          page,
          '/workflow_job_templates/',
          { params: { name: workflowTemplateName } }
        );

        if (workflows && workflows.results.length > 0) {
          const templateId = workflows.results[0].id;

          const workflowJobs = await awxAPI.get<{
            results: { id: number; status: string; workflow_job_template: number }[];
          }>(page, '/workflow_jobs/', {
            params: { workflow_job_template: templateId },
          });

          if (workflowJobs && workflowJobs.results.length > 0) {
            for (const job of workflowJobs.results) {
              const isRunning = !['successful', 'failed', 'error', 'canceled'].includes(job.status);
              if (isRunning) {
                await awxAPI.post(page, `/workflow_jobs/${job.id}/cancel/`, undefined, {
                  expectStatus: 202,
                });
              }
            }

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

            for (const job of workflowJobs.results) {
              await awxAPI.delete(page, `/workflow_jobs/${job.id}/`);
            }
          }

          await awxAPI.delete(page, `/workflow_job_templates/${templateId}/`);
        }
      });
    },
  },

  ui: {
    addApprovalNode: async (page: Page, options: AddApprovalNodeOptions): Promise<void> => {
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
    },

    addLinkedApprovalNode: async (
      page: Page,
      fromNodeName: string,
      options: AddLinkedApprovalNodeOptions
    ): Promise<void> => {
      const { name, description, runCondition = 'always' } = options;

      const sourceNode = page
        .locator('.pf-topology__node__label')
        .filter({ hasText: fromNodeName });
      await expect(sourceNode).toBeVisible();

      const actionIcon = sourceNode.locator('.pf-topology__node__action-icon');
      await expect(actionIcon).toBeVisible();
      await actionIcon.click();

      await page.getByRole('menuitem', { name: 'Add step and link' }).click();

      const addStepWizard = page.getByTestId('wizard');
      await expect(addStepWizard).toBeVisible();

      const nodeTypeSelect = page.getByTestId('node-type');
      await nodeTypeSelect.getByRole('button').click();
      await nodeTypeSelect.getByRole('option', { name: 'Approval' }).click();

      await page.getByLabel('Name').fill(name);

      if (description) {
        await page.getByLabel('Description').fill(description);
      }

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
    },

    confirmAction: async (page: Page, action: 'Approve' | 'Deny'): Promise<void> => {
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await dialog.locator('#confirm').click();
      await dialog.getByRole('button', { name: `${action} workflow approvals` }).click();
      await expect(dialog.getByRole('progressbar')).toBeVisible();
      await dialog.getByRole('button', { name: 'Close' }).click();
      await expect(dialog).not.toBeVisible();
    },
  },
} as const;
