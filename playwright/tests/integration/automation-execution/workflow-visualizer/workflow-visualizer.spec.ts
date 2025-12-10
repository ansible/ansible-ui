import { expect, test } from '@playwright/test';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { toggleNodeKebab } from '@ansible/playwright/commands/toggleNodeKebab';
import {
  Organization,
  Credential,
  ExecutionEnvironment,
  InstanceGroup,
  Inventory,
  Project,
  JobTemplate,
  WorkflowVisualizer,
} from '@ansible/playwright/utils';

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
      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Navigate to the visualizer
      await WorkflowVisualizer.ui.navigateToVisualizer(page, wfjt);

      // Verify the visualizer loads correctly
      await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add step' }).first()).toBeVisible();

      // Clean up
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
    }
  );

  test(
    'Workflow Viz Add Nodes: Should create a workflow job template and then navigate to the visualizer, and then navigate to the details view after clicking cancel',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const wfJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
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
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfJobTemplate);
    }
  );

  //Unskip this test when https://issues.redhat.com/browse/AAP-42422 is fixed
  test.skip(
    'Adds a new Job Template node linked to an existing node with on-success status, save the visualizer, then remove all nodes',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const projectName = createE2EName();
      const project = await Project.ui.create(page, { projectName, organizationName: 'Default' });
      const jobTemplate = await JobTemplate.ui.create(page);
      const workflowJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
      await WorkflowVisualizer.ui.createVisualizerStep(page, 'Project Sync', project);
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
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, workflowJobTemplate);
      await JobTemplate.ui.delete(page, jobTemplate);
      await Project.ui.delete(page, project);
    }
  );

  test(
    'Can edit a node resource on a workflow visualizer already containing existing nodes',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const projectOneName = createE2EName();
      const projectOne = await Project.ui.create(page, {
        projectName: projectOneName,
        organizationName: 'Default',
      });
      const projectTwo = await Project.ui.create(page, { organizationName: 'Default' });
      const wfJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
      await WorkflowVisualizer.ui.createVisualizerStep(page, 'Project Sync', projectOne);
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
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfJobTemplate);
      await Project.ui.delete(page, projectTwo);
      await Project.ui.delete(page, projectOne);
    }
  );

  test(
    'Click on edge context menu option to change link type and close visualizer to show unsaved changes modal',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const jobTemplateName = createE2EName();
      const projectName = createE2EName();
      const project = await Project.ui.create(page, { projectName, organizationName: 'Default' });
      const inventoryName = await Inventory.ui.create(page);
      const jobTemplate = await JobTemplate.ui.create(page, {
        name: jobTemplateName,
        inventoryName,
      });
      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
      await WorkflowVisualizer.ui.createVisualizerStep(page, 'Project Sync', project);
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
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await JobTemplate.ui.delete(page, jobTemplate);
      await Project.ui.delete(page, project);
      await Inventory.ui.delete(page, inventoryName);
    }
  );

  //Unskip this test when https://issues.redhat.com/browse/AAP-42422 is fixed
  test.skip(
    'Create a job template node using a JT with multiple dependencies and then edit the node to use a different resource',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const jobTemplateName = createE2EName();
      const inventoryOne = await Inventory.ui.create(page);
      const execEnvOne = await ExecutionEnvironment.ui.create(page);
      const execEnvTwo = await ExecutionEnvironment.ui.create(page);
      const credentialOne = await Credential.ui.create(page);
      const instanceGroup = await InstanceGroup.ui.create(page);
      const jobTemplate = await JobTemplate.ui.create(page, {
        PromptOnLaunch: true,
        name: jobTemplateName,
      });
      const wfJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
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
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await JobTemplate.ui.delete(page, jobTemplate);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfJobTemplate);
      await Credential.ui.delete(page, credentialOne);
      await ExecutionEnvironment.ui.delete(page, execEnvOne);
      await ExecutionEnvironment.ui.delete(page, execEnvTwo);
      await InstanceGroup.ui.delete(page, instanceGroup);
      await Inventory.ui.delete(page, inventoryOne);
    }
  );

  test(
    'Can manually delete all nodes, save the visualizer, then add new nodes, and successfully save again.',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const projectOneName = createE2EName();
      const projectTwoName = createE2EName();
      const projectOne = await Project.ui.create(page, {
        projectName: projectOneName,
        organizationName: 'Default',
      });
      const projectTwo = await Project.ui.create(page, {
        projectName: projectTwoName,
        organizationName: 'Default',
      });
      const wfJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
      await WorkflowVisualizer.ui.createVisualizerStep(page, 'Project Sync', projectOne);
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
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfJobTemplate);
      await Project.ui.delete(page, projectTwo);
      await Project.ui.delete(page, projectOne);
    }
  );

  test(
    'Can remove all existing nodes on a visualizer using the button in the toolbar kebab, save the visualizer, then add 2 new nodes and save the visualizer again',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const projectName = createE2EName();
      const project = await Project.ui.create(page, { projectName, organizationName: 'Default' });
      const inventoryName = await Inventory.ui.create(page);
      const jobTemplate = await JobTemplate.ui.create(page, { inventoryName });
      const workflowJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
      await WorkflowVisualizer.ui.createVisualizerStep(page, 'Project Sync', project);
      await page.getByRole('button', { name: 'Fit to Screen' }).click();

      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.navigateToVisualizer(page, workflowJobTemplate);
      await WorkflowVisualizer.ui.createVisualizerStep(page, 'Project Sync', project);
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
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, workflowJobTemplate);
      await JobTemplate.ui.delete(page, jobTemplate);
      await Project.ui.delete(page, project);
      await Inventory.ui.delete(page, inventoryName);
    }
  );

  test(
    'Can delete one single node and save the visualizer',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const sourceName = createE2EName();
      const organizationName = await Organization.ui.create(page);
      const { inventoryName, inventorySourceName } = await Inventory.ui.createSource(page, {
        sourceName,
        organizationName,
      });
      const workflowJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
      await WorkflowVisualizer.ui.createVisualizerStep(
        page,
        'Inventory Source Sync',
        inventorySourceName
      );
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
      await Inventory.ui.deleteSource(page, inventoryName, inventorySourceName);
      await Inventory.ui.delete(page, inventoryName);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, workflowJobTemplate);
    }
  );

  //Unskip this test when https://issues.redhat.com/browse/AAP-42422 is fixed
  test.skip(
    'Can access an existing workflow visualizer and delete the link between two nodes',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const projectOneName = createE2EName();
      const projectOne = await Project.ui.create(page, {
        projectName: projectOneName,
        organizationName: 'Default',
      });
      const projectTwo = await Project.ui.create(page, { organizationName: 'Default' });
      const wfJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
      await WorkflowVisualizer.ui.createVisualizerStep(page, 'Project Sync', projectOne);
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
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfJobTemplate);
      await Project.ui.delete(page, projectTwo);
      await Project.ui.delete(page, projectOne);
    }
  );

  test('Should update skip tags', { tag: ['@not_mock', '@compare'] }, async ({ page }) => {
    const jtName = createE2EName();
    const inventoryName = await Inventory.ui.create(page);
    const jobTemplate = await JobTemplate.ui.create(page, {
      name: jtName,
      skipTagsPrompt: true,
      inventoryName,
    });
    const workflowJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
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
    await JobTemplate.ui.delete(page, jobTemplate);
    await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, workflowJobTemplate);
    await Inventory.ui.delete(page, inventoryName);
  });

  //Unskip this test when https://issues.redhat.com/browse/AAP-42422 is fixed
  test.skip(
    'Should display the saved extra_vars, execution_env, inv. group in the Edit node prompt step',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const jobTemplateName = createE2EName();
      const inventoryOne = await Inventory.ui.create(page);
      const execEnvOne = await ExecutionEnvironment.ui.create(page);
      const credentialOne = await Credential.ui.create(page);
      const instanceGroup = await InstanceGroup.ui.create(page);
      const jobTemplate = await JobTemplate.ui.create(page, {
        PromptOnLaunch: true,
        extraVarsPrompt: true,
        name: jobTemplateName,
      });
      const wfJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
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
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await JobTemplate.ui.delete(page, jobTemplate);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfJobTemplate);
      await Credential.ui.delete(page, credentialOne);
      await ExecutionEnvironment.ui.delete(page, execEnvOne);
      await InstanceGroup.ui.delete(page, instanceGroup);
      await Inventory.ui.delete(page, inventoryOne);
    }
  );

  test(
    'Create a job template node using a JT with a survey enabled',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const inventoryName = await Inventory.ui.create(page);
      const jobTemplateName = createE2EName();
      const jobTemplate = await JobTemplate.ui.create(page, {
        survey: true,
        name: jobTemplateName,
        inventoryName,
      });
      const wfJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
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
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await JobTemplate.ui.delete(page, jobTemplate);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfJobTemplate);
      await Inventory.ui.delete(page, inventoryName);
    }
  );

  test(
    'Should display review step fields when adding an approval node',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const wfJobTemplate = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add an approval node
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Select Approval node type
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Approval', exact: true }).click();

      // Fill in the approval name (required field)
      await page.getByTestId('approval_name').fill('Test Approval Node');
      await page.getByTestId('approval_description').fill('Test approval description');

      await page.getByRole('button', { name: 'Next' }).click();

      // Verify that review step fields are visible
      const sidebar = page.getByTestId('workflow-topology-sidebar');
      await expect(sidebar.getByText('Name', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Description', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Timeout', { exact: true })).toBeVisible();

      await expect(page.getByTestId('wizard-next')).toBeVisible();
      await page.getByTestId('wizard-next').click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Cleanup
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfJobTemplate);
    }
  );
});
