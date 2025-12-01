import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';
import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { platformUI } from '../commands/login';
import { navigateTo } from '../commands/navigateTo';
import { awxAPI } from '../commands/apiClient';

export interface CreateWFVizLinkOptions {
  sourceId: number;
  targetId: number;
  type: 'always' | 'success' | 'failure';
  page: Page;
}

export interface CreateWorkflowJobTemplateOptions {
  enableConcurrentJobs?: boolean;
  inventoryName?: string;
  name?: string;
  organizationName?: string;
}

export interface RenderWFVizWithMockDataOptions {
  mockData: PlatformItemsResponse<unknown>;
  id: number;
  page: Page;
}

export const WorkflowVisualizer = {
  api: {
    createLink: async (options: CreateWFVizLinkOptions): Promise<void> => {
      await awxAPI.post(
        options.page,
        `workflow_job_template_nodes/${options.sourceId.toString()}/${options.type}_nodes/`,
        {
          id: options.targetId,
        }
      );
    },
  },

  ui: {
    createWorkflowJobTemplate: async (
      page: Page,
      options: CreateWorkflowJobTemplateOptions = {}
    ): Promise<string> => {
      const name = options?.name ?? createE2EName();
      await navigateTo(page, 'Automation Execution', 'Templates');

      await page.getByTestId('create-template').click();
      await page.getByRole('menuitem', { name: 'Create workflow job template' }).click();

      await page.getByTestId('name').fill(name);

      if (options?.organizationName) {
        await page.getByLabel('Organization').click();
        await page.getByLabel('Search input').fill(options.organizationName);
        await page.getByRole('option', { name: options.organizationName }).click();
      }

      if (options?.inventoryName) {
        await page.getByLabel('Inventory').click();
        await page.getByLabel('Search input').fill(options.inventoryName);
        await page.getByRole('option', { name: options.inventoryName }).click();
      }
      if (options?.enableConcurrentJobs) {
        await page.getByText('Enable concurrent jobs').click();
      }

      await page.getByTestId('Submit').click();

      await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible({
        timeout: 15000,
      });
      return name;
    },

    deleteWorkflowJobTemplate: async (page: Page, wfjtName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Templates');
      await clickTableRow({ text: wfjtName, clearFilters: true }, page);
      await clickPageAction('Delete template', page);
      await confirmAndAssertDeletion(page);
    },

    deleteWorkflowApproval: async (page: Page, approvalName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Administration', 'Workflow Approvals');
      await clickTableRow({ text: approvalName }, page);
      await clickPageAction('Delete template', page);
      await confirmAndAssertDeletion(page);
      await expect(
        page.getByRole('heading', { name: 'Workflow Approvals', exact: true })
      ).toBeVisible();
    },

    navigateToVisualizer: async (page: Page, wfjtName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByRole('button', { name: 'table view' }).click();
      await clickTableRow({ filterLabel: 'Name', text: wfjtName }, page);
      await page.getByRole('link', { name: 'View workflow visualizer' }).click();
    },

    createVisualizerStep: async (
      page: Page,
      stepType: string,
      stepResourceName: string
    ): Promise<void> => {
      switch (stepType) {
        case 'Job Template':
          await WorkflowVisualizer.ui.createNode(page, stepType, stepResourceName, 'Job template');
          return;
        case 'Workflow Job Template':
          await WorkflowVisualizer.ui.createNode(
            page,
            stepType,
            stepResourceName,
            'Workflow job template'
          );
          return;
        case 'Project Sync':
          await WorkflowVisualizer.ui.createNode(page, stepType, stepResourceName, 'Project');
          return;
        case 'Inventory Source Sync':
          await WorkflowVisualizer.ui.createNode(
            page,
            stepType,
            stepResourceName,
            'Inventory source'
          );
          return;
        case 'Management Job':
          await WorkflowVisualizer.ui.createNode(
            page,
            stepType,
            'Clean up activity stream',
            'Management job template'
          );
          return;
        case 'Approval': {
          const wfApprovalName = 'Workflow Approval' + createE2EName();
          await WorkflowVisualizer.ui.createNode(page, stepType, wfApprovalName, '');
          return;
        }
        default:
          return;
      }
    },

    createNode: async (
      page: Page,
      stepType: string,
      stepResourceName: string,
      resourceSelectInputLabel: string
    ): Promise<void> => {
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: `${stepType}`, exact: true }).click();
      await page.getByLabel(`${resourceSelectInputLabel} *`).click();
      if (stepType === 'Approval') {
        await page.getByLabel('Name').fill(stepResourceName);
      } else {
        await page.getByLabel('Search input').fill(stepResourceName);
        await page.getByRole('option', { name: `${stepResourceName}` }).click();
      }
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
    },

    removeAllWorkflowVizNodes: async (page: Page): Promise<void> => {
      await page
        .locator(
          'div:nth-child(2) > .pf-v6-c-toolbar__content-section > .pf-v6-c-toolbar__group > div:nth-child(4) > .pf-v6-c-menu-toggle'
        )
        .click();
      await page.getByRole('menuitem', { name: 'Remove all steps' }).click();
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
      await page.getByRole('button', { name: 'Remove' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await expect(
        page.getByRole('heading', { name: 'There are currently no nodes in this workflow' })
      ).toBeVisible();
    },

    renderWithMockData: async (options: RenderWFVizWithMockDataOptions): Promise<void> => {
      const visualizerUrl = `${platformUI}/api/controller/v2/workflow-job-template/${options.id.toString()}/visualizer`;
      if (await options.page.request.get(visualizerUrl)) {
        await options.page.route(
          `${platformUI}/api/controller/v2/workflow_job_templates/${options.id.toString()}/workflow_nodes/*`,
          async (route) => {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(options.mockData),
            });
          }
        );
      }
    },
  },
} as const;
