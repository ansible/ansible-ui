import { test, expect } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import {
  createVisualizerStep,
  createWorkflowJobTemplate,
  deleteWorkflowJobTemplate,
  navigateToVisualizer,
  removeAllWorkflowVizNodes,
  renderWFVizWithMockData,
} from './workflow-visualizer-utils';
import { createAwxProject, deleteAwxProject } from '../projects/project-utils';
import {
  createInventorySource,
  deleteInventorySource,
} from '../infrastructure/inventories/inventory-utils';
import { createJobTemplate, deleteJobTemplate } from '../templates/job-template-utils';
import { createInventory, deleteInventory } from '../infrastructure/inventories/inventory-utils';
import {
  createExecutionEnvironment,
  deleteExecutionEnvironment,
} from '../infrastructure/execution-environments/execution-environment-utils';
import {
  createAwxCredential,
  deleteAwxCredential,
} from '../infrastructure/credentials/credential-utils';
import {
  createInstanceGroup,
  deleteInstanceGroup,
} from '../infrastructure/instance-groups/instance-group-utils';
import { platformUI } from '../../../commands/login';
import { controllerAPI } from './controller-api';
import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';
import { WorkflowJobTemplate } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';
import { createE2EName } from '../../../commands/createE2EName';
import { clickTableRow } from '../../../commands/clickTableRow';
import { toggleNodeKebab } from '../../../commands/toggleNodeKebab';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);

