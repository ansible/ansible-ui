import { expect, test } from '@playwright/test';
import { clickPageAction } from '../../../../../../commands/clickPageAction';
import { confirmAndAssertDeletion } from '../../../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../../../commands/createE2EName';
import { filterTableByText } from '../../../../../../commands/filterTableByText';
import { navigateTo } from '../../../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../../../commands/setup';
import { awxAPI, gatewayAPI } from '@ansible/playwright/commands/apiClient';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { InstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { RegularInventory, ConstructedInventory } from '@ansible/awx-ui/interfaces/Inventory';
import { createInstanceGroupAPI } from '../../instance-groups/instance-group-utils';
import { createConstructedInventory } from '../inventory-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test.describe('Constructed Inventory', () => {
  test(
    'should create constructed inventory with all fields and delete',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Wait for login to complete before making API calls
      await page.waitForResponse(
        (response) => response.url().includes('/controller/v2/me') && response.status() === 200,
        { timeout: 10000 }
      );

      const organizationName = createE2EName('org');
      const instanceGroupName = createE2EName('instanceGroup');
      const inventory1Name = createE2EName('inventory');
      const inventory2Name = createE2EName('inventory');
      const constructedInventoryName = createE2EName('constructed-inventory');
      const cacheTimeoutValue = Math.floor(Math.random() * 15);
      const verbosityValue = Math.floor(Math.random() * 3);

      let organization: Organization | null = null;
      let instanceGroup: InstanceGroup | null = null;
      let inventory1: RegularInventory | null = null;
      let inventory2: RegularInventory | null = null;
      let constructedInventory: string | null = null;

      try {
        // Create organization via API
        organization = await gatewayAPI.post<Organization>(page, '/organizations/', {
          name: organizationName,
        });

        // Create instance group via API
        instanceGroup = await createInstanceGroupAPI(page, { name: instanceGroupName });

        // Create two regular inventories via API
        inventory1 = await awxAPI.post<RegularInventory>(page, '/inventories/', {
          name: inventory1Name,
          organization: organization?.id,
        });

        inventory2 = await awxAPI.post<RegularInventory>(page, '/inventories/', {
          name: inventory2Name,
          organization: organization?.id,
        });

        // Create constructed inventory via UI with all fields
        constructedInventory = await createConstructedInventory(
          {
            name: constructedInventoryName,
            description: `Description of "${constructedInventoryName}" created by Playwright`,
            organizationName,
            instanceGroupNames: [instanceGroupName],
            inputInventoryNames: [inventory1Name, inventory2Name],
            cacheTimeout: cacheTimeoutValue,
            verbosity: String(verbosityValue),
            limit: '5',
            sourceVars: 'plugin: constructed',
          },
          page
        );

        // Verify inventory was created and details are displayed
        await expect(
          page.getByRole('heading', { name: constructedInventoryName, exact: true })
        ).toBeVisible();
        await expect(page.getByTestId('name')).toHaveText(constructedInventoryName);
        await expect(page.getByTestId('description')).toHaveText(
          `Description of "${constructedInventoryName}" created by Playwright`
        );
        await expect(page.getByTestId('type')).toHaveText('Constructed inventory');
        await expect(page.getByTestId('organization')).toHaveText(organizationName);

        // Delete from details page
        await clickPageAction('Delete inventory', page);
        await confirmAndAssertDeletion(page);

        // Verify deletion - search for inventory and confirm no results
        await expect(page.getByRole('heading', { name: 'Inventories', exact: true })).toBeVisible();
        await filterTableByText({ filterValue: constructedInventoryName }, page);
        await expect(page.getByText('No results found')).toBeVisible();

        constructedInventory = null; // Mark as deleted
      } finally {
        // Cleanup - delete in reverse order of creation
        try {
          if (constructedInventory) {
            const constructedInvResponse = await awxAPI.get<{ results: ConstructedInventory[] }>(
              page,
              '/inventories/',
              { params: { name: constructedInventory } }
            );
            if (constructedInvResponse?.results?.[0]?.id) {
              await awxAPI
                .delete(page, `/inventories/${constructedInvResponse.results[0].id}/`)
                .catch(() => {});
            }
          }
        } catch (e) {
          // Ignore cleanup errors - inventory was deleted via UI
        }
        if (inventory2?.id) {
          await awxAPI.delete(page, `/inventories/${inventory2.id}/`).catch(() => {});
        }
        if (inventory1?.id) {
          await awxAPI.delete(page, `/inventories/${inventory1.id}/`).catch(() => {});
        }
        if (instanceGroup?.id) {
          await awxAPI.delete(page, `/instance_groups/${instanceGroup.id}/`).catch(() => {});
        }
        if (organization?.id) {
          await gatewayAPI.delete(page, `/organizations/${organization.id}/`).catch(() => {});
        }
      }
    }
  );

  test(
    'should edit description and source_vars, then sync inventory successfully',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Wait for login to complete before making API calls
      await page.waitForResponse(
        (response) => response.url().includes('/controller/v2/me') && response.status() === 200,
        { timeout: 10000 }
      );

      const organizationName = createE2EName('org');
      const inventory1Name = createE2EName('inventory');
      const constructedInventoryName = createE2EName('constructed-inventory');
      const description = 'Edit action: New description created by Playwright';

      let organization: Organization | null = null;
      let inventory1: RegularInventory | null = null;
      let constructedInventory: string | null = null;

      try {
        // Create organization via API
        organization = await gatewayAPI.post<Organization>(page, '/organizations/', {
          name: organizationName,
        });

        // Create regular inventory via API
        inventory1 = await awxAPI.post<RegularInventory>(page, '/inventories/', {
          name: inventory1Name,
          organization: organization?.id,
        });

        // Create basic constructed inventory
        constructedInventory = await createConstructedInventory(
          {
            name: constructedInventoryName,
            organizationName,
            inputInventoryNames: [inventory1Name],
            sourceVars: 'plugin: constructed',
          },
          page
        );

        // Navigate to edit page
        await clickPageAction('Edit inventory', page);
        await expect(page.getByRole('heading', { name: 'Edit' })).toBeVisible();

        // Edit description and source vars
        await page.getByPlaceholder('Enter description').clear();
        await page.getByPlaceholder('Enter description').fill(description);
        await page.locator('.view-line').click();
        await page.getByRole('textbox', { name: 'Editor content' }).clear();
        await page.getByRole('textbox', { name: 'Editor content' }).fill('plugin: constructed');
        await page.getByRole('button', { name: 'Save inventory' }).click();

        // Verify changes were saved
        await expect(
          page.getByRole('heading', { name: constructedInventoryName, exact: true })
        ).toBeVisible();
        await expect(page.getByTestId('description')).toHaveText(description);

        // Sync inventory
        const syncResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/inventory_sources/') &&
            response.url().includes('/update/') &&
            response.request().method() === 'POST'
        );
        await page.getByRole('button', { name: 'Sync inventory' }).click();
        await syncResponsePromise;

        // Wait for sync to complete and verify success status
        await expect(page.getByTestId('last-job-status')).toContainText('Success', {
          timeout: 30000,
        });
      } finally {
        // Cleanup
        try {
          if (constructedInventory) {
            const constructedInvResponse = await awxAPI.get<{ results: ConstructedInventory[] }>(
              page,
              '/inventories/',
              { params: { name: constructedInventory } }
            );
            if (constructedInvResponse?.results?.[0]?.id) {
              await awxAPI
                .delete(page, `/inventories/${constructedInvResponse.results[0].id}/`)
                .catch(() => {});
            }
          }
        } catch (e) {
          // Ignore cleanup errors - inventory might already be deleted
        }
        if (inventory1?.id) {
          await awxAPI.delete(page, `/inventories/${inventory1.id}/`).catch(() => {});
        }
        if (organization?.id) {
          await gatewayAPI.delete(page, `/organizations/${organization.id}/`).catch(() => {});
        }
      }
    }
  );

  test(
    'should fail sync when strict mode is enabled with bad variables',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Wait for login to complete before making API calls
      await page.waitForResponse(
        (response) => response.url().includes('/controller/v2/me') && response.status() === 200,
        { timeout: 10000 }
      );

      const organizationName = createE2EName('org');
      const inputInventoryName = createE2EName('inventory');
      const constructedInventoryName = createE2EName('constructed-inventory');

      let organization: Organization | null = null;
      let inputInventory: RegularInventory | null = null;
      let constructedInventory: string | null = null;

      try {
        // Create organization via API
        organization = await gatewayAPI.post<Organization>(page, '/organizations/', {
          name: organizationName,
        });

        // Create input inventory with a host via API
        inputInventory = await awxAPI.post<RegularInventory>(page, '/inventories/', {
          name: inputInventoryName,
          organization: organization?.id,
        });

        if (inputInventory?.id) {
          await awxAPI.post(page, '/hosts/', {
            name: createE2EName('host'),
            inventory: inputInventory.id,
          });
        }

        // Create constructed inventory via UI with basic source vars
        constructedInventory = await createConstructedInventory(
          {
            name: constructedInventoryName,
            organizationName,
            inputInventoryNames: [inputInventoryName],
            sourceVars: 'plugin: constructed',
          },
          page
        );

        // Edit to add strict mode with bad variables
        await clickPageAction('Edit inventory', page);
        await expect(page.getByRole('heading', { name: 'Edit' })).toBeVisible();

        // Update source vars to add strict mode and bad variables
        await page.locator('.view-line').click();
        await page.keyboard.press('Control+a');
        await page.keyboard.type(
          `plugin: constructed\nstrict: true\ngroups:\n  is_shutdown: "state | default('running') == 'shutdown'"\n  product_dev: "account_alias == 'product_dev'"`
        );

        // Save and wait for navigation
        await page.getByRole('button', { name: 'Save inventory' }).click();

        // Verify we're back on details page
        await expect(
          page.getByRole('heading', { name: constructedInventoryName, exact: true })
        ).toBeVisible({ timeout: 10000 });

        // Trigger sync
        const syncResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/inventory_sources/') &&
            response.url().includes('/update/') &&
            response.request().method() === 'POST'
        );
        await page.getByRole('button', { name: 'Sync inventory' }).click();
        await syncResponsePromise;

        // Wait for sync to complete and verify failed status
        await expect(page.getByTestId('last-job-status')).toContainText('Failed', {
          timeout: 30000,
        });
      } finally {
        // Cleanup
        try {
          if (constructedInventory) {
            const constructedInvResponse = await awxAPI.get<{ results: ConstructedInventory[] }>(
              page,
              '/inventories/',
              { params: { name: constructedInventory } }
            );
            if (constructedInvResponse?.results?.[0]?.id) {
              await awxAPI
                .delete(page, `/inventories/${constructedInvResponse.results[0].id}/`)
                .catch(() => {});
            }
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        if (inputInventory?.id) {
          await awxAPI.delete(page, `/inventories/${inputInventory.id}/`).catch(() => {});
        }
        if (organization?.id) {
          await gatewayAPI.delete(page, `/organizations/${organization.id}/`).catch(() => {});
        }
      }
    }
  );

  test(
    'should reorder input inventories and verify persistence',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Wait for login to complete before making API calls
      await page.waitForResponse(
        (response) => response.url().includes('/controller/v2/me') && response.status() === 200,
        { timeout: 10000 }
      );

      const organizationName = createE2EName('org');
      const inventory1Name = createE2EName('inventory-1');
      const inventory2Name = createE2EName('inventory-2');
      const inventory3Name = createE2EName('inventory-3');
      const constructedInventoryName = createE2EName('constructed-inventory');

      let organization: Organization | null = null;
      let inventory1: RegularInventory | null = null;
      let inventory2: RegularInventory | null = null;
      let inventory3: RegularInventory | null = null;
      let constructedInventory: string | null = null;

      try {
        // Create organization via API
        organization = await gatewayAPI.post<Organization>(page, '/organizations/', {
          name: organizationName,
        });

        // Create three regular inventories via API
        inventory1 = await awxAPI.post<RegularInventory>(page, '/inventories/', {
          name: inventory1Name,
          organization: organization?.id,
        });

        inventory2 = await awxAPI.post<RegularInventory>(page, '/inventories/', {
          name: inventory2Name,
          organization: organization?.id,
        });

        inventory3 = await awxAPI.post<RegularInventory>(page, '/inventories/', {
          name: inventory3Name,
          organization: organization?.id,
        });

        // Create constructed inventory with three input inventories
        constructedInventory = await createConstructedInventory(
          {
            name: constructedInventoryName,
            organizationName,
            inputInventoryNames: [inventory1Name, inventory2Name, inventory3Name],
            sourceVars: 'plugin: constructed',
          },
          page
        );

        // Get the initial order of input inventories
        await expect(page.getByTestId('input-inventories')).toBeVisible();
        const initialOrder = await page
          .getByTestId('input-inventories')
          .locator('ul > li')
          .allTextContents();

        // Edit inventory to reorder
        await clickPageAction('Edit inventory', page);
        await expect(page.getByRole('heading', { name: 'Edit' })).toBeVisible();

        // Remove the first inventory from the selection
        const firstInventoryName = initialOrder[0];
        await page
          .getByLabel('Label group category')
          .getByRole('button', { name: `close ${firstInventoryName}` })
          .click();

        // Re-add it (it will be added to the end)
        await page.getByLabel('Search input').fill(firstInventoryName);
        await page.getByLabel(firstInventoryName).check();

        // Save the inventory
        await page.getByRole('button', { name: 'Save inventory' }).click();
        await expect(
          page.getByRole('heading', { name: constructedInventoryName, exact: true })
        ).toBeVisible();

        // Navigate back to list and then back to details to verify persistence
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await filterTableByText({ filterValue: constructedInventoryName }, page);
        await page.getByRole('link', { name: constructedInventoryName, exact: true }).click();

        // Verify the new order
        await expect(page.getByTestId('input-inventories')).toBeVisible();
        const newOrder = await page
          .getByTestId('input-inventories')
          .locator('ul > li')
          .allTextContents();

        // Expected order: second, third, first (first moved to end)
        const expectedOrder = [...initialOrder.slice(1), initialOrder[0]];
        expect(newOrder).toEqual(expectedOrder);
      } finally {
        // Cleanup
        try {
          if (constructedInventory) {
            const constructedInvResponse = await awxAPI.get<{ results: ConstructedInventory[] }>(
              page,
              '/inventories/',
              { params: { name: constructedInventory } }
            );
            if (constructedInvResponse?.results?.[0]?.id) {
              await awxAPI
                .delete(page, `/inventories/${constructedInvResponse.results[0].id}/`)
                .catch(() => {});
            }
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        if (inventory3?.id) {
          await awxAPI.delete(page, `/inventories/${inventory3.id}/`).catch(() => {});
        }
        if (inventory2?.id) {
          await awxAPI.delete(page, `/inventories/${inventory2.id}/`).catch(() => {});
        }
        if (inventory1?.id) {
          await awxAPI.delete(page, `/inventories/${inventory1.id}/`).catch(() => {});
        }
        if (organization?.id) {
          await gatewayAPI.delete(page, `/organizations/${organization.id}/`).catch(() => {});
        }
      }
    }
  );
});
