import { expect, test, Page } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import {
  Organization,
  Inventory,
  JobTemplate,
  InventoryHost,
  Project,
} from '@ansible/playwright/utils';
import { awxAPI, createScopedClient } from '@ansible/playwright/commands/apiClient';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';

// Create a scoped client for the metrics API
const metricsAPI = createScopedClient('/api/metrics/v1');

/**
 * Get the "Successful jobs" count from the dashboard UI
 */
async function getSuccessfulJobsCountFromDashboard(page: Page): Promise<number> {
  // Wait for the card to be visible
  const successfulJobsCard = page.getByTestId('successful-jobs-card');
  await expect(successfulJobsCard).toBeVisible();

  // Get the value from the card body
  // The value is in a span element inside .pf-v6-c-card__body (no data-testid/data-cy on the value itself)
  const valueElement = successfulJobsCard.locator('.pf-v6-c-card__body span').filter({
    hasText: /^\d+$/,
  });

  // Wait for the value element to exist and contain a number (dashboard might still be loading data)
  await expect(valueElement).toBeVisible({ timeout: 10000 });

  const valueText = await valueElement.textContent();

  // Parse the number from the text
  const count = parseInt(valueText?.trim() || '0', 10);

  if (isNaN(count)) {
    throw new Error(`Failed to parse successful jobs count from dashboard. Text: "${valueText}"`);
  }

  return count;
}

/**
 * Helper to trigger metrics data collection and wait for completion
 */
async function triggerAndWaitForDataCollection(
  page: Page,
  options: {
    name?: string;
    functionName?: string;
    database?: string;
    maxAttempts?: number;
    pollInterval?: number;
  } = {}
): Promise<{ taskId: number; status: string }> {
  const {
    name = 'test-dashboard-e2e-data-collection',
    functionName = 'collect_dashboard_reports_initial_data',
    database = 'awx',
    maxAttempts = 60,
    pollInterval = 2000,
  } = options;

  // Trigger data collection
  const scheduleResponse = await metricsAPI.post<{ task_id: string; message: string }>(
    page,
    'tasks/schedule_immediate/',
    {
      name,
      function_name: functionName,
      task_data: { database },
    },
    { expectStatus: 200 }
  );

  if (!scheduleResponse) {
    throw new Error('Failed to schedule data collection: API returned null');
  }

  const taskId = parseInt(scheduleResponse.task_id, 10);

  // Get initial task status
  const initialTask = await metricsAPI.get<{ id: number; status: string }>(
    page,
    `tasks/${taskId}/`
  );

  if (!initialTask) {
    throw new Error('Failed to get initial task status: API returned null');
  }

  // Poll for completion
  let status = initialTask.status;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (status === 'completed') {
      return { taskId, status };
    }

    if (status === 'failed' || status === 'error') {
      throw new Error(`Data collection task ${taskId} failed with status: ${status}`);
    }

    await page.waitForTimeout(pollInterval); // NOSONAR - intentional polling interval for task status check

    const taskData = await metricsAPI.get<{ id: number; status: string }>(page, `tasks/${taskId}/`);

    if (!taskData) {
      throw new Error('Failed to get task status: API returned null');
    }

    status = taskData.status;
  }

  throw new Error(
    `Data collection task ${taskId} did not complete within ${maxAttempts * pollInterval}ms`
  );
}

test.beforeEach(async ({ page }) => {
  await setupBefore()({ page });
  await navigateTo(page, 'Automation Analytics', 'Automation Dashboard');
});

test.afterEach(setupAfter);