test.describe('Workflow Visualizer: Add Nodes', () => {
  test(
    'should render a workflow visualizer view with multiple nodes present',
    { tag: ['@not_e2e', '@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const visMockData = {
        count: 3,
        next: null,
        previous: null,
        results: [
          {
            id: 6,
            type: 'workflow_job_template_node',
            url: '/api/controller/v2/workflow_job_template_nodes/6/',
            related: {
              labels: '/api/controller/v2/workflow_job_template_nodes/6/labels/',
              credentials: '/api/controller/v2/workflow_job_template_nodes/6/credentials/',
              instance_groups: '/api/controller/v2/workflow_job_template_nodes/6/instance_groups/',
              create_approval_template:
                '/api/controller/v2/workflow_job_template_nodes/6/create_approval_template/',
              success_nodes: '/api/controller/v2/workflow_job_template_nodes/6/success_nodes/',
              failure_nodes: '/api/controller/v2/workflow_job_template_nodes/6/failure_nodes/',
              always_nodes: '/api/controller/v2/workflow_job_template_nodes/6/always_nodes/',
              unified_job_template: '/api/controller/v2/workflow_approval_templates/25/',
              workflow_job_template: '/api/controller/v2/workflow_job_templates/22/',
            },
            summary_fields: {
              workflow_job_template: {
                id: 22,
                name: 'Workflow job templateE2E 1fa3e336',
                description: '',
              },
              unified_job_template: {
                id: 25,
                name: 'bob',
                description: '',
                unified_job_type: 'workflow_approval',
                timeout: 0,
              },
            },
            created: '2025-02-17T22:00:37.503772Z',
            modified: '2025-02-17T22:00:37.503779Z',
            extra_data: {},
            inventory: null,
            scm_branch: null,
            job_type: null,
            job_tags: null,
            skip_tags: null,
            limit: null,
            diff_mode: null,
            verbosity: null,
            execution_environment: null,
            forks: null,
            job_slice_count: null,
            timeout: null,
            workflow_job_template: 22,
            unified_job_template: 25,
            success_nodes: [],
            failure_nodes: [],
            always_nodes: [],
            all_parents_must_converge: false,
            identifier: '712999ac-9eb9-4229-a06c-81b5938852ad',
          },
          {
            id: 7,
            type: 'workflow_job_template_node',
            url: '/api/controller/v2/workflow_job_template_nodes/7/',
            related: {
              labels: '/api/controller/v2/workflow_job_template_nodes/7/labels/',
              credentials: '/api/controller/v2/workflow_job_template_nodes/7/credentials/',
              instance_groups: '/api/controller/v2/workflow_job_template_nodes/7/instance_groups/',
              create_approval_template:
                '/api/controller/v2/workflow_job_template_nodes/7/create_approval_template/',
              success_nodes: '/api/controller/v2/workflow_job_template_nodes/7/success_nodes/',
              failure_nodes: '/api/controller/v2/workflow_job_template_nodes/7/failure_nodes/',
              always_nodes: '/api/controller/v2/workflow_job_template_nodes/7/always_nodes/',
              unified_job_template: '/api/controller/v2/job_templates/12/',
              workflow_job_template: '/api/controller/v2/workflow_job_templates/22/',
            },
            summary_fields: {
              workflow_job_template: {
                id: 22,
                name: 'Workflow job templateE2E 1fa3e336',
                description: '',
              },
              unified_job_template: {
                id: 12,
                name: 'new-template',
                description: '',
                unified_job_type: 'job',
              },
            },
            created: '2025-02-17T22:00:37.785847Z',
            modified: '2025-02-17T22:00:37.785854Z',
            extra_data: {},
            inventory: null,
            scm_branch: null,
            job_type: null,
            job_tags: null,
            skip_tags: null,
            limit: null,
            diff_mode: null,
            verbosity: null,
            execution_environment: null,
            forks: null,
            job_slice_count: null,
            timeout: null,
            workflow_job_template: 22,
            unified_job_template: 12,
            success_nodes: [],
            failure_nodes: [],
            always_nodes: [8],
            all_parents_must_converge: false,
            identifier: 'da94d2a7-44e7-48d3-834c-0ac009565c7e',
          },
          {
            id: 8,
            type: 'workflow_job_template_node',
            url: '/api/controller/v2/workflow_job_template_nodes/8/',
            related: {
              labels: '/api/controller/v2/workflow_job_template_nodes/8/labels/',
              credentials: '/api/controller/v2/workflow_job_template_nodes/8/credentials/',
              instance_groups: '/api/controller/v2/workflow_job_template_nodes/8/instance_groups/',
              create_approval_template:
                '/api/controller/v2/workflow_job_template_nodes/8/create_approval_template/',
              success_nodes: '/api/controller/v2/workflow_job_template_nodes/8/success_nodes/',
              failure_nodes: '/api/controller/v2/workflow_job_template_nodes/8/failure_nodes/',
              always_nodes: '/api/controller/v2/workflow_job_template_nodes/8/always_nodes/',
              unified_job_template: '/api/controller/v2/projects/10/',
              workflow_job_template: '/api/controller/v2/workflow_job_templates/22/',
            },
            summary_fields: {
              workflow_job_template: {
                id: 22,
                name: 'Workflow job templateE2E 1fa3e336',
                description: '',
              },
              unified_job_template: {
                id: 10,
                name: 'vn-project',
                description: '',
                unified_job_type: 'project_update',
              },
            },
            created: '2025-02-17T22:00:37.785929Z',
            modified: '2025-02-17T22:00:37.785936Z',
            extra_data: {},
            inventory: null,
            scm_branch: null,
            job_type: null,
            job_tags: null,
            skip_tags: null,
            limit: null,
            diff_mode: null,
            verbosity: null,
            execution_environment: null,
            forks: null,
            job_slice_count: null,
            timeout: null,
            workflow_job_template: 22,
            unified_job_template: 10,
            success_nodes: [],
            failure_nodes: [],
            always_nodes: [6],
            all_parents_must_converge: false,
            identifier: '2dc0ba33-472c-44fc-a639-b87ec89f7669',
          },
        ],
      };
      const wfjt = await createWorkflowJobTemplate(page);
      const url =
        platformUI + controllerAPI(`/unified_job_templates/?name=${encodeURIComponent(wfjt)}`);
      const res = await page.request.get(url);
      const body = (await res.json()) as PlatformItemsResponse<WorkflowJobTemplate>;
      const wfjtId = body.results[0].id;
      await renderWFVizWithMockData({
        mockData: visMockData,
        id: wfjtId,
        page,
      });
      //render nodes from mock data and assert success
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible();
      await expect(page.getByText('3', { exact: true })).toBeVisible();
      await deleteWorkflowJobTemplate(wfjt, page);
    }
  );

  test(
    'Should create a workflow job template and then navigate to the visualizer, and then navigate to the details view after clicking cancel',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const wfJobTemplate = await createWorkflowJobTemplate(page);
      await page.getByText('Templates', { exact: true }).click();
      await clickTableRow(
        {
          text: wfJobTemplate,
          pageTitle: 'Automation Templates',
          filterLabel: 'Name',
          filterValue: wfJobTemplate,
          clearFilters: false,
        },
        page
      );
      await page.getByRole('link', { name: 'View workflow visualizer' }).click();
      await expect(page.getByText('Workflow Visualizer')).toBeVisible();
      await expect(page.getByText(wfJobTemplate)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await expect(page.getByText('Total nodes')).toBeVisible();
      await page.getByRole('button', { name: 'Close' }).click();
      await page.getByRole('heading', { name: wfJobTemplate }).click();
      await expect(page.getByLabel('Breadcrumb').getByText(wfJobTemplate)).toBeVisible();
      await expect(page.getByLabel('Breadcrumb').getByText('Details')).toBeVisible();
      await deleteWorkflowJobTemplate(wfJobTemplate, page);
    }
  );
});

