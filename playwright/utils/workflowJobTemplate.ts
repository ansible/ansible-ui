import { Page, expect } from '@playwright/test';
import { WorkflowJobTemplate as WorkflowJobTemplateType } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { clickTableRowAction } from '../commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { filterTable } from '../commands/filterTable';
import { navigateTo } from '../commands/navigateTo';
import { platformUI } from '../commands/login';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';
import { awxAPI } from '../commands/apiClient';

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

const TERMINAL_STATUSES = new Set(['successful', 'failed', 'error', 'canceled']);

export const WorkflowJobTemplate = {
  api: {
    create: async (
      page: Page,
      options?: { name?: string; description?: string }
    ): Promise<WorkflowJobTemplateType> => {
      const workflowJobTemplate = await awxAPI.post<WorkflowJobTemplateType>(
        page,
        'workflow_job_templates/',
        {
          name: options?.name ?? createE2EName('workflow-job-template'),
          description: options?.description ?? 'Created via API for E2E testing',
        }
      );

      if (!workflowJobTemplate) {
        throw new Error('Failed to create workflow job template');
      }

      return workflowJobTemplate;
    },

    delete: async (page: Page, workflowJobTemplateId: number): Promise<void> => {
      await awxAPI.delete(page, `workflow_job_templates/${workflowJobTemplateId}/`);
    },

    /**
     * Deletes a workflow job template by name, canceling any running jobs first.
     */
    deleteByName: async (page: Page, workflowJobTemplateName: string): Promise<void> => {
      const templates = await awxAPI.get<{ results: { id: number; name: string }[] }>(
        page,
        '/workflow_job_templates/',
        { params: { name: workflowJobTemplateName } }
      );

      if (!templates?.results?.[0]) return;

      const templateId = templates.results[0].id;

      // Find and cancel running workflow jobs
      const jobs = await awxAPI
        .get<{ results: { id: number; status: string }[] }>(page, '/workflow_jobs/', {
          params: { workflow_job_template: templateId },
        })
        .catch(() => null);

      if (jobs?.results) {
        // Cancel running jobs
        for (const job of jobs.results) {
          if (!TERMINAL_STATUSES.has(job.status)) {
            await awxAPI
              .post(page, `/workflow_jobs/${job.id}/cancel/`, undefined, { expectStatus: 202 })
              .catch(() => {});
          }
        }

        // Wait for jobs to reach terminal status
        for (const job of jobs.results) {
          let status = job.status;
          for (let i = 0; i < 30 && !TERMINAL_STATUSES.has(status); i++) {
            await page.waitForTimeout(1000);
            const updated = await awxAPI
              .get<{ status: string }>(page, `/workflow_jobs/${job.id}/`)
              .catch(() => null);
            if (updated) status = updated.status;
          }
        }
      }

      await awxAPI.delete(page, `workflow_job_templates/${templateId}/`).catch(() => {});
    },

    /**
     * Checks if workflow job infrastructure is ready by verifying job moves to running state.
     *
     * Returns:
     * - true: Job reached "running" or "waiting" state (infrastructure processing)
     * - false: Job stuck in "pending" for 30s or entered error state
     *
     * @param page - Playwright page object
     * @param jobId - ID of the workflow job to monitor
     * @returns Promise<boolean> - true if infrastructure ready, false otherwise
     */
    /**
     * Polls until workflow job reaches a terminal state.
     *
     * Returns:
     * - true: Job reached terminal state (successful, failed, canceled, error)
     * - false: Job still running after maxWaitTime
     */
    checkWorkflowJobTerminalState: async (
      page: Page,
      jobId: number,
      maxWaitTime = 45000
    ): Promise<boolean> => {
      const checkInterval = 2000;
      const startTime = Date.now();
      let pollCount = 0;

      while (Date.now() - startTime < maxWaitTime) {
        pollCount++;

        try {
          const job = await awxAPI.get<{ status: string }>(page, `/workflow_jobs/${jobId}/`);

          if (!job) {
            return false;
          }

          const status = String(job.status || '');

          if (TERMINAL_STATUSES.has(status)) {
            // eslint-disable-next-line no-console
            console.log(
              `Workflow job ${jobId} reached terminal state "${status}" after ${pollCount} polls (${Date.now() - startTime}ms)`
            );
            return true;
          }
        } catch {
          return false;
        }

        await page.waitForTimeout(checkInterval);
      }

      const totalTime = Date.now() - startTime;
      // eslint-disable-next-line no-console
      console.log(
        `Workflow job ${jobId} not in terminal state after ${pollCount} polls in ${totalTime}ms (max: ${maxWaitTime}ms)`
      );
      return false;
    },

    checkJobInfrastructureReady: async (page: Page, jobId: number): Promise<boolean> => {
      const maxPendingTime = 30000; // 30 seconds
      const checkInterval = 2000; // 2 seconds
      const startTime = Date.now();
      let pollCount = 0;

      while (Date.now() - startTime < maxPendingTime) {
        pollCount++;

        try {
          const job = await awxAPI.get<{ status: string }>(page, `/workflow_jobs/${jobId}/`);

          if (!job) {
            return false;
          }

          const status = String(job.status || '');

          // Job failed to start
          if (status === 'error' || status === 'failed' || status === 'canceled') {
            const elapsed = Date.now() - startTime;
            // eslint-disable-next-line no-console
            console.log(
              `Workflow job ${jobId} in error state "${status}" after ${pollCount} polls (${elapsed}ms)`
            );
            return false;
          }

          // Job infrastructure active (moved past pending) or already completed
          if (status === 'running' || status === 'waiting' || status === 'successful') {
            return true;
          }
        } catch {
          // API error (404, network issue, etc.) - job not accessible
          return false;
        }

        await page.waitForTimeout(checkInterval);
      }

      // Stuck in pending for 30s - likely infrastructure issue
      const totalTime = Date.now() - startTime;
      // eslint-disable-next-line no-console
      console.log(
        `Workflow job ${jobId} not ready after ${pollCount} polls in ${totalTime}ms (max: ${maxPendingTime}ms)`
      );
      return false;
    },
  },
  ui: {
    create: async (
      page: Page,
      options: CreateWorkflowJobTemplateOptions = {}
    ): Promise<{ name: string; id?: number }> => {
      const wfjtName = options.name ?? createE2EName('workflow-job-template');

      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();

      const platformUIWithoutSlash = platformUI.endsWith('/')
        ? platformUI.slice(0, -1)
        : platformUI;
      await page.goto(`${platformUIWithoutSlash}/execution/templates/workflow-job-template/create`);

      await page.getByTestId('name').fill(wfjtName);

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

      await page.getByTestId('Submit').click();
      await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible();

      return { name: wfjtName };
    },

    edit: async (
      page: Page,
      workflowJobTemplateName: string,
      updates: Partial<CreateWorkflowJobTemplateOptions>
    ): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Templates');
      await filterTable({ filterLabel: 'Name', filterValue: workflowJobTemplateName }, page);

      await clickTableRowAction(
        {
          text: workflowJobTemplateName,
          action: 'Edit template',
        },
        page
      );

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

      await page.getByRole('button', { name: 'Save workflow job template' }).click();

      const finalName = updates.name ?? workflowJobTemplateName;
      await expect(page.getByRole('heading', { name: finalName, exact: true })).toBeVisible();
    },

    waitForJobStatus: async (
      page: Page,
      jobId: number,
      expectedStatus: 'successful' | 'failed' = 'successful',
      timeout = 120000
    ): Promise<void> => {
      const startTime = Date.now();
      const platformUIWithoutSlash = platformUI.endsWith('/')
        ? platformUI.slice(0, -1)
        : platformUI;

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
    },

    copy: async (page: Page, workflowJobTemplateName: string): Promise<string> => {
      await navigateTo(page, 'Automation Execution', 'Templates');
      await filterTable({ filterLabel: 'Name', filterValue: workflowJobTemplateName }, page);

      const copyResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/workflow_job_templates/') &&
          response.url().includes('/copy/') &&
          response.status() === 201
      );

      await clickTableRowAction(
        {
          text: workflowJobTemplateName,
          action: 'Duplicate template',
          inKebab: true,
        },
        page
      );

      const copyResponse = await copyResponsePromise;
      const copiedWfjt = (await copyResponse.json()) as WorkflowJobTemplateType;

      return copiedWfjt.name;
    },

    delete: async (page: Page, workflowJobTemplateName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Templates');
      await clickTableRow(
        { text: workflowJobTemplateName, filterLabel: 'Name', clearFilters: true },
        page
      );
      await clickPageAction('Delete template', page);
      await confirmAndAssertDeletion(page);
    },
  },
} as const;
