import {
  Credential,
  Inventory,
  InventoryGroup,
  InventoryHost,
  JobTemplate,
  Organization,
  Project,
} from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../../../../commands/clickTableRow';
import { createE2EName } from '../../../../../../commands/createE2EName';
import { getTableRow } from '../../../../../../commands/getTableRow';
import { navigateTo } from '../../../../../../commands/navigateTo';
import { runAdHocCommandWizard } from '../../../../../../commands/runAdHocCommandWizard';
import { setupAfter, setupBefore } from '../../../../../../commands/setup';
import { waitForJobStatus } from '../../../../../../commands/waitForJobStatus';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test.describe('Inventory Host - Constructed Inventory Tests', () => {
  test(
    'should run ad-hoc command against inventory hosts tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      // Create API resources first (before any UI navigation)
      const organization = await Organization.api.create(page);
      const regularInventory = await Inventory.api.create(page, {
        name: createE2EName('inventory'),
        organization: organization.id,
      });
      const host = await InventoryHost.api.create(page, { inventory: regularInventory.id });
      const constructedInventory = await Inventory.api.createConstructed(page, {
        organization: organization.id,
      });
      await Inventory.api.addInputInventory(page, constructedInventory.id, regularInventory.id);

      // Create credential via UI (needs navigation)
      const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

      try {
        // Navigate to constructed inventory details page
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: constructedInventory.name }, page);
        await expect(
          page.getByRole('heading', { name: constructedInventory.name, exact: true })
        ).toBeVisible();

        // Sync the constructed inventory
        const syncResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/inventory_sources/') &&
            response.url().includes('/update/') &&
            response.request().method() === 'POST' &&
            response.status() === 202
        );

        await page.getByRole('button', { name: 'Sync inventory' }).click();
        const syncResponse = await syncResponsePromise;
        const inventoryUpdate = (await syncResponse.json()) as { id: number };

        // Wait for sync to complete using API polling
        await waitForJobStatus(
          {
            jobType: 'inventory_updates',
            jobId: inventoryUpdate.id,
            desiredStatus: 'successful',
            timeout: 60000,
          },
          page
        );

        // Navigate to Hosts tab
        await page.getByRole('tab', { name: 'Hosts' }).click();

        // Wait for host to appear (sometimes takes a moment after sync)
        await expect(page.locator('tbody')).toContainText(host.name, { timeout: 15000 });

        // Click Run command button
        await page.getByRole('button', { name: 'Run command', exact: true }).click();

        // Run ad-hoc command wizard using default execution environment
        await runAdHocCommandWizard(
          {
            module: 'shell',
            moduleArgs: 'echo "Hello World"',
            verbosity: '0',
            limit: 'all',
            forks: 2,
            showChanges: true,
            becomeEnabled: true,
            executionEnvironmentName: 'Control Plane Execution',
            credentialName,
          },
          page
        );
      } finally {
        // Cleanup using utilities
        await Inventory.api.delete(page, constructedInventory.id).catch(() => {});
        await Credential.api.deleteByName(page, credentialName);
        await Organization.api.deleteByName(page, organization.name);
      }
    }
  );

  test(
    'should run ad-hoc command from groups tab on constructed inventory',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      const groupName = createE2EName('group');

      // Create API resources first (before any UI navigation)
      const organization = await Organization.api.create(page);
      const regularInventory = await Inventory.api.create(page, {
        name: createE2EName('inventory'),
        organization: organization.id,
      });
      const group = await InventoryGroup.api.create(page, {
        name: groupName,
        inventory: regularInventory.id,
      });
      const host = await InventoryHost.api.create(page, { inventory: regularInventory.id });
      await InventoryGroup.api.addHost(page, group.id, host.id);
      const constructedInventory = await Inventory.api.createConstructed(page, {
        organization: organization.id,
      });
      await Inventory.api.addInputInventory(page, constructedInventory.id, regularInventory.id);

      // Create credential via UI (needs navigation)
      const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

      try {
        // Navigate to constructed inventory and sync
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: constructedInventory.name }, page);
        await expect(
          page.getByRole('heading', { name: constructedInventory.name, exact: true })
        ).toBeVisible();

        // Trigger sync
        const syncResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/inventory_sources/') &&
            response.url().includes('/update/') &&
            response.request().method() === 'POST' &&
            response.status() === 202
        );
        await page.getByRole('button', { name: 'Sync inventory' }).click();
        const syncResponse = await syncResponsePromise;
        const inventoryUpdate = (await syncResponse.json()) as { id: number };

        // Wait for sync to complete using API polling
        await waitForJobStatus(
          {
            jobType: 'inventory_updates',
            jobId: inventoryUpdate.id,
            desiredStatus: 'successful',
            timeout: 60000,
          },
          page
        );

        // Navigate to Groups tab
        await page.getByRole('tab', { name: 'Groups' }).click();

        // Wait for group to appear
        await expect(page.locator('tbody')).toContainText(groupName, { timeout: 15000 });

        // Click on the group
        await clickTableRow({ text: groupName }, page);
        await expect(page.getByRole('heading', { name: groupName, exact: true })).toBeVisible();

        // Navigate to group's Hosts tab
        await page.getByRole('tab', { name: 'Hosts' }).click();

        // Wait for host to appear
        await expect(page.locator('tbody')).toContainText(host.name, { timeout: 15000 });

        // Click Run command button
        await page.getByRole('button', { name: 'Run command', exact: true }).click();

        // Run ad-hoc command wizard using default execution environment
        await runAdHocCommandWizard(
          {
            module: 'shell',
            moduleArgs: 'echo "Hello World"',
            verbosity: '0',
            limit: 'all',
            forks: 2,
            showChanges: true,
            becomeEnabled: true,
            executionEnvironmentName: 'Control Plane Execution',
            credentialName,
          },
          page
        );
      } finally {
        // Cleanup using utilities
        await Inventory.api.delete(page, constructedInventory.id).catch(() => {});
        await Credential.api.deleteByName(page, credentialName);
        await Organization.api.deleteByName(page, organization.name);
      }
    }
  );

  test(
    'should launch job template against constructed inventory',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      // Create resources using utilities
      const organization = await Organization.api.create(page);

      const regularInventory = await Inventory.api.create(page, {
        name: createE2EName('inventory'),
        organization: organization.id,
      });

      await InventoryHost.api.create(page, { inventory: regularInventory.id });

      // Create constructed inventory
      const constructedInventory = await Inventory.api.createConstructed(page, {
        organization: organization.id,
      });

      // Add regular inventory as input to constructed inventory
      await Inventory.api.addInputInventory(page, constructedInventory.id, regularInventory.id);

      // Create project
      const projectName = await Project.ui.create(page, { organizationName: organization.name });

      // Create job template using constructed inventory
      const jobTemplateName = await JobTemplate.ui.create(page, {
        inventoryName: constructedInventory.name,
        projectName,
      });

      let jobId: number | null = null;

      try {
        // Navigate to constructed inventory and sync
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: constructedInventory.name }, page);
        await expect(
          page.getByRole('heading', { name: constructedInventory.name, exact: true })
        ).toBeVisible();

        // Trigger sync
        const syncResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/inventory_sources/') &&
            response.url().includes('/update/') &&
            response.request().method() === 'POST' &&
            response.status() === 202
        );
        await page.getByRole('button', { name: 'Sync inventory' }).click();
        const syncResponse = await syncResponsePromise;
        const inventoryUpdate = (await syncResponse.json()) as { id: number };

        // Wait for sync to complete using API polling
        await waitForJobStatus(
          {
            jobType: 'inventory_updates',
            jobId: inventoryUpdate.id,
            desiredStatus: 'successful',
            timeout: 60000,
          },
          page
        );

        // Navigate to Job Templates tab and launch the job
        await page.getByRole('tab', { name: 'Job Templates' }).click();
        const templateRow = await getTableRow(page, jobTemplateName);

        // Wait for the job launch response to capture the job ID
        const jobLaunchPromise = page.waitForResponse(
          (response) => response.url().includes('/launch/') && response.status() === 201
        );
        await templateRow.getByLabel('Launch template').click();
        const jobLaunchResponse = await jobLaunchPromise;
        const jobData = (await jobLaunchResponse.json()) as { id: number };
        jobId = jobData.id;

        // Verify job launched successfully
        await expect(page.getByRole('heading', { name: jobTemplateName }).first()).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Output' })).toBeVisible();
      } finally {
        // Cancel the job if it's still running to allow cleanup
        if (jobId) {
          await JobTemplate.api.cancelJob(page, jobId);
        }

        // Cleanup using utilities
        await JobTemplate.api.deleteByName(page, jobTemplateName);
        await Project.api.deleteByName(page, projectName);
        await Inventory.api.delete(page, constructedInventory.id).catch(() => {});
        await Organization.api.deleteByName(page, organization.name);
      }
    }
  );

  test(
    'should verify edit/delete buttons are hidden and Facts tab is visible for constructed inventory hosts',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(4 * 60 * 1000);

      // Create resources using utilities
      const organization = await Organization.api.create(page);

      const regularInventory = await Inventory.api.create(page, {
        name: createE2EName('inventory'),
        organization: organization.id,
      });

      const host = await InventoryHost.api.create(page, { inventory: regularInventory.id });

      // Create constructed inventory
      const constructedInventory = await Inventory.api.createConstructed(page, {
        organization: organization.id,
      });

      // Add regular inventory as input to constructed inventory
      await Inventory.api.addInputInventory(page, constructedInventory.id, regularInventory.id);

      try {
        // Navigate to constructed inventory and sync
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: constructedInventory.name }, page);
        await expect(
          page.getByRole('heading', { name: constructedInventory.name, exact: true })
        ).toBeVisible();

        // Trigger sync
        const syncResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/inventory_sources/') &&
            response.url().includes('/update/') &&
            response.request().method() === 'POST' &&
            response.status() === 202
        );
        await page.getByRole('button', { name: 'Sync inventory' }).click();
        const syncResponse = await syncResponsePromise;
        const inventoryUpdate = (await syncResponse.json()) as { id: number };

        // Wait for sync to complete using API polling
        await waitForJobStatus(
          {
            jobType: 'inventory_updates',
            jobId: inventoryUpdate.id,
            desiredStatus: 'successful',
            timeout: 60000,
          },
          page
        );

        // Navigate to Hosts tab
        await page.getByRole('tab', { name: 'Hosts' }).click();

        // Wait for host to appear
        await expect(page.locator('tbody')).toContainText(host.name, { timeout: 15000 });

        // Click on the host to go to details page
        await clickTableRow({ text: host.name }, page);
        await expect(page.getByRole('heading', { name: host.name, exact: true })).toBeVisible();

        // Verify edit button is not visible on host details page
        await expect(page.getByTestId('edit-host')).not.toBeVisible();

        // Navigate back to hosts list to check actions dropdown
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: constructedInventory.name }, page);
        await page.getByRole('tab', { name: 'Hosts' }).click();

        // Wait for host to appear
        await expect(page.locator('tbody')).toContainText(host.name, { timeout: 15000 });

        // Verify actions dropdown is not visible in the table row
        const hostRow = await getTableRow(page, host.name);
        await expect(hostRow.locator('[data-testid="actions-dropdown"]')).not.toBeVisible();

        // Go back to host details to check Facts tab
        await clickTableRow({ text: host.name }, page);
        await expect(page.getByRole('heading', { name: host.name, exact: true })).toBeVisible();

        // Verify Facts tab is visible for constructed inventory hosts
        await expect(page.getByRole('tab', { name: 'Facts' })).toBeVisible();
      } finally {
        // Cleanup using utilities
        await Inventory.api.delete(page, constructedInventory.id).catch(() => {});
        await Organization.api.deleteByName(page, organization.name);
      }
    }
  );
});