test.describe('Workflow Visualizer: Add Node to Existing Visualizer', () => {
  test(
    'Adds a new Job Template node linked to an existing node with on-success status, save the visualizer, then remove all nodes',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const projectName = createE2EName();
      const project = await createAwxProject({ projectName }, page);
      const jobTemplate = await createJobTemplate({}, page);
      const workflowJobTemplate = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Project Sync', project, page);
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await toggleNodeKebab(projectName, page);
      await page.getByRole('menuitem', { name: 'Add step and link' }).click();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByLabel('Search input').fill(jobTemplate);
      await page.getByRole('option', { name: `${jobTemplate}` }).click();
      await page.getByRole('button', { name: 'Always run' }).click();
      await page.getByRole('option', { name: 'Run on success Execute when' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeEnabled();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await expect(page.getByText('2', { exact: true })).toBeVisible();
      await removeAllWorkflowVizNodes(page);
      await deleteWorkflowJobTemplate(workflowJobTemplate, page);
      await deleteJobTemplate(jobTemplate, page);
      await deleteAwxProject(project, page);
    }
  );
});

test.describe('Workflow Visualizer: Edit', () => {
  test(
    'Can edit a node resource on a workflow visualizer already containing existing nodes',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const projectOneName = createE2EName();
      const projectOne = await createAwxProject({ projectName: projectOneName }, page);
      const projectTwo = await createAwxProject({}, page);
      const wfJobTemplate = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Project Sync', projectOne, page);
      await toggleNodeKebab(projectOneName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await page.getByRole('button', { name: 'Project', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(projectTwo);
      await page.getByRole('option', { name: projectTwo }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.locator('[class*="action-icon__background"]').first().click({ force: true });
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await expect(page.getByText(projectTwo)).toBeVisible();
      await removeAllWorkflowVizNodes(page);
      await deleteWorkflowJobTemplate(wfJobTemplate, page);
      await deleteAwxProject(projectTwo, page);
      await deleteAwxProject(projectOne, page);
    }
  );

  test(
    'Click on edge context menu option to change link type and close visualizer to show unsaved changes modal',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const jobTemplateName = createE2EName();
      const projectName = createE2EName();
      const project = await createAwxProject({ projectName }, page);
      const jobTemplate = await createJobTemplate({ name: jobTemplateName }, page);
      const wfjt = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Project Sync', project, page);
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await toggleNodeKebab(projectName, page);
      await page.getByRole('menuitem', { name: 'Add step and link' }).click();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByLabel('Search input').fill(jobTemplate);
      await page.getByRole('option', { name: `${jobTemplate}` }).click();
      await page.getByRole('button', { name: 'Always run' }).click();
      await page.getByRole('option', { name: 'Run on success Execute when' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await expect(page.getByText('2', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await page.locator('g > .pf-v5-svg > path').first().click();
      await page.locator('.pf-topology__node__action-icon > path').click();
      await page.getByRole('menuitem', { name: 'Run on fail' }).click();
      await expect(page.getByText('Run on fail', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Close' }).click();
      await expect(page.getByRole('dialog', { name: 'Warning alert: Warning:' })).toBeVisible();
      await expect(page.getByText('Warning: Unsaved changes')).toBeVisible();
      await page.getByRole('button', { name: 'Save and exit' }).click();
      await deleteWorkflowJobTemplate(wfjt, page);
      await deleteJobTemplate(jobTemplate, page);
      await deleteAwxProject(project, page);
    }
  );

  test(
    'Create a job template node using a JT with multiple dependencies and then edit the node to use a different resource',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const jobTemplateName = createE2EName();
      const inventoryOne = await createInventory({}, page);
      const execEnvOne = await createExecutionEnvironment(page);
      const execEnvTwo = await createExecutionEnvironment(page);
      const credentialOne = await createAwxCredential({}, page);
      const instanceGroup = await createInstanceGroup({}, page);
      const jobTemplate = await createJobTemplate(
        { PromptOnLaunch: true, name: jobTemplateName },
        page
      );
      const wfJobTemplate = await createWorkflowJobTemplate(page);
      //Add step
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(jobTemplate);
      await page.getByRole('option', { name: jobTemplate }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });
      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Inventory' }).click();
      await page.getByRole('option', { name: inventoryOne }).click();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credentialOne);
      await page.getByRole('checkbox', { name: credentialOne }).check();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('button', { name: 'Execution environment' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(execEnvOne);
      await page.getByRole('option', { name: execEnvOne }).click();
      await page.getByRole('button', { name: 'Instance groups' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(instanceGroup);
      await page.getByRole('checkbox', { name: instanceGroup }).check();
      await page.getByRole('button', { name: 'Instance groups' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      // Edit step and select a different execution env.
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await toggleNodeKebab(jobTemplate, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });
      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Execution environment' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(execEnvTwo);
      await page.getByRole('option', { name: execEnvTwo }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.locator('[class*="topology__node__label"]', { hasText: jobTemplate }).click();
      await expect(page.getByRole('link', { name: execEnvTwo })).toBeVisible();
      //cleanup
      await removeAllWorkflowVizNodes(page);
      await deleteJobTemplate(jobTemplate, page);
      await deleteWorkflowJobTemplate(wfJobTemplate, page);
      await deleteAwxCredential(credentialOne, page);
      await deleteExecutionEnvironment(execEnvOne, page);
      await deleteExecutionEnvironment(execEnvTwo, page);
      await deleteInstanceGroup(instanceGroup, page);
      await deleteInventory(inventoryOne, page);
    }
  );
});

test.describe('Workflow Visualizer: Remove and Add Nodes', () => {
  test(
    'Can manually delete all nodes, save the visualizer, then add new nodes, and successfully save again.',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const projectOneName = createE2EName();
      const projectTwoName = createE2EName();
      const projectOne = await createAwxProject({ projectName: projectOneName }, page);
      const projectTwo = await createAwxProject({ projectName: projectTwoName }, page);
      const wfJobTemplate = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Project Sync', projectOne, page);
      await expect(page.getByRole('button', { name: 'Add step' })).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Project Sync' }).click();
      await page.getByRole('button', { name: 'Project', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(projectTwo);
      await page.getByRole('option', { name: projectTwo }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByRole('button', { name: 'Save' }).click();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await expect(page.getByText('2', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await toggleNodeKebab(projectOneName, page);
      await page.getByRole('menuitem', { name: 'Remove step' }).click();
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
      await page.getByRole('button', { name: 'Remove step' }).click();
      await page.getByRole('button', { name: 'Save' }).nth(0).click();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await expect(page.getByText('1', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await toggleNodeKebab(projectTwoName, page);
      await page.getByRole('menuitem', { name: 'Remove step' }).click();
      await page
        .locator('div')
        .filter({ hasText: /^Yes, I confirm that I want to remove this node\.$/ })
        .nth(1)
        .click();
      await page.getByRole('button', { name: 'Remove step' }).click();
      await expect(page.getByText('0', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Save' }).nth(0).click();
      await expect(
        page.getByRole('heading', { name: 'Success alert: Successfully' })
      ).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Project Sync' }).click();
      await page.getByRole('button', { name: 'Project', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(projectTwo);
      await page.getByRole('option', { name: projectTwo }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByRole('button', { name: 'Save' }).nth(0).click();
      await expect(
        page.getByRole('heading', { name: 'Success alert: Successfully' })
      ).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await page.waitForTimeout(200);
      await deleteWorkflowJobTemplate(wfJobTemplate, page);
      await page.waitForTimeout(200);
      await deleteAwxProject(projectTwo, page);
      await page.waitForTimeout(200);
      await deleteAwxProject(projectOne, page);
    }
  );

  test(
    'Can remove all existing nodes on a visualizer using the button in the toolbar kebab, save the visualizer, then add 2 new nodes and save the visualizer again',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const projectName = createE2EName();
      const project = await createAwxProject({ projectName }, page);
      const jobTemplate = await createJobTemplate({}, page);
      const workflowJobTemplate = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Project Sync', project, page);
      await removeAllWorkflowVizNodes(page);
      await navigateToVisualizer(workflowJobTemplate, page);
      await createVisualizerStep('Project Sync', project, page);
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await expect(page.locator('[class*="action-icon__background"]').first()).toBeVisible();
      await toggleNodeKebab(projectName, page);
      await page.getByRole('menuitem', { name: 'Add step and link' }).click();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByLabel(`Job template *`).click();
      await page.getByLabel('Search input').fill(jobTemplate);
      await page.getByRole('option', { name: `${jobTemplate}` }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await expect(page.getByText('Total nodes')).toBeVisible();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.locator('[data-cy="alert-toaster"]')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(page.getByText('2', { exact: true })).toBeVisible();
      await deleteWorkflowJobTemplate(workflowJobTemplate, page);
      await deleteJobTemplate(jobTemplate, page);
      await deleteAwxProject(project, page);
    }
  );
});

test.describe('Workflow Visualizer: Delete Nodes or Links', () => {
  test(
    'Can delete one single node and save the visualizer',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const sourceName = createE2EName();
      const { inventoryName, inventorySourceName } = await createInventorySource(
        { name: sourceName },
        page
      );
      const workflowJobTemplate = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Inventory Source Sync', inventorySourceName, page);
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await expect(page.getByText('1', { exact: true })).toBeVisible();
      await toggleNodeKebab(sourceName, page);
      await page.getByRole('menuitem', { name: 'Remove step' }).click();
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).click();
      await page.getByRole('button', { name: 'Remove step' }).click();
      await expect(page.getByRole('dialog')).toBeHidden();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await expect(page.getByText('0', { exact: true })).toBeVisible();
      await deleteInventorySource(inventoryName, inventorySourceName, page);
      await deleteWorkflowJobTemplate(workflowJobTemplate, page);
    }
  );

  test(
    'Can access an existing workflow visualizer and delete the link between two nodes',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const projectOneName = createE2EName();
      const projectOne = await createAwxProject({ projectName: projectOneName }, page);
      const projectTwo = await createAwxProject({}, page);
      const wfJobTemplate = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Project Sync', projectOne, page);
      await expect(page.getByText('1', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await toggleNodeKebab(projectOneName, page);
      await page.getByRole('menuitem', { name: 'Add step and link' }).click();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Project Sync' }).click();
      await page.getByRole('button', { name: 'Project', exact: true }).click();
      await page.getByLabel('Search input').fill(projectTwo);
      await page.getByRole('option', { name: projectTwo }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await expect(page.getByText('2', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await toggleNodeKebab(projectOneName, page);
      await page.getByRole('menuitem', { name: 'Remove step' }).click();
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
      await page.getByRole('button', { name: 'Remove step' }).click();
      await expect(page.getByText('1', { exact: true })).toBeVisible();
      await removeAllWorkflowVizNodes(page);
      await deleteWorkflowJobTemplate(wfJobTemplate, page);
      await deleteAwxProject(projectTwo, page);
      await deleteAwxProject(projectOne, page);
    }
  );
});

test.describe('Workflow Visualizer Prompt Step', () => {
  test('Should update skip tags', { tag: ['@not_mock', '@compare'] }, async ({ page }) => {
    const jtName = createE2EName();
    const jobTemplate = await createJobTemplate({ name: jtName, skipTagsPrompt: true }, page);
    const workflowJobTemplate = await createWorkflowJobTemplate(page);
    test.setTimeout(5 * 30 * 1000);
    await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
    await page.getByRole('button', { name: 'Add step' }).nth(1).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Job Template', exact: true }).click();
    await page.getByRole('option', { name: 'Job Template', exact: true }).click();
    await page.getByRole('button', { name: 'Job template', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search input' }).click();
    await page.getByRole('textbox', { name: 'Search input' }).fill(jtName);
    await page.getByRole('option', { name: jtName }).click();
    await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });
    await page.getByRole('button', { name: 'Prompts' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('tag1');
    await page.getByRole('option', { name: 'Create "tag1"' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('tag2');
    await page.getByRole('option', { name: 'Create "tag2"' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('tag3');
    await page.getByRole('option', { name: 'Create "tag3"' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Success alert:Successfully')).toBeVisible();
    await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
    await page.getByRole('button', { name: 'Fit to Screen' }).click();
    await expect(page.getByText('1', { exact: true })).toBeVisible();
    await page.locator('[class*="topology__node__label"]', { hasText: jtName }).click();
    await expect(page.getByRole('link', { name: jtName })).toBeVisible();
    await page.getByText('Skip tags', { exact: true }).hover();
    await page.mouse.wheel(0, 1000);
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^tag1tag2tag3$/ })
        .first()
    ).toBeVisible();
    await deleteJobTemplate(jobTemplate, page);
    await deleteWorkflowJobTemplate(workflowJobTemplate, page);
  });
});
