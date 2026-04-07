import { InstanceGroup, Inventory, InventoryHost, Organization } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';
import { clickPageAction } from '../../../../../../commands/clickPageAction';
import { confirmAndAssertDeletion } from '../../../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../../../commands/createE2EName';
import { filterTableByText } from '../../../../../../commands/filterTableByText';
import { navigateTo } from '../../../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../../../commands/setup';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test.describe('Constructed Inventory', () => {
  test(
    'should create constructed inventory with all fields and delete',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);
      const instanceGroupName = createE2EName('instanceGroup');
      const inventory1Name = createE2EName('inventory');
      const inventory2Name = createE2EName('inventory');
      const constructedInventoryName = createE2EName('constructed-inventory');
      const cacheTimeoutValue = Math.floor(Math.random() * 15);
      const verbosityValue = Math.floor(Math.random() * 3);

      // Create resources using utilities
      const organization = await Organization.api.create(page);
      const instanceGroup = await InstanceGroup.api.create(page, { name: instanceGroupName });
      const inventory1 = await Inventory.api.create(page, {
        name: inventory1Name,
        organization: organization.id,
      });
      const inventory2 = await Inventory.api.create(page, {
        name: inventory2Name,
        organization: organization.id,
      });

      let constructedInventory: string | null = null;

      try {
        // Create constructed inventory via UI with all fields
        constructedInventory = await Inventory.ui.createConstructed(page, {
          name: constructedInventoryName,
          description: `Description of "${constructedInventoryName}" created by Playwright`,
          organizationName: organization.name,
          instanceGroupNames: [instanceGroupName],
          inputInventoryNames: [inventory1Name, inventory2Name],
          cacheTimeout: cacheTimeoutValue,
          verbosity: String(verbosityValue),
          limit: '5',
          sourceVars: 'plugin: constructed',
        });

        // Verify inventory was created and details are displayed
        await expect(
          page.getByRole('heading', { name: constructedInventoryName, exact: true })
        ).toBeVisible();
        await expect(page.getByTestId('name')).toHaveText(constructedInventoryName);
        await expect(page.getByTestId('description')).toHaveText(
          `Description of "${constructedInventoryName}" created by Playwright`
        );
        await expect(page.getByTestId('type')).toHaveText('Constructed inventory');
        await expect(page.getByTestId('organization')).toHaveText(organization.name);

        // Delete from details page
        await clickPageAction('Delete inventory', page);
        await confirmAndAssertDeletion(page);

        // AWX deletion is async (202) — use API delete to ensure cleanup completes
        await Inventory.api.deleteByName(page, constructedInventoryName).catch(() => {});
        constructedInventory = null;
      } finally {
        // Cleanup using utilities - Organization.api.deleteByName handles dependent resources
        if (constructedInventory) {
          await Inventory.api.delete(page, inventory1.id).catch(() => {});
          await Inventory.api.delete(page, inventory2.id).catch(() => {});
        }
        await InstanceGroup.api.delete(page, instanceGroup.id).catch(() => {});
        await Organization.api.deleteByName(page, organization.name);
      }
    }
  );

  test(
    'should edit description and source_vars, then sync inventory successfully',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const inventory1Name = createE2EName('inventory');
      const constructedInventoryName = createE2EName('constructed-inventory');
      const description = 'Edit action: New description created by Playwright';

      // Create resources using utilities
      const organization = await Organization.api.create(page);
      await Inventory.api.create(page, {
        name: inventory1Name,
        organization: organization.id,
      });

      try {
        // Create basic constructed inventory
        await Inventory.ui.createConstructed(page, {
          name: constructedInventoryName,
          organizationName: organization.name,
          inputInventoryNames: [inventory1Name],
          sourceVars: 'plugin: constructed',
        });

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
          timeout: 60000,
        });
      } finally {
        // Cleanup - Organization.api.deleteByName handles dependent inventories
        await Organization.api.deleteByName(page, organization.name);
      }
    }
  );

  test(
    'should fail sync when strict mode is enabled with bad variables',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const inputInventoryName = createE2EName('inventory');
      const constructedInventoryName = createE2EName('constructed-inventory');

      // Create resources using utilities
      const organization = await Organization.api.create(page);
      const inputInventory = await Inventory.api.create(page, {
        name: inputInventoryName,
        organization: organization.id,
      });

      // Add a host to the input inventory
      await InventoryHost.api.create(page, {
        name: createE2EName('host'),
        inventory: inputInventory.id,
      });

      try {
        // Create constructed inventory via UI with basic source vars
        await Inventory.ui.createConstructed(page, {
          name: constructedInventoryName,
          organizationName: organization.name,
          inputInventoryNames: [inputInventoryName],
          sourceVars: 'plugin: constructed',
        });

        // Edit to add strict mode with bad variables
        await clickPageAction('Edit inventory', page);
        await expect(page.getByRole('heading', { name: 'Edit' })).toBeVisible();

        // Update source vars to add strict mode and bad variables
        await page.locator('.view-line').click();
        await page.keyboard.press('Control+a');

        // Type YAML line by line with actual Enter key presses
        const yamlLines = [
          `plugin: constructed`,
          `strict: true`,
          `groups:`,
          `  is_shutdown: "state | default('running') == 'shutdown'"`,
          `  product_dev: "account_alias == 'product_dev'"`,
        ];

        for (let i = 0; i < yamlLines.length; i++) {
          await page.keyboard.type(yamlLines[i]);
          if (i < yamlLines.length - 1) {
            await page.keyboard.press('Enter');
          }
        }

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
        // Cleanup - Organization.api.deleteByName handles dependent inventories
        await Organization.api.deleteByName(page, organization.name);
      }
    }
  );

  test(
    'should reorder input inventories and verify persistence',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const inventory1Name = createE2EName('inventory-1');
      const inventory2Name = createE2EName('inventory-2');
      const inventory3Name = createE2EName('inventory-3');
      const constructedInventoryName = createE2EName('constructed-inventory');

      // Create resources using utilities
      const organization = await Organization.api.create(page);
      await Inventory.api.create(page, {
        name: inventory1Name,
        organization: organization.id,
      });
      await Inventory.api.create(page, {
        name: inventory2Name,
        organization: organization.id,
      });
      await Inventory.api.create(page, {
        name: inventory3Name,
        organization: organization.id,
      });

      try {
        // Create constructed inventory with three input inventories
        await Inventory.ui.createConstructed(page, {
          name: constructedInventoryName,
          organizationName: organization.name,
          inputInventoryNames: [inventory1Name, inventory2Name, inventory3Name],
          sourceVars: 'plugin: constructed',
        });

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
        await page.getByRole('checkbox', { name: firstInventoryName }).click();

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
        // Cleanup - Organization.api.deleteByName handles dependent inventories
        await Organization.api.deleteByName(page, organization.name);
      }
    }
  );
});
