import { expect, test, Page } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { Organization, Inventory, JobTemplate, InventoryHost, Project } from '@ansible/playwright/utils';
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
    hasText: /^\d+$/
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
  console.log('Triggering data collection...');
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
  console.log(`Data collection task scheduled (ID: ${taskId}, Message: ${scheduleResponse.message})`);

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
      console.log(`Data collection completed after ${attempt} polls`);
      return { taskId, status };
    }

    if (status === 'failed' || status === 'error') {
      throw new Error(`Data collection task ${taskId} failed with status: ${status}`);
    }

    await page.waitForTimeout(pollInterval);

    const taskData = await metricsAPI.get<{ id: number; status: string }>(
      page,
      `tasks/${taskId}/`
    );

    if (!taskData) {
      throw new Error('Failed to get task status: API returned null');
    }

    status = taskData.status;
    console.log(`  Task ${taskId} status: ${status} (attempt ${attempt + 1}/${maxAttempts})`);
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
      console.log(`Created organization: ${organization.name} (ID: ${organizationId})`);

      // Create project with a known name for dashboard verification (includes random suffix)
      projectName = createE2EName('E2E-Dashboard-Project');
      const project = await Project.api.create(page, {
        name: projectName,
        organization: organizationId,
        scm_type: 'git',
        scm_url: 'https://github.com/ansible/ansible-tower-samples'
      });
      projectId = project.id;
      console.log(`Created project: ${projectName} (ID: ${projectId})`);

      // Wait for project sync to complete
      await Project.api.sync(page, projectId);
      console.log(`Project synced successfully`);

      // Create inventory
      const inventory = await Inventory.api.create(page, { organization: organizationId });
      inventoryId = inventory.id;
      console.log(`Created inventory: ${inventory.name} (ID: ${inventoryId})`);

      // Create host (localhost) in inventory with local connection (no SSH)
      const host = await InventoryHost.api.create(page, {
        name: 'localhost',
        inventory: inventoryId,
        variables: 'ansible_connection: local'
      });
      hostId = host.id;
      console.log(`Created host: ${host.name} (ID: ${hostId}) with ansible_connection=local`);

      // Create job template using our project
      const jobTemplate = await JobTemplate.api.create(page, {
        inventoryId,
        projectId
      });
      jobTemplateId = jobTemplate.id;
      console.log(`Created job template: ${jobTemplate.name} (ID: ${jobTemplateId})`);
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
      console.log(`Initial jobs count (API): ${initialAwxCount}`);

      await navigateTo(page, 'Automation Analytics', 'Automation Dashboard');
      // Get initial successful jobs count from dashboard UI
      const initialSuccessfulCount = await getSuccessfulJobsCountFromDashboard(page);
      console.log(`Initial successful jobs count (Dashboard UI): ${initialSuccessfulCount}`);

      // Launch job template
      console.log('Launching job template...');
      const job = await JobTemplate.api.launch(page, jobTemplateId);
      console.log(`Job completed with status: ${job.status} (ID: ${job.id})`);

      // Get final jobs count
      const finalAwxJobs = await awxAPI.get<{ count: number; results: unknown[] }>(page, 'jobs/');
      const finalAwxCount = finalAwxJobs?.count || 0;
      console.log(`Final jobs count: ${finalAwxCount}`);
      console.log(`Jobs created: ${finalAwxCount - initialAwxCount}`);
      // Verify at least one job was created
      expect(finalAwxCount).toEqual(initialAwxCount + 1);

      // Trigger initial data collection and wait for completion
      console.log('\n=== Triggering collect_dashboard_reports_initial_data ===');
      const initialDataResult = await triggerAndWaitForDataCollection(page, {
        functionName: 'collect_dashboard_reports_initial_data'
      });
      console.log(`Initial data collection completed: task ${initialDataResult.taskId}`);

      // Full page reload to completely clear SWR cache and all browser state
      // 3000 ms wait should be enough to ensure SWR cache is cleared,
      // but somehow it was not always sufficient.
      console.log('\n=== Full page reload to clear all caches ===');
      await page.reload({ waitUntil: 'networkidle' });
      console.log('Page reloaded - all SWR cache and state cleared');

      // Wait for the top projects card to be visible
      const topProjectsCard = page.getByTestId('top-projects-card');
      await expect(topProjectsCard).toBeVisible();

      // Verify successful jobs count increased on dashboard UI
      const finalSuccessfulCount = await getSuccessfulJobsCountFromDashboard(page);
      console.log(`Final successful jobs count (Dashboard UI): ${finalSuccessfulCount}`);
      console.log(`Expected: ${initialSuccessfulCount + 1}, Got: ${finalSuccessfulCount}`);
      expect(finalSuccessfulCount).toBeGreaterThanOrEqual(initialSuccessfulCount + 1);

      // Verify our specific project appears in the project list
      console.log('\n=== Verifying project appears in Top 5 projects ===');
      const projectNameCells = topProjectsCard.locator('[data-testid="project-name-column-cell"]');
      await expect(projectNameCells).toContainText([projectName]);
      console.log(`✓ Verified "${projectName}" appears in Top 5 projects`);
    });
  });

});
