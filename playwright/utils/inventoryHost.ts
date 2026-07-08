import { AwxHost } from '@ansible/awx-ui/interfaces/AwxHost';
import { Page, expect } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { getTableRow } from '../commands/getTableRow';
import { navigateTo } from '../commands/navigateTo';

export interface CreateHostInInventoryOptions {
  name?: string;
  description?: string;
  variables?: string;
}

export interface CreateHostApiOptions {
  name?: string;
  description?: string;
  variables?: string;
  inventory: number;
}

export const InventoryHost = {
  api: {
    create: async (page: Page, options: CreateHostApiOptions): Promise<AwxHost> => {
      const host = await awxAPI.post<AwxHost>(page, '/hosts/', {
        name: options.name ?? createE2EName('host'),
        description: options.description,
        variables: options.variables,
        inventory: options.inventory,
      });

      if (!host) {
        throw new Error('Failed to create host: API returned null');
      }

      return host;
    },

    delete: async (page: Page, hostId: number): Promise<void> => {
      await awxAPI.delete(page, `/hosts/${hostId}/`).catch(() => {});
    },

    /** Delete all hosts in an inventory via API, retrying if hosts are still in use by running jobs. */
    deleteAllByInventoryName: async (page: Page, inventoryName: string): Promise<void> => {
      const inventories = (await awxAPI.get(page, '/inventories/', {
        params: { name: inventoryName },
      })) as { results: { id: number }[] };
      const inventoryId = inventories.results[0]?.id;
      if (!inventoryId) return;

      const hosts = (await awxAPI.get(page, `/inventories/${inventoryId}/hosts/`)) as {
        results: { id: number }[];
      };

      for (const host of hosts.results) {
        await expect
          .poll(
            async () => {
              try {
                await awxAPI.delete(page, `/hosts/${host.id}/`);
                return true;
              } catch {
                return false;
              }
            },
            {
              message: `Host ${host.id} still in use by running job`,
              timeout: 60000,
              intervals: [2000, 3000, 5000],
            }
          )
          .toBe(true);
      }
    },
  },

  ui: {
    navigateToInventoryHostsTab: async (inventoryName: string, page: Page): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: inventoryName }, page);
      await page.getByRole('tab', { name: 'Hosts' }).click();
    },

    navigateToDetails: async (
      inventoryName: string,
      hostName: string,
      page: Page
    ): Promise<void> => {
      await InventoryHost.ui.navigateToInventoryHostsTab(inventoryName, page);
      await clickTableRow({ text: hostName }, page);
      await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();
    },

    navigateToGroupsTab: async (
      inventoryName: string,
      hostName: string,
      page: Page
    ): Promise<void> => {
      await InventoryHost.ui.navigateToDetails(inventoryName, hostName, page);
      await page.getByRole('tab', { name: 'Groups' }).click();
    },

    create: async (
      page: Page,
      inventoryName: string,
      options: CreateHostInInventoryOptions = {}
    ): Promise<string> => {
      const hostName = options.name ?? createE2EName('host');
      await InventoryHost.ui.navigateToInventoryHostsTab(inventoryName, page);
      await page.getByText('Create host', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create host', exact: true })).toBeVisible();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(hostName);

      if (options.description) {
        await page
          .getByRole('textbox', { name: 'Description', exact: true })
          .fill(options.description);
      }

      if (options.variables) {
        await page.locator('.view-line').click();
        await page.getByRole('textbox', { name: 'Editor content' }).fill(options.variables);
      }

      await page.getByRole('button', { name: 'Create host', exact: true }).click();
      await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();
      await expect(page.locator('#name')).toContainText(hostName);

      if (options.description) {
        await expect(page.locator('#description')).toContainText(options.description);
      }

      if (options.variables) {
        await expect(page.getByRole('code')).toContainText(options.variables);
      }

      return hostName;
    },

    deleteFromList: async (page: Page, inventoryName: string, hostName: string): Promise<void> => {
      await InventoryHost.ui.navigateToInventoryHostsTab(inventoryName, page);
      const hostRow = await getTableRow(page, hostName);
      await hostRow.getByRole('button', { name: 'kebab dropdown toggle' }).click();
      await page.getByRole('menuitem', { name: 'Delete host' }).click();
      await confirmAndAssertDeletion(page);
    },

    bulkDelete: async (page: Page, inventoryName: string): Promise<void> => {
      await InventoryHost.ui.navigateToInventoryHostsTab(inventoryName, page);
      await page.getByLabel('Select all').check();
      await page.getByLabel('toolbar actions').click();
      await page.getByRole('menuitem', { name: 'Delete hosts' }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('Permanently delete hosts')).toBeVisible();
      await dialog.locator('#confirm').click();
      await page.getByRole('button', { name: 'Delete hosts', exact: true }).click();

      // Wait for dialog to close and page to update
      await expect(dialog).not.toBeVisible({ timeout: 30000 });

      // Wait for the empty state message to appear
      await expect(
        page.getByRole('heading', { name: 'No hosts are assigned to this inventory.' })
      ).toBeVisible({
        timeout: 15000,
      });
    },
  },
};
