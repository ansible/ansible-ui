import { Page, expect } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';
import type { Inventory as InventoryType } from '@ansible/awx-ui/interfaces/Inventory';

export interface CreateInventoryOptions {
  name?: string;
  description?: string;
  organization: number;
}

export interface CreateInventoryUIOptions {
  inventoryName?: string;
  description?: string;
  organizationName?: string;
  labelName?: string;
  instanceGroupName?: string;
  policyEnforcement?: string;
  variables?: string;
  preventInstanceGroupFallback?: boolean;
}

export interface CreateSmartInventoryUIOptions {
  inventoryName?: string;
  organizationName: string;
  instanceGroupName?: string;
  labelName?: string;
}

export interface CreateConstructedInventoryUIOptions {
  name?: string;
  inventoryName?: string;
  description?: string;
  organizationName: string;
  instanceGroupNames?: string[];
  inputInventoryNames?: string[];
  cacheTimeout?: number;
  verbosity?: string;
  limit?: string;
  sourceVars?: string;
  labelName?: string;
}

export interface CreateInventorySourceUIOptions {
  sourceName?: string;
  projectName?: string;
  organizationName?: string;
  inventoryName?: string;
  scheduleName?: string;
}

export const Inventory = {
  api: {
    create: async (page: Page, options: CreateInventoryOptions): Promise<InventoryType> => {
      const inventory = await awxAPI.post<InventoryType>(page, 'inventories/', {
        name: options.name ?? createE2EName('Inventory'),
        description: options.description ?? 'Created via API for E2E testing',
        organization: options.organization,
      });

      if (!inventory) {
        throw new Error('Failed to create inventory: API returned null');
      }

      return inventory;
    },

    delete: async (page: Page, inventoryId: number): Promise<void> => {
      await awxAPI.delete(page, `inventories/${inventoryId}/`);
    },

    get: async (page: Page, inventoryId: number): Promise<InventoryType> => {
      const inventory = await awxAPI.get<InventoryType>(page, `inventories/${inventoryId}/`);

      if (!inventory) {
        throw new Error(`Inventory ${inventoryId} not found`);
      }

      return inventory;
    },
  },

  ui: {
    create: async (page: Page, options: CreateInventoryUIOptions = {}): Promise<string> => {
      const inventoryName = options.inventoryName ?? createE2EName('inventory');

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await page.getByLabel('dropdown toggle', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create inventory' }).click();

      await page.getByPlaceholder('Enter inventory name').fill(inventoryName);
      await page.getByPlaceholder('Enter description').fill(options.description ?? '');
      await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);

      // Instance group
      if (options.instanceGroupName) {
        await page.getByLabel('Instance groups').click();
        await page.getByLabel('Search input').click();
        await page.getByLabel('Search input').fill(options.instanceGroupName);
        await page.getByLabel(options.instanceGroupName).check();
      }

      // Label
      if (options.labelName) {
        await page.getByPlaceholder('Select or create labels').click();
        await page.getByPlaceholder('Select or create labels').fill(options.labelName);
        await page.getByRole('option', { name: `Create "${options.labelName}"` }).click();
      }

      // Policy enforcement
      if (options.policyEnforcement) {
        await page.getByLabel('Policy enforcement').click();
        await page.getByLabel('Policy enforcement').fill(options.policyEnforcement);
      }

      // Variables
      if (options.variables) {
        await page.locator('.view-line').click();
        await page.getByRole('textbox', { name: 'Editor content' }).fill(options.variables);
      }

      // Prevent instance group fallback
      if (options.preventInstanceGroupFallback) {
        await page.getByLabel('Prevent instance group').check();
      }

      await page.getByRole('button', { name: 'Create inventory' }).click();
      await expect(page.getByRole('heading', { name: inventoryName, exact: true })).toBeVisible();

      return inventoryName;
    },

    createSmart: async (page: Page, options: CreateSmartInventoryUIOptions): Promise<string> => {
      const inventoryName = options.inventoryName ?? createE2EName('inventory');

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await page.getByLabel('dropdown toggle', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create smart inventory' }).click();

      const smartHostFilterVal = 'name__icontains=RedHat';
      await page.getByPlaceholder('Enter smart host filter').click();
      await page.getByPlaceholder('Enter smart host filter').fill(smartHostFilterVal);

      // Note: This is intentionally incomplete - matches the original implementation
      // TODO: Complete smart inventory creation flow

      return inventoryName;
    },

    createConstructed: async (
      page: Page,
      options: CreateConstructedInventoryUIOptions
    ): Promise<string> => {
      const inventoryName = options.name ?? options.inventoryName ?? createE2EName('inventory');

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await page.getByLabel('dropdown toggle', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create constructed inventory' }).click();

      await page.getByPlaceholder('Enter inventory name').fill(inventoryName);
      if (options.description) {
        await page.getByPlaceholder('Enter description').fill(options.description);
      }
      await singleSelectByLabel('Organization', options.organizationName, page);

      // instance groups
      if (options.instanceGroupNames && options.instanceGroupNames.length > 0) {
        await page.getByLabel('Instance groups').click();
        for (const instanceGroupName of options.instanceGroupNames) {
          await page
            .locator('#instance-group-select-search')
            .getByLabel('Search input')
            .fill(instanceGroupName);
          await page.getByLabel(instanceGroupName).check();
        }
      }

      // input inventories
      if (options.inputInventoryNames && options.inputInventoryNames.length > 0) {
        await page.getByLabel('Input inventories').click();
        for (const inputInventoryName of options.inputInventoryNames) {
          await page
            .locator('#inventories-search')
            .getByLabel('Search input')
            .fill(inputInventoryName);
          await page.getByLabel(inputInventoryName).check();
        }
      }

      // cache timeout
      if (options.cacheTimeout !== undefined) {
        await page.getByLabel('Cache timeout').clear();
        await page.getByLabel('Cache timeout').fill(String(options.cacheTimeout));
      }

      // verbosity
      if (options.verbosity) {
        await page.getByLabel('Verbosity').click();
        await page.getByRole('option', { name: options.verbosity }).click();
      }

      // limit
      if (options.limit) {
        await page.getByLabel('Limit').fill(options.limit);
      }

      // source vars
      if (options.sourceVars) {
        await page.locator('.view-line').click();
        await page.getByRole('textbox', { name: 'Editor content' }).fill(options.sourceVars);
      }

      // label
      if (options.labelName) {
        await page.getByPlaceholder('Select or create labels').click();
        await page.getByPlaceholder('Select or create labels').fill(options.labelName);
        await page.getByRole('option', { name: `Create "${options.labelName}"` }).click();
      }

      // create inventory
      await page.getByRole('button', { name: 'Create inventory' }).click();
      await expect(page.getByRole('heading', { name: inventoryName, exact: true })).toBeVisible();

      return inventoryName;
    },

    createSource: async (
      page: Page,
      options: CreateInventorySourceUIOptions = {}
    ): Promise<{ inventorySourceName: string; inventoryName: string }> => {
      const inventorySourceName = options.sourceName ?? createE2EName('inventory-source');
      const projectName = options.projectName ?? 'Demo Project';

      // Use existing inventory or create a new one
      let inventoryName: string;
      if (options.inventoryName) {
        inventoryName = options.inventoryName;
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: inventoryName }, page);
      } else {
        inventoryName = await Inventory.ui.create(page, {
          organizationName: options.organizationName ?? 'Default',
        });
      }

      // Navigate to Sources tab and create source
      await page.getByRole('tab', { name: 'Sources' }).click();
      await page.getByText('Create source', { exact: true }).click();
      await page.getByPlaceholder('Enter source name').click();
      await page.getByPlaceholder('Enter source name').fill(inventorySourceName);
      await page.getByRole('button', { name: 'Select source' }).click();
      await page.getByRole('option', { name: 'Sourced from a Project' }).click();
      await page.locator('#project-select').click();
      await page.getByRole('option', { name: projectName }).click();
      await page.getByPlaceholder('Select inventory file').click();
      await page.getByRole('option', { name: '/ (project root)' }).click();
      await page.getByRole('button', { name: 'Create source' }).click();
      await expect(
        page.getByRole('heading', { name: inventorySourceName, exact: true })
      ).toBeVisible();

      if (options.scheduleName) {
        await page.getByRole('tab', { name: 'Schedules' }).click();
        await clickPageAction('Create schedule', page);
        await page.getByPlaceholder('Enter schedule name').fill(options.scheduleName);
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByRole('button', { name: 'Save rule' }).click();
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByRole('button', { name: 'Finish' }).click();
        await expect(page.getByRole('heading')).toContainText(options.scheduleName);
      }

      return { inventorySourceName, inventoryName };
    },

    edit: async (page: Page, inventoryName: string, newInventoryName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ filterLabel: 'Name', text: inventoryName }, page);
      await page.getByRole('button', { name: 'Edit inventory', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Edit inventory' })).toBeVisible();
      await page.getByLabel('Name', { exact: true }).clear();
      await page.getByLabel('Name', { exact: true }).fill(newInventoryName);
      await page.getByRole('button', { name: 'Save inventory', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: newInventoryName, exact: true })
      ).toBeVisible();
    },

    delete: async (page: Page, inventoryName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: inventoryName }, page);
      await clickPageAction('Delete inventory', page);
      await confirmAndAssertDeletion(page);
      await expect(page.getByRole('heading', { name: 'Inventories', exact: true })).toBeVisible();
    },

    deleteSource: async (
      page: Page,
      inventoryName: string,
      inventorySourceName: string
    ): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: inventoryName }, page);
      await page.getByRole('tab', { name: 'Sources' }).click();
      await clickTableRow({ text: inventorySourceName }, page);
      await page.getByLabel('kebab dropdown toggle').click();
      await page.getByRole('menuitem', { name: 'Delete inventory source' }).click();
      await confirmAndAssertDeletion(page);
      await expect(
        page.getByRole('heading', {
          name: 'There are currently no sources added to this inventory.',
        })
      ).toBeVisible();
    },
  },
} as const;
