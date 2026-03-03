import type { Inventory as InventoryType } from '@ansible/awx-ui/interfaces/Inventory';
import type { InventorySource } from '@ansible/awx-ui/interfaces/InventorySource';
import type { JobTemplate as JobTemplateType } from '@ansible/awx-ui/interfaces/JobTemplate';
import type { Project as ProjectType } from '@ansible/awx-ui/interfaces/Project';
import type { WorkflowJobTemplate as WorkflowJobTemplateType } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';
import type { WorkflowNode } from '@ansible/awx-ui/interfaces/WorkflowNode';
import { awxAPI } from '@ansible/playwright/commands/apiClient';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  Inventory,
  JobTemplate,
  Organization,
  Project,
  WorkflowJobTemplate,
  WorkflowVisualizer,
} from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);

test.describe('Workflow Visualizer - Job Output', () => {
  let organization: { id: number; name: string };
  let project: ProjectType;
  let inventory: InventoryType;
  let inventorySource: InventorySource;
  let jobTemplate: JobTemplateType;
  let workflowJobTemplate: WorkflowJobTemplateType;
  let projectNode: WorkflowNode;
  let jobTemplateNode: WorkflowNode;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(5 * 60 * 1000);

    // Create organization via API
    const org = await Organization.api.create(page, {
      name: createE2EName('wfviz-org'),
    });
    organization = { id: org.id, name: org.name };

    // Create inventory via API
    inventory = await Inventory.api.create(page, {
      name: createE2EName('wfviz-inv'),
      organization: organization.id,
    });

    // Create project via API
    project = await Project.api.create(page, {
      name: createE2EName('wfviz-proj'),
      organization: organization.id,
      scm_type: 'git',
      scm_url: 'https://github.com/ansible/ansible-tower-samples',
    });

    // Sync the project
    await Project.api.sync(page, project.id);

    // Create inventory source via API
    inventorySource = await Inventory.api.createSource(page, inventory.id, {
      name: createE2EName('wfviz-inv-src'),
      source: 'scm',
      sourceProject: project.id,
      sourcePath: 'inventories/inventory.ini',
    });

    // Create job template via API
    jobTemplate = await JobTemplate.api.create(page, {
      name: createE2EName('wfviz-jt'),
      inventoryId: inventory.id,
      projectId: project.id,
      playbook: 'hello_world.yml',
    });

    // Create workflow job template via API
    workflowJobTemplate = await WorkflowJobTemplate.api.create(page, {
      name: createE2EName('wfviz-wfjt'),
    });

    // Create workflow nodes via API
    projectNode = await WorkflowVisualizer.api.createNode(page, workflowJobTemplate.id, {
      unifiedJobTemplate: project.id,
    });

    jobTemplateNode = await WorkflowVisualizer.api.createNode(page, workflowJobTemplate.id, {
      unifiedJobTemplate: jobTemplate.id,
    });

    // Create link between nodes (success link)
    await WorkflowVisualizer.api.createLink({
      sourceId: projectNode.id,
      targetId: jobTemplateNode.id,
      type: 'success',
      page,
    });
  });

  test.afterEach(async ({ page }) => {
    // Cleanup resources in reverse order of creation
    // Note: Some deletions may fail with 409 if resources have active jobs
    // We catch and ignore those errors to allow test cleanup to continue
    if (workflowJobTemplate?.id) {
      try {
        await WorkflowJobTemplate.api.delete(page, workflowJobTemplate.id);
      } catch (error) {
        // Ignore 409 errors (resource in use) during cleanup
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('409')) {
          throw error;
        }
      }
    }
    if (inventorySource?.id) {
      try {
        await awxAPI.delete(page, `inventory_sources/${inventorySource.id}/`, {
          expectStatus: 204,
        });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    if (jobTemplate?.id) {
      try {
        await JobTemplate.api.delete(page, jobTemplate.id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    if (inventory?.id) {
      try {
        await Inventory.api.delete(page, inventory.id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    if (project?.id) {
      try {
        await Project.api.delete(page, project.id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    if (organization?.id) {
      try {
        await Organization.api.delete(page, organization.id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  test(
    'should launch a workflow job template from the templates list and navigate to the output page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await test.step('Navigate to templates and filter for workflow job template', async () => {
        await navigateTo(page, 'Automation Execution', 'Templates');
        await expect(
          page.getByRole('heading', { name: 'Automation Templates', exact: true })
        ).toBeVisible();
        await filterTable({ filterLabel: 'Name', filterValue: workflowJobTemplate.name }, page);
      });

      await test.step('Launch workflow job template from row action', async () => {
        const launchResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes(`/workflow_job_templates/${workflowJobTemplate.id}/launch/`) &&
            response.status() === 201
        );

        await clickTableRowAction(
          {
            text: workflowJobTemplate.name,
            action: 'Launch template',
          },
          page
        );

        const launchResponse = await launchResponsePromise;
        const workflowJob = (await launchResponse.json()) as { id: number };

        await test.step('Verify navigation to output page', async () => {
          await expect(page).toHaveURL(new RegExp(`/jobs/workflow/${workflowJob.id}/output`), {
            timeout: 10000,
          });
        });
      });
    }
  );

  test(
    'should configure prompt-on-launch values of a node, launch the job, and view the output screen',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await test.step('Enable ask_variables_on_launch for job template', async () => {
        await awxAPI.patch(page, `job_templates/${jobTemplate.id}/`, {
          ask_variables_on_launch: true,
        });
      });

      await test.step('Navigate to workflow visualizer', async () => {
        await navigateTo(page, 'Automation Execution', 'Templates');
        await filterTable({ filterLabel: 'Name', filterValue: workflowJobTemplate.name }, page);

        await clickTableRowAction(
          {
            text: workflowJobTemplate.name,
            action: 'View workflow visualizer',
          },
          page
        );

        await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible();
        await expect(page.getByTestId('wf-vzr-name')).toContainText(workflowJobTemplate.name);
      });

      await test.step('Fit to screen and zoom out for better visibility', async () => {
        await page.getByRole('button', { name: 'Fit to Screen' }).click();
        await page.getByRole('button', { name: 'Zoom out' }).click();
      });

      await test.step('Edit job template node to add extra variables', async () => {
        // Click the node action icon
        await page.locator(`g[data-id="${jobTemplateNode.id}"]`).hover();
        await page
          .locator(`g[data-id="${jobTemplateNode.id}"] .pf-topology__node__action-icon`)
          .click({ force: true });

        await page.getByRole('menuitem', { name: 'Edit step' }).click();
        await expect(page.getByText('Edit step')).toBeVisible();

        // Re-select the job template to access prompts
        await page.getByLabel('Job template').click();
        await page.getByRole('textbox', { name: 'Search input' }).fill(jobTemplate.name);
        await page.getByRole('option', { name: jobTemplate.name }).click();

        await expect(page.getByText('Prompts')).toBeVisible();
        await page.getByRole('button', { name: 'Next' }).click();

        // Add extra variables
        await page.getByRole('textbox', { name: 'Editor content' }).fill('foo: bar');
        await page.getByRole('button', { name: 'Next' }).click();

        // Verify extra vars are shown in review step
        await expect(page.getByText('foo: bar')).toBeVisible();
        await page.getByTestId('wizard-next').click();

        await page.getByRole('button', { name: 'Fit to Screen' }).click();
        await page.getByRole('button', { name: 'Zoom out' }).click();
      });

      await test.step('Save the visualizer', async () => {
        await page.getByTestId('workflow-visualizer-toolbar-save').click();
        await expect(page.getByText('Success alert:Successfully')).toBeVisible();
        await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();
      });

      await test.step('Launch workflow from visualizer kebab menu', async () => {
        await page.getByTestId('workflow-visualizer-toolbar-kebab').click();

        const launchResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes(`/workflow_job_templates/${workflowJobTemplate.id}/launch/`) &&
            response.status() === 201
        );

        await page.getByTestId('launch-workflow-button').click();

        const launchResponse = await launchResponsePromise;
        const workflowJob = (await launchResponse.json()) as { id: number; status: string };

        await test.step('Verify navigation to output page', async () => {
          await expect(page).toHaveURL(new RegExp('/output'), { timeout: 10000 });
          // The "Running" status may not be visible if the job completes quickly
        });

        await test.step('Wait for workflow job to complete', async () => {
          await WorkflowJobTemplate.ui.waitForJobStatus(page, workflowJob.id, 'successful');

          await page.getByRole('button', { name: 'Fit to Screen' }).click();
          await page.getByRole('button', { name: 'Zoom out' }).click();

          // Verify both nodes are visible
          await expect(
            page.locator('g[class*="node-label"]').getByText(jobTemplate.name)
          ).toBeVisible();
          await expect(
            page.locator('g[class*="node-label"]').getByText(project.name)
          ).toBeVisible();
          await expect(page.getByTestId('success-status')).toContainText('Success');
        });
      });
    }
  );

  test(
    'should view the details pages of related jobs on a workflow either by clicking job nodes or toggling the workflow jobs dropdown',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await test.step('Navigate to workflow job template details', async () => {
        await navigateTo(page, 'Automation Execution', 'Templates');
        await filterTable({ filterLabel: 'Name', filterValue: workflowJobTemplate.name }, page);

        await page
          .getByRole('row', { name: workflowJobTemplate.name })
          .getByRole('link', { name: workflowJobTemplate.name })
          .click();

        await page.getByRole('link', { name: 'View workflow visualizer' }).click();
        await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible();
      });

      await test.step('Launch workflow from visualizer', async () => {
        await page.getByTestId('workflow-visualizer-toolbar-kebab').click();

        const launchResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes(`/workflow_job_templates/${workflowJobTemplate.id}/launch/`) &&
            response.status() === 201
        );

        await page.getByRole('button', { name: 'Launch' }).click();

        const launchResponse = await launchResponsePromise;
        const workflowJob = (await launchResponse.json()) as { id: number; name: string };

        await test.step('Verify navigation to output page and wait for completion', async () => {
          await expect(page).toHaveURL(new RegExp(`/jobs/workflow/${workflowJob.id}/output`), {
            timeout: 10000,
          });
          await expect(page.getByTestId('page-title')).toContainText(workflowJob.name);

          await WorkflowJobTemplate.ui.waitForJobStatus(page, workflowJob.id, 'successful');

          await page.getByRole('button', { name: 'Fit to Screen' }).click();
          await page.getByRole('button', { name: 'Zoom out' }).click();
        });

        await test.step('Click on project node to view details', async () => {
          await page.locator('g').getByText(project.name).click({ force: true });
          await expect(page.getByTestId(project.name)).toBeVisible();
          await expect(page.getByTestId('Output')).toBeVisible();
        });

        await test.step('Relaunch workflow from jobs list', async () => {
          await navigateTo(page, 'Automation Execution', 'Jobs');
          await expect(page.getByRole('heading', { name: 'Jobs', exact: true })).toBeVisible();

          await filterTable({ filterLabel: 'ID', filterValue: workflowJob.id.toString() }, page);

          const relaunchResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes(`/workflow_jobs/${workflowJob.id}/relaunch/`) &&
              response.status() === 201
          );

          await clickTableRowAction(
            {
              text: workflowJob.name,
              action: 'Relaunch job',
            },
            page
          );

          const relaunchResponse = await relaunchResponsePromise;
          const relaunchedJob = (await relaunchResponse.json()) as { id: number; name: string };

          await test.step('Verify relaunched workflow output page', async () => {
            await expect(page.getByTestId('page-title')).toContainText(workflowJobTemplate.name);
            await expect(page.getByText(jobTemplate.name)).toBeVisible();
            await expect(page.getByTestId('relaunch-job')).toBeVisible();

            // Wait for nodes to load
            const nodesResponse = await page.waitForResponse((response) =>
              response.url().includes(`/workflow_jobs/${relaunchedJob.id}/workflow_nodes/`)
            );

            const nodesData = (await nodesResponse.json()) as { results: WorkflowNode[] };
            const successfulNode = nodesData.results.find((node) => node.id);

            if (successfulNode) {
              await expect(
                page.locator(`g[data-id="${successfulNode.id}"]`).getByTestId('successful-icon')
              ).toBeVisible({ timeout: 60000 });
            }

            await page.getByRole('button', { name: 'Fit to Screen' }).click();
            await page.getByRole('button', { name: 'Zoom out' }).click();
            await page.getByRole('button', { name: 'Zoom out' }).click();

            // Click on project node within the graph
            await page
              .locator('g[data-id]')
              .filter({ hasText: project.name })
              .getByText(project.name)
              .click({ force: true });

            await expect(page.getByTestId(project.name)).toBeVisible();
            await expect(page.getByTestId('Output')).toBeVisible();
          });
        });
      });
    }
  );
});