test.describe('Automation Dashboard', () => {
  test('Automation dashboard view for System Administrator', async ({ page }) => {
    await expect(
      page.getByTestId('page-title').filter({ hasText: 'Automation Dashboard' })
    ).toBeVisible();
  });

  test.describe('Check jobs count - create and run job', () => {
    let organizationId: number;
    let projectId: number;
    let projectName: string;
    let inventoryId: number;
    let hostId: number;
    let jobTemplateId: number;

    test.beforeEach(async ({ page }) => {
      // Create organization
      const organization = await Organization.api.create(page);
      organizationId = organization.id;

      // Create project with a known name for dashboard verification (includes random suffix)
      projectName = createE2EName('E2E-Dashboard-Project');
      const project = await Project.api.create(page, {
        name: projectName,
        organization: organizationId,
        scm_type: 'git',
        scm_url: 'https://github.com/ansible/ansible-tower-samples',
      });
      projectId = project.id;

      // Wait for project sync to complete
      await Project.api.sync(page, projectId);

      // Create inventory
      const inventory = await Inventory.api.create(page, { organization: organizationId });
      inventoryId = inventory.id;

      // Create host (localhost) in inventory with local connection (no SSH)
      const host = await InventoryHost.api.create(page, {
        name: 'localhost',
        inventory: inventoryId,
        variables: 'ansible_connection: local',
      });
      hostId = host.id;

      // Create job template using our project
      const jobTemplate = await JobTemplate.api.create(page, {
        inventoryId,
        projectId,
      });
      jobTemplateId = jobTemplate.id;
    });

    test.afterEach(async ({ page }) => {
      // Cleanup in reverse order
      if (jobTemplateId) {
        await JobTemplate.api.delete(page, jobTemplateId).catch(() => {});
      }
      if (hostId) {
        await InventoryHost.api.delete(page, hostId).catch(() => {});
      }
      if (inventoryId) {
        await Inventory.api.delete(page, inventoryId).catch(() => {});
      }
      if (projectId) {
        await Project.api.delete(page, projectId).catch(() => {});
      }
      if (organizationId) {
        await Organization.api.delete(page, organizationId).catch(() => {});
      }
    });

    test('should increase successful jobs count after running job template', async ({ page }) => {
      // Set timeout to 2 minutes for this test (job execution + data collection task)
      test.setTimeout(2 * 60 * 1000);

      // Get initial jobs count from awx/controller API
      const initialAwxJobs = await awxAPI.get<{ count: number; results: unknown[] }>(page, 'jobs/');
      const initialAwxCount = initialAwxJobs?.count || 0;

      await navigateTo(page, 'Automation Analytics', 'Automation Dashboard');
      // Get initial successful jobs count from dashboard UI
      const initialSuccessfulCount = await getSuccessfulJobsCountFromDashboard(page);

      await test.step('Launch job template and verify success', async () => {
        // Launch job template and wait for completion
        const job = await JobTemplate.api.launch(page, jobTemplateId);
        // Verify the job completed successfully
        expect(job.status).toBe('successful');

        // Get final jobs count
        const finalAwxJobs = await awxAPI.get<{ count: number; results: unknown[] }>(page, 'jobs/');
        const finalAwxCount = finalAwxJobs?.count || 0;
        // Verify at least one job was created
        expect(finalAwxCount).toEqual(initialAwxCount + 1);
      });

      await test.step('Trigger initial data collection and wait for completion', async () => {
        await triggerAndWaitForDataCollection(page, {
          functionName: 'collect_dashboard_reports_initial_data',
        });
      });

      // Full page reload to completely clear SWR cache and all browser state
      // 3000 ms wait should be enough to ensure SWR cache is cleared,
      // but somehow it was not always sufficient.
      await page.reload({ waitUntil: 'networkidle' });

      // Wait for the top projects card to be visible
      const topProjectsCard = page.getByTestId('top-projects-card');
      await expect(topProjectsCard).toBeVisible();

      // Verify successful jobs count increased on dashboard UI
      const finalSuccessfulCount = await getSuccessfulJobsCountFromDashboard(page);
      expect(finalSuccessfulCount).toBeGreaterThanOrEqual(initialSuccessfulCount + 1);

      // Verify our specific project appears in the project list
      const projectNameCells = topProjectsCard.locator('[data-testid="project-name-column-cell"]');
      await expect(projectNameCells).toContainText([projectName]);
    });
  });
});
