import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../commands/clickTableRow';
import { createE2EName } from '../../../commands/createE2EName';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { toggleNodeKebab } from '../../../commands/toggleNodeKebab';
import {
  createAwxCredential,
  deleteAwxCredential,
} from '../infrastructure/credentials/credential-utils';
import {
  createExecutionEnvironment,
  deleteExecutionEnvironment,
} from '../infrastructure/execution-environments/execution-environment-utils';
import {
  createInstanceGroup,
  deleteInstanceGroup,
} from '../infrastructure/instance-groups/instance-group-utils';
import {
  createInventory,
  createInventorySource,
  deleteInventory,
  deleteInventorySource,
} from '../infrastructure/inventories/inventory-utils';
import { createAwxProject, deleteAwxProject } from '../projects/project-utils';
import { createJobTemplate, deleteJobTemplate } from '../templates/job-template-utils';
import {
  createVisualizerStep,
  createWorkflowJobTemplate,
  deleteWorkflowJobTemplate,
  navigateToVisualizer,
  removeAllWorkflowVizNodes,
} from './workflow-visualizer-utils';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);
test.setTimeout(2 * 60 * 1000);
test.describe('Workflow Viz', () => {
  test(
    'Workflow Viz Add Nodes: Should render a workflow visualizer view with multiple nodes present',
    { tag: ['@not_e2e', '@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(8 * 60 * 1000);

      // Create a workflow job template
      const wfjt = await createWorkflowJobTemplate(page);

      // Navigate to the visualizer
      await navigateToVisualizer(wfjt, page);

      // Verify the visualizer loads correctly
      await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add step' }).first()).toBeVisible();

      // Clean up
      await deleteWorkflowJobTemplate(wfjt, page);
    }
  );

  test(
    'Workflow Viz Add Nodes: Should create a workflow job template and then navigate to the visualizer, and then navigate to the details view after clicking cancel',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
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
      await expect(page.getByRole('heading', { name: wfJobTemplate })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await expect(page.getByText('Total nodes')).toBeVisible();
      await page.getByRole('button', { name: 'Close' }).click();
      await page.getByRole('heading', { name: wfJobTemplate }).click();
      await expect(page.getByLabel('Breadcrumb').getByText(wfJobTemplate)).toBeVisible();
      await expect(page.getByLabel('Breadcrumb').getByText('Details')).toBeVisible();
      await deleteWorkflowJobTemplate(wfJobTemplate, page);
    }
  );

  //Unskip this test when https://issues.redhat.com/browse/AAP-42422 is fixed
  test.skip(
    'Adds a new Job Template node linked to an existing node with on-success status, save the visualizer, then remove all nodes',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
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
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await expect(page.locator('[class*="action-icon__background"]').nth(1)).toBeVisible();
      await removeAllWorkflowVizNodes(page);
      await deleteWorkflowJobTemplate(workflowJobTemplate, page);
      await deleteJobTemplate(jobTemplate, page);
      await deleteAwxProject(project, page);
    }
  );

  test(
    'Can edit a node resource on a workflow visualizer already containing existing nodes',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const projectOneName = createE2EName();
      const projectOne = await createAwxProject({ projectName: projectOneName }, page);
      const projectTwo = await createAwxProject({}, page);
      const wfJobTemplate = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Project Sync', projectOne, page);
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
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
      test.setTimeout(5 * 60 * 1000);
      const jobTemplateName = createE2EName();
      const projectName = createE2EName();
      const project = await createAwxProject({ projectName }, page);
      const inventoryName = await createInventory({}, page);
      const jobTemplate = await createJobTemplate(
        { name: jobTemplateName, inventoryName: inventoryName },
        page
      );
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
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Success alert: Successfully' })
      ).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.locator('g > .pf-v6-svg > path').first().click();
      await page.locator('.pf-topology__node__action-icon > path').click();
      await page.getByRole('menuitem', { name: 'Run on fail' }).click();
      await expect(page.getByText('Run on fail', { exact: true })).toBeVisible();
      await deleteWorkflowJobTemplate(wfjt, page);
      await deleteJobTemplate(jobTemplate, page);
      await deleteAwxProject(project, page);
      await deleteInventory(inventoryName, page);
    }
  );

  //Unskip this test when https://issues.redhat.com/browse/AAP-42422 is fixed
  test.skip(
    'Create a job template node using a JT with multiple dependencies and then edit the node to use a different resource',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
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
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      // Edit step and select a different execution env.
      await toggleNodeKebab(jobTemplate, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });
      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Execution environment' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(execEnvTwo);
      await page.getByRole('option', { name: execEnvTwo }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
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

  test(
    'Can manually delete all nodes, save the visualizer, then add new nodes, and successfully save again.',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const projectOneName = createE2EName();
      const projectTwoName = createE2EName();
      const projectOne = await createAwxProject({ projectName: projectOneName }, page);
      const projectTwo = await createAwxProject({ projectName: projectTwoName }, page);
      const wfJobTemplate = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Project Sync', projectOne, page);
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
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
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await expect(page.locator('[class*="action-icon__background"]').nth(1)).toBeVisible();
      await toggleNodeKebab(projectOneName, page);
      await page.getByRole('menuitem', { name: 'Remove step' }).click();
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
      await page.getByRole('button', { name: 'Remove step' }).click();
      await page.getByRole('button', { name: 'Save' }).nth(0).click();
      await expect(
        page.getByRole('heading', { name: 'Success alert: Successfully' })
      ).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await expect(page.locator('[class*="action-icon__background"]').first()).toBeVisible();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await toggleNodeKebab(projectTwoName, page);
      await page.getByRole('menuitem', { name: 'Remove step' }).click();
      await page
        .locator('div')
        .filter({ hasText: /^Yes, I confirm that I want to remove this node\.$/ })
        .nth(1)
        .click();
      await page.getByRole('button', { name: 'Remove step' }).click();
      await expect(page.locator('[class*="action-icon__background"]')).toHaveCount(0);
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
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save' }).nth(0).click();
      await expect(
        page.getByRole('heading', { name: 'Success alert: Successfully' })
      ).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await deleteWorkflowJobTemplate(wfJobTemplate, page);
      await deleteAwxProject(projectTwo, page);
      await deleteAwxProject(projectOne, page);
    }
  );

  test(
    'Can remove all existing nodes on a visualizer using the button in the toolbar kebab, save the visualizer, then add 2 new nodes and save the visualizer again',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const projectName = createE2EName();
      const project = await createAwxProject({ projectName }, page);
      const inventoryName = await createInventory({}, page);
      const jobTemplate = await createJobTemplate({ inventoryName: inventoryName }, page);
      const workflowJobTemplate = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Project Sync', project, page);
      await page.getByRole('button', { name: 'Fit to Screen' }).click();

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
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Success alert: Successfully' })
      ).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(page.locator('[class*="action-icon__background"]').nth(1)).toBeVisible();
      await deleteWorkflowJobTemplate(workflowJobTemplate, page);
      await deleteJobTemplate(jobTemplate, page);
      await deleteAwxProject(project, page);
      await deleteInventory(inventoryName, page);
    }
  );

  test(
    'Can delete one single node and save the visualizer',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const sourceName = createE2EName();
      const { inventoryName, inventorySourceName } = await createInventorySource(
        { name: sourceName },
        page
      );
      const workflowJobTemplate = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Inventory Source Sync', inventorySourceName, page);
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await expect(page.locator('[class*="action-icon__background"]').first()).toBeVisible();
      await toggleNodeKebab(sourceName, page);
      await page.getByRole('menuitem', { name: 'Remove step' }).click();
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).click();
      await page.getByRole('button', { name: 'Remove step' }).click();
      await expect(page.getByRole('dialog')).toBeHidden();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      await expect(page.locator('[class*="action-icon__background"]')).toHaveCount(0);
      await deleteInventorySource(inventoryName, inventorySourceName, page);
      await deleteInventory(inventoryName, page);
      await deleteWorkflowJobTemplate(workflowJobTemplate, page);
    }
  );

  //Unskip this test when https://issues.redhat.com/browse/AAP-42422 is fixed
  test.skip(
    'Can access an existing workflow visualizer and delete the link between two nodes',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const projectOneName = createE2EName();
      const projectOne = await createAwxProject({ projectName: projectOneName }, page);
      const projectTwo = await createAwxProject({}, page);
      const wfJobTemplate = await createWorkflowJobTemplate(page);
      await createVisualizerStep('Project Sync', projectOne, page);
      await expect(page.locator('[class*="action-icon__background"]').first()).toBeVisible();
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
      await expect(page.locator('[class*="action-icon__background"]').nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await toggleNodeKebab(projectOneName, page);
      await page.getByRole('menuitem', { name: 'Remove step' }).click();
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
      await page.getByRole('button', { name: 'Remove step' }).click();
      await expect(page.locator('[class*="action-icon__background"]').first()).toBeVisible();
      await removeAllWorkflowVizNodes(page);
      await deleteWorkflowJobTemplate(wfJobTemplate, page);
      await deleteAwxProject(projectTwo, page);
      await deleteAwxProject(projectOne, page);
    }
  );

  test('Should update skip tags', { tag: ['@not_mock', '@compare'] }, async ({ page }) => {
    const jtName = createE2EName();
    const inventoryName = await createInventory({}, page);
    const jobTemplate = await createJobTemplate(
      { name: jtName, skipTagsPrompt: true, inventoryName: inventoryName },
      page
    );
    const workflowJobTemplate = await createWorkflowJobTemplate(page);
    test.setTimeout(5 * 60 * 1000);
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
    await page.getByRole('button', { name: 'Legend' }).click();
    await page.getByRole('button', { name: 'Legend' }).click();
    await page.getByRole('button', { name: 'Fit to Screen' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Success alert:Successfully')).toBeVisible();
    await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
    await expect(page.locator('[class*="action-icon__background"]').first()).toBeVisible();
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
    await deleteInventory(inventoryName, page);
  });

  //Unskip this test when https://issues.redhat.com/browse/AAP-42422 is fixed
  test.skip(
    'Should display the saved extra_vars, execution_env, inv. group in the Edit node prompt step',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const jobTemplateName = createE2EName();
      const inventoryOne = await createInventory({}, page);
      const execEnvOne = await createExecutionEnvironment(page);
      const credentialOne = await createAwxCredential({}, page);
      const instanceGroup = await createInstanceGroup({}, page);
      const jobTemplate = await createJobTemplate(
        { PromptOnLaunch: true, extraVarsPrompt: true, name: jobTemplateName },
        page
      );
      const wfJobTemplate = await createWorkflowJobTemplate(page);
      //Add step
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(jobTemplate);
      await page.getByRole('option', { name: jobTemplateName }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });
      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Inventory' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(inventoryOne);
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
      await page.getByRole('textbox', { name: 'Editor content' }).fill('var: test');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      // Edit step and select a different execution env.
      await toggleNodeKebab(jobTemplateName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Next' }).click({ force: true });
      await page.getByRole('button', { name: 'Prompts' }).click();
      await expect(page.getByRole('button', { name: 'Execution environment' })).toContainText(
        execEnvOne
      );
      await expect(page.getByRole('button', { name: 'Instance groups' })).toContainText(
        instanceGroup
      );
      await expect(
        page.getByRole('code').locator('div').filter({ hasText: 'var: test' }).nth(4)
      ).toBeVisible();
      await page.getByRole('textbox', { name: 'Editor content' }).fill('newvar: newtest');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Legend' }).click();
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      // Check the new variables were saved
      await toggleNodeKebab(jobTemplateName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Next' }).click({ force: true });
      await page.getByRole('button', { name: 'Prompts' }).click();
      await expect(
        page.getByRole('code').locator('div').filter({ hasText: 'newvar: newtest' }).nth(4)
      ).toBeVisible();
      //cleanup
      await removeAllWorkflowVizNodes(page);
      await deleteJobTemplate(jobTemplate, page);
      await deleteWorkflowJobTemplate(wfJobTemplate, page);
      await deleteAwxCredential(credentialOne, page);
      await deleteExecutionEnvironment(execEnvOne, page);
      await deleteInstanceGroup(instanceGroup, page);
      await deleteInventory(inventoryOne, page);
    }
  );

  test(
    'Create a job template node using a JT with a survey enabled',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const inventoryName = await createInventory({}, page);
      const jobTemplateName = createE2EName();
      const jobTemplate = await createJobTemplate(
        { survey: true, name: jobTemplateName, inventoryName: inventoryName },
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
      await expect(page.getByRole('listitem').filter({ hasText: 'Survey' })).toBeVisible();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('textbox', { name: 'Question' }).click();
      await page.getByRole('textbox', { name: 'Question' }).fill('Answer1');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      //cleanup
      await removeAllWorkflowVizNodes(page);
      await deleteJobTemplate(jobTemplate, page);
      await deleteWorkflowJobTemplate(wfJobTemplate, page);
      await deleteInventory(inventoryName, page);
    }
  );
});
