import { Page, expect } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { AwxHost as HostType } from '@ansible/awx-ui/interfaces/AwxHost';

export interface CreateHostOptions {
  name?: string;
  inventoryName?: string;
  description?: string;
  variables?: string;
}

export const Host = {
  api: {
    create: async (
      page: Page,
      options: {
        name?: string;
        description?: string;
        inventory: number;
      }
    ): Promise<HostType> => {
      const host = await awxAPI.post<HostType>(page, 'hosts/', {
        name: options.name ?? createE2EName('host', { noWhitespace: true }),
        description: options.description ?? '',
        inventory: options.inventory,
        variables: 'ansible_connection: local',
        enabled: true,
      });

      if (!host) {
        throw new Error('Failed to create host: API returned null');
      }

      return host;
    },
    delete: async (page: Page, hostId: number): Promise<void> => {
      await awxAPI.delete(page, `hosts/${hostId}/`);
    },
  },
  ui: {
    create: async (page: Page, options: CreateHostOptions = {}): Promise<string> => {
      const hostName = options.name ?? createE2EName('host');
      const inventoryName = options.inventoryName ?? 'Demo Inventory';

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Hosts');
      await page.getByText('Create host', { exact: true }).click();
      await page.getByPlaceholder('Enter host name').fill(hostName);
      await page.getByLabel('Inventory *').click();
      await page.getByLabel('Search input').fill(inventoryName);
      await page.getByRole('option', { name: inventoryName }).click();
      await page.getByLabel('Enabled').click();
      if (options.description) {
        await page.getByRole('textbox', { name: 'Description' }).fill(options.description);
      }
      if (options.variables) {
        await page.locator('.view-line').click();
        await page.getByRole('textbox', { name: 'Editor content' }).fill(options.variables);
      }
      await page.getByRole('button', { name: 'Create host' }).click();

      await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();
      await expect(page.locator('#name')).toContainText(hostName);
      await expect(page.locator('#inventory')).toContainText(inventoryName);

      return hostName;
    },

    delete: async (page: Page, hostName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Hosts');
      await clickTableRow({ text: hostName }, page);
      await clickPageAction('Delete host', page);
      await confirmAndAssertDeletion(page);
    },
  },
} as const;
