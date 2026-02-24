import { JobTemplate as JobTemplateType } from '@ansible/awx-ui/interfaces/JobTemplate';
import { Page, expect } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { filterTable } from '../commands/filterTable';
import { navigateTo } from '../commands/navigateTo';

export interface CreateJobTemplateOptions {
  name?: string;
  inventoryName?: string;
  projectName?: string;
  labels?: string[];
  PromptOnLaunch?: boolean;
  skipTagsPrompt?: boolean;
  extraVarsPrompt?: boolean;
  jobTagsPrompt?: boolean;
  survey?: boolean;
  createLabel?: boolean;
}

export interface RunJobTemplateOptions {
  doNotWait?: boolean;
  inventoryName?: string;
  labels?: string[];
  view?: 'list' | 'details';
  PromptOnLaunch?: boolean;
  survey?: {
    question: string;
    answerVar: string;
  };
}

export interface CreateJobTemplateAPIOptions {
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

export const JobTemplate = {
  api: {
    create: async (
      page: Page,
      options: CreateJobTemplateAPIOptions = {}
    ): Promise<JobTemplateType> => {
      const name = options.name ?? `e2e-job-template-${Date.now()}`;
      const playbook = options.playbook ?? 'hello_world.yml';

      const jobTemplate = await awxAPI.post<JobTemplateType>(page, 'job_templates/', {
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
      });

      if (!jobTemplate) {
        throw new Error('Failed to create job template: API returned null');
      }

      return jobTemplate;
    },

    delete: async (page: Page, id: number): Promise<void> => {
      await awxAPI.delete(page, `job_templates/${id}/`);
    },

    cancelJob: async (page: Page, jobId: number): Promise<void> => {
      await awxAPI.post(page, `/jobs/${jobId}/cancel/`, {}).catch(() => {});
    },

    /**
     * Deletes a job template by name, canceling any running jobs first.
     * This is useful for cleanup when jobs may still be running.
     */
    deleteByName: async (page: Page, jobTemplateName: string): Promise<void> => {
      const templates = await awxAPI.get<{ results: { id: number; name: string }[] }>(
        page,
        '/job_templates/',
        { params: { name: jobTemplateName } }
      );

      if (!templates || templates.results.length === 0) {
        return; // Template doesn't exist, nothing to delete
      }

      const templateId = templates.results[0].id;

      // Find all jobs for this template
      const jobs = await awxAPI.get<{
        results: { id: number; status: string; job_template: number }[];
      }>(page, '/jobs/', {
        params: { job_template: templateId },
      });

      if (jobs && jobs.results.length > 0) {
        // Cancel any running jobs
        for (const job of jobs.results) {
          const isRunning = !['successful', 'failed', 'error', 'canceled'].includes(job.status);
          if (isRunning) {
            await awxAPI
              .post(page, `/jobs/${job.id}/cancel/`, undefined, {
                expectStatus: 202,
              })
              .catch(() => {
                // Job may have already completed or cancellation not allowed
              });
          }
        }

        // Wait for jobs to reach terminal status
        const maxAttempts = 30;
        for (const job of jobs.results) {
          let attempts = 0;
          let jobStatus = job.status;

          while (
            attempts < maxAttempts &&
            !['successful', 'failed', 'error', 'canceled'].includes(jobStatus)
          ) {
            await page.waitForTimeout(1000);
            const updatedJob = await awxAPI.get<{ status: string }>(page, `/jobs/${job.id}/`);
            if (updatedJob) {
              jobStatus = updatedJob.status;
            }
            attempts++;
          }
        }
      }

      // Now delete the template
      await awxAPI.delete(page, `/job_templates/${templateId}/`);
    },
  },

  ui: {
    create: async (page: Page, options: CreateJobTemplateOptions = {}): Promise<string> => {
      const jobTemplateName = options.name ?? createE2EName('job-template');
      const jobTemplateDescription = 'This is a JT description';
      const inventoryName = options.inventoryName ?? 'Demo Inventory';
      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({
        timeout: 5000,
      });
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
      await page.getByRole('textbox', { name: 'Search input' }).fill(projectName);
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
      if (options.jobTagsPrompt) {
        await page.locator('#ask_tags_on_launch').check();
      }
      await page.getByRole('combobox', { name: 'Type to filter' }).click();
      await page.getByRole('option', { name: 'hello_world.yml' }).click();
      await expect(page.getByPlaceholder('Add a project, then select a')).toHaveValue(
        /hello_world\.yml$/
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
    },

    run: async (
      page: Page,
      jobTemplateName: string,
      options: RunJobTemplateOptions = {}
    ): Promise<void> => {
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
        await page
          .getByRole('row', { name: jobTemplateName })
          .getByLabel('Launch template')
          .click();
      }
      if (options?.PromptOnLaunch) {
        await expect(
          page.getByRole('heading', { name: 'Prompt on Launch', exact: true })
        ).toBeVisible({
          timeout: 30000,
        });
        await page.getByRole('button', { name: 'Inventory' }).click();
        await page.getByRole('textbox', { name: 'Search input' }).fill(inventoryName);
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
        await expect(page.locator('#execution-environment')).toContainText(
          'Control Plane Execution'
        );
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
    },

    delete: async (
      page: Page,
      jobTemplateName: string,
      view?: 'list' | 'details'
    ): Promise<void> => {
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
    },

    copy: async (
      page: Page,
      jobTemplateName: string,
      view: 'list' | 'details' = 'list'
    ): Promise<string> => {
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByLabel('table view', { exact: true }).click();

      const copyResponsePromise = page.waitForResponse(
        (response) => response.url().includes('/copy/') && response.status() === 201
      );

      if (view === 'details') {
        await clickTableRow({ text: jobTemplateName }, page);
        await expect(page.getByRole('heading', { name: jobTemplateName })).toBeVisible();
        await page.getByLabel('kebab dropdown toggle').click();
        await page.waitForTimeout(1000);
        await page.getByRole('menuitem', { name: 'Duplicate template' }).click();
      } else {
        await filterTable(
          { filterLabel: 'Name', filterValue: jobTemplateName, clearFilters: true },
          page
        );
        await page
          .getByRole('row', { name: jobTemplateName })
          .getByLabel('kebab dropdown toggle')
          .click();
        await page.waitForTimeout(1000);
        await page.getByRole('menuitem', { name: 'Duplicate template' }).click();
      }

      await expect(page.locator('h4')).toContainText(
        `Success alert:${jobTemplateName} duplicated.`,
        {
          timeout: 10000,
        }
      );

      const copyResponse = await copyResponsePromise;
      const copiedTemplate = (await copyResponse.json()) as JobTemplateType;
      return copiedTemplate.name;
    },
  },
} as const;
