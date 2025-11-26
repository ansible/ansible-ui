import { AwxHost } from '@ansible/awx-ui/interfaces/AwxHost';
import { ConstructedInventory, RegularInventory } from '@ansible/awx-ui/interfaces/Inventory';
import { InventoryGroup } from '@ansible/awx-ui/interfaces/InventoryGroup';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { awxAPI, gatewayAPI } from '@ansible/playwright/commands/apiClient';
import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../../../../commands/clickTableRow';
import { createE2EName } from '../../../../../../commands/createE2EName';
import { getTableRow } from '../../../../../../commands/getTableRow';
import { navigateTo } from '../../../../../../commands/navigateTo';
import { runAdHocCommandWizard } from '../../../../../../commands/runAdHocCommandWizard';
import { setupAfter, setupBefore } from '../../../../../../commands/setup';
import { waitForJobStatus } from '../../../../../../commands/waitForJobStatus';
import { createAwxProject } from '../../../projects/project-utils';
import { createJobTemplate } from '../../../templates/job-template-utils';
import { createAwxCredential } from '../../credentials/credential-utils';
import { createExecutionEnvironment } from '../../execution-environments/execution-environment-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test.describe('Inventory Host - Constructed Inventory Tests', () => {
  test(
    'should run ad-hoc command against inventory hosts tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      // Wait for login to complete before making API calls
      await page.waitForResponse(
        (response) => response.url().includes('/controller/v2/me') && response.status() === 200,
        { timeout: 10000 }
      );

      const organizationName = createE2EName('organization');
      const regularInventoryName = createE2EName('inventory');
      const constructedInventoryName = createE2EName('constructed-inventory');
      const hostName = createE2EName('host');

      const organization = await gatewayAPI.post<Organization>(page, '/organizations/', {
        name: organizationName,
      });

      let regularInventory: RegularInventory | null = null;
      let constructedInventory: ConstructedInventory | null = null;
      let executionEnvironmentName: string | null = null;
      let credentialName: string | null = null;

      try {
        // Create execution environment
        executionEnvironmentName = await createExecutionEnvironment(page, {
          organizationName,
        });

        // Create Machine credential for running ad-hoc commands
        credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);

        // Create regular inventory via AWX API
        regularInventory = await awxAPI.post<RegularInventory>(page, '/inventories/', {
          name: regularInventoryName,
          organization: organization?.id,
        });

        // Create host in regular inventory
        await awxAPI.post<AwxHost>(page, '/hosts/', {
          name: hostName,
          inventory: regularInventory!.id,
        });

        // Create constructed inventory via AWX API
        constructedInventory = await awxAPI.post<ConstructedInventory>(page, '/inventories/', {
          name: constructedInventoryName,
          organization: organization?.id,
          kind: 'constructed',
          source_vars: 'plugin: constructed',
        });

        // Add regular inventory as input to constructed inventory
        await awxAPI.post(
          page,
          `/inventories/${constructedInventory!.id}/input_inventories/`,
          { id: regularInventory!.id },
          { expectStatus: 204 }
        );

        // Navigate to constructed inventory details page
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: constructedInventoryName }, page);
        await expect(
          page.getByRole('heading', { name: constructedInventoryName, exact: true })
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
        await expect(page.locator('tbody')).toContainText(hostName, { timeout: 15000 });

        // Click Run command button
        await page.getByRole('button', { name: 'Run command', exact: true }).click();

        // Run ad-hoc command wizard
        await runAdHocCommandWizard(
          {
            module: 'shell',
            moduleArgs: 'echo "Hello World"',
            verbosity: '0',
            limit: 'all',
            forks: 2,
            showChanges: true,
            becomeEnabled: true,
            executionEnvironmentName,
            credentialName,
          },
          page
        );
      } finally {
        // Cleanup in reverse order of creation (use API to avoid navigation issues)
        if (constructedInventory?.id) {
          await awxAPI.delete(page, `/inventories/${constructedInventory.id}/`).catch(() => {});
        }
        if (regularInventory?.id) {
          await awxAPI.delete(page, `/inventories/${regularInventory.id}/`).catch(() => {});
        }
        if (credentialName) {
          // Look up credential ID by name and delete via API
          const credList = await awxAPI
            .get<{
              results: Array<{ id: number; name: string }>;
            }>(page, `/credentials/?name=${encodeURIComponent(credentialName)}`)
            .catch(() => null);
          if (credList?.results?.[0]?.id) {
            await awxAPI.delete(page, `/credentials/${credList.results[0].id}/`).catch(() => {});
          }
        }
        if (executionEnvironmentName) {
          // Look up execution environment ID by name and delete via API
          const eeList = await awxAPI
            .get<{
              results: Array<{ id: number; name: string }>;
            }>(page, `/execution_environments/?name=${executionEnvironmentName}`)
            .catch(() => null);
          if (eeList?.results?.[0]?.id) {
            await awxAPI
              .delete(page, `/execution_environments/${eeList.results[0].id}/`)
              .catch(() => {});
          }
        }
        if (organization?.id) {
          await gatewayAPI.delete(page, `/organizations/${organization.id}/`).catch(() => {});
        }
      }
    }
  );

  test(
    'should run ad-hoc command from groups tab on constructed inventory',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      // Wait for login to complete before making API calls
      await page.waitForResponse(
        (response) => response.url().includes('/controller/v2/me') && response.status() === 200,
        { timeout: 10000 }
      );

      const organizationName = createE2EName('organization');
      const regularInventoryName = createE2EName('inventory');
      const constructedInventoryName = createE2EName('constructed-inventory');
      const groupName = createE2EName('group');
      const hostName = createE2EName('host');

      const organization = await gatewayAPI.post<Organization>(page, '/organizations/', {
        name: organizationName,
      });

      let regularInventory: RegularInventory | null = null;
      let constructedInventory: ConstructedInventory | null = null;
      let group: InventoryGroup | null = null;
      let host: AwxHost | null = null;
      let executionEnvironmentName: string | null = null;
      let credentialName: string | null = null;

      try {
        // Create execution environment
        executionEnvironmentName = await createExecutionEnvironment(page, {
          organizationName,
        });

        // Create Machine credential for running ad-hoc commands
        credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);

        // Create regular inventory via AWX API
        regularInventory = await awxAPI.post<RegularInventory>(page, '/inventories/', {
          name: regularInventoryName,
          organization: organization?.id,
        });

        // Create group in regular inventory
        group = await awxAPI.post<InventoryGroup>(page, '/groups/', {
          name: groupName,
          inventory: regularInventory!.id,
        });

        // Create host in regular inventory
        host = await awxAPI.post<AwxHost>(page, '/hosts/', {
          name: hostName,
          inventory: regularInventory!.id,
        });

        // Add host to group
        await awxAPI.post(
          page,
          `/groups/${group!.id}/hosts/`,
          { id: host!.id },
          { expectStatus: 204 }
        );

        // Create constructed inventory via AWX API
        constructedInventory = await awxAPI.post<ConstructedInventory>(page, '/inventories/', {
          name: constructedInventoryName,
          organization: organization?.id,
          kind: 'constructed',
          source_vars: 'plugin: constructed',
        });

        // Add regular inventory as input to constructed inventory
        await awxAPI.post(
          page,
          `/inventories/${constructedInventory!.id}/input_inventories/`,
          { id: regularInventory!.id },
          { expectStatus: 204 }
        );

        // Navigate to constructed inventory and sync
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: constructedInventoryName }, page);
        await expect(
          page.getByRole('heading', { name: constructedInventoryName, exact: true })
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
        await expect(page.locator('tbody')).toContainText(hostName, { timeout: 15000 });

        // Click Run command button
        await page.getByRole('button', { name: 'Run command', exact: true }).click();

        // Run ad-hoc command wizard
        await runAdHocCommandWizard(
          {
            module: 'shell',
            moduleArgs: 'echo "Hello World"',
            verbosity: '0',
            limit: 'all',
            forks: 2,
            showChanges: true,
            becomeEnabled: true,
            executionEnvironmentName,
            credentialName,
          },
          page
        );
      } finally {
        // Cleanup in reverse order of creation (use API to avoid navigation issues)
        if (constructedInventory?.id) {
          await awxAPI.delete(page, `/inventories/${constructedInventory.id}/`).catch(() => {});
        }
        if (regularInventory?.id) {
          await awxAPI.delete(page, `/inventories/${regularInventory.id}/`).catch(() => {});
        }
        if (credentialName) {
          // Look up credential ID by name and delete via API
          const credList = await awxAPI
            .get<{
              results: Array<{ id: number; name: string }>;
            }>(page, `/credentials/?name=${encodeURIComponent(credentialName)}`)
            .catch(() => null);
          if (credList?.results?.[0]?.id) {
            await awxAPI.delete(page, `/credentials/${credList.results[0].id}/`).catch(() => {});
          }
        }
        if (executionEnvironmentName) {
          // Look up execution environment ID by name and delete via API
          const eeList = await awxAPI
            .get<{
              results: Array<{ id: number; name: string }>;
            }>(page, `/execution_environments/?name=${executionEnvironmentName}`)
            .catch(() => null);
          if (eeList?.results?.[0]?.id) {
            await awxAPI
              .delete(page, `/execution_environments/${eeList.results[0].id}/`)
              .catch(() => {});
          }
        }
      }
    }
  );

  test(
    'should launch job template against constructed inventory',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      // Wait for login to complete before making API calls
      await page.waitForResponse(
        (response) => response.url().includes('/controller/v2/me') && response.status() === 200,
        { timeout: 10000 }
      );

      const organizationName = createE2EName('organization');
      const regularInventoryName = createE2EName('inventory');
      const constructedInventoryName = createE2EName('constructed-inventory');
      const hostName = createE2EName('host');

      const organization = await gatewayAPI.post<Organization>(page, '/organizations/', {
        name: organizationName,
      });

      let regularInventory: RegularInventory | null = null;
      let constructedInventory: ConstructedInventory | null = null;
      let projectName: string | null = null;
      let jobTemplateName: string | null = null;
      let jobId: number | null = null;

      try {
        // Create regular inventory via AWX API
        regularInventory = await awxAPI.post<RegularInventory>(page, '/inventories/', {
          name: regularInventoryName,
          organization: organization?.id,
        });

        // Create host in regular inventory
        await awxAPI.post<AwxHost>(page, '/hosts/', {
          name: hostName,
          inventory: regularInventory!.id,
        });

        // Create constructed inventory via AWX API
        constructedInventory = await awxAPI.post<ConstructedInventory>(page, '/inventories/', {
          name: constructedInventoryName,
          organization: organization?.id,
          kind: 'constructed',
          source_vars: 'plugin: constructed',
        });

        // Add regular inventory as input to constructed inventory
        await awxAPI.post(
          page,
          `/inventories/${constructedInventory!.id}/input_inventories/`,
          { id: regularInventory!.id },
          { expectStatus: 204 }
        );

        // Create project
        projectName = await createAwxProject({ organizationName }, page);

        // Create job template using constructed inventory
        jobTemplateName = await createJobTemplate(
          { inventoryName: constructedInventoryName, projectName },
          page
        );

        // Navigate to constructed inventory and sync
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: constructedInventoryName }, page);
        await expect(
          page.getByRole('heading', { name: constructedInventoryName, exact: true })
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

        // Note: Jobs tab is not available for hosts in constructed inventories
        // since constructed inventory hosts are read-only
      } finally {
        // Cancel the job if it's still running to allow cleanup
        if (jobId) {
          await awxAPI.post(page, `/jobs/${jobId}/cancel/`, {}).catch(() => {
            // Job might have already completed or failed, or cancellation not allowed
          });
        }

        // Cleanup in reverse order of creation (use API to avoid navigation issues)
        if (jobTemplateName) {
          // Look up job template ID by name and delete via API
          const jtList = await awxAPI
            .get<{
              results: Array<{ id: number; name: string }>;
            }>(page, `/job_templates/?name=${jobTemplateName}`)
            .catch(() => null);
          if (jtList?.results?.[0]?.id) {
            await awxAPI.delete(page, `/job_templates/${jtList.results[0].id}/`).catch(() => {});
          }
        }
        if (projectName) {
          // Look up project ID by name and delete via API
          const projectList = await awxAPI
            .get<{
              results: Array<{ id: number; name: string }>;
            }>(page, `/projects/?name=${projectName}`)
            .catch(() => null);
          if (projectList?.results?.[0]?.id) {
            await awxAPI.delete(page, `/projects/${projectList.results[0].id}/`).catch(() => {});
          }
        }
        if (constructedInventory?.id) {
          await awxAPI.delete(page, `/inventories/${constructedInventory.id}/`).catch(() => {});
        }
        if (regularInventory?.id) {
          await awxAPI.delete(page, `/inventories/${regularInventory.id}/`).catch(() => {});
        }
      }
    }
  );

  test(
    'should verify edit/delete buttons and facts tab are hidden for constructed inventory hosts',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(4 * 60 * 1000);

      // Wait for login to complete before making API calls
      await page.waitForResponse(
        (response) => response.url().includes('/controller/v2/me') && response.status() === 200,
        { timeout: 10000 }
      );

      const organizationName = createE2EName('organization');
      const organization = await gatewayAPI.post<Organization>(page, '/organizations/', {
        name: organizationName,
      });
      const regularInventoryName = createE2EName('inventory');
      const constructedInventoryName = createE2EName('constructed-inventory');
      const hostName = createE2EName('host');

      let regularInventory: RegularInventory | null = null;
      let constructedInventory: ConstructedInventory | null = null;

      try {
        // Create regular inventory via AWX API
        regularInventory = await awxAPI.post<RegularInventory>(page, '/inventories/', {
          name: regularInventoryName,
          organization: organization?.id,
        });

        // Create host in regular inventory
        await awxAPI.post<AwxHost>(page, '/hosts/', {
          name: hostName,
          inventory: regularInventory!.id,
        });

        // Create constructed inventory via AWX API
        constructedInventory = await awxAPI.post<ConstructedInventory>(page, '/inventories/', {
          name: constructedInventoryName,
          organization: organization?.id,
          kind: 'constructed',
          source_vars: 'plugin: constructed',
        });

        // Add regular inventory as input to constructed inventory
        await awxAPI.post(
          page,
          `/inventories/${constructedInventory!.id}/input_inventories/`,
          { id: regularInventory!.id },
          { expectStatus: 204 }
        );

        // Navigate to constructed inventory and sync
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: constructedInventoryName }, page);
        await expect(
          page.getByRole('heading', { name: constructedInventoryName, exact: true })
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
        await expect(page.locator('tbody')).toContainText(hostName, { timeout: 15000 });

        // Click on the host to go to details page
        await clickTableRow({ text: hostName }, page);
        await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();

        // Verify edit button is not visible on host details page
        await expect(page.getByTestId('edit-host')).not.toBeVisible();

        // Navigate back to hosts list to check actions dropdown
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: constructedInventoryName }, page);
        await page.getByRole('tab', { name: 'Hosts' }).click();

        // Wait for host to appear
        await expect(page.locator('tbody')).toContainText(hostName, { timeout: 15000 });

        // Verify actions dropdown is not visible in the table row
        const hostRow = await getTableRow(page, hostName);
        await expect(hostRow.locator('[data-testid="actions-dropdown"]')).not.toBeVisible();

        // Go back to host details to check Facts tab
        await clickTableRow({ text: hostName }, page);
        await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();

        // Verify Facts tab is not visible
        await expect(page.getByRole('tab', { name: 'Facts' })).not.toBeVisible();
      } finally {
        // Cleanup in reverse order of creation
        if (constructedInventory?.id) {
          await awxAPI.delete(page, `/inventories/${constructedInventory.id}/`).catch(() => {});
        }
        if (regularInventory?.id) {
          await awxAPI.delete(page, `/inventories/${regularInventory.id}/`).catch(() => {});
        }
      }
    }
  );
});
