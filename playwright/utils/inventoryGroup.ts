import { Page, expect } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';
import { clickTableRow } from '../commands/clickTableRow';
import { createE2EName } from '../commands/createE2EName';
import { fillMonacoEditor } from '../commands/fillMonacoEditor';
import { getTableRow } from '../commands/getTableRow';
import { navigateTo } from '../commands/navigateTo';
import { InventoryGroup as InventoryGroupType } from '@ansible/awx-ui/interfaces/InventoryGroup';

export interface CreateInventoryGroupOptions {
  inventoryName: string;
  groupName?: string;
  description?: string;
  variables?: string;
}

export interface CreateInventoryHostOptions {
  inventoryName: string;
  hostName?: string;
}

export interface DeleteInventoryGroupOptions {
  inventoryName: string;
  groupName: string;
}

export const InventoryGroup = {
  api: {
    create: async (
      page: Page,
      options: { name?: string; inventory: number }
    ): Promise<InventoryGroupType> => {
      const group = await awxAPI.post<InventoryGroupType>(page, 'groups/', {
        name: options.name ?? createE2EName('group'),
        inventory: options.inventory,
      });

      if (!group) {
        throw new Error('Failed to create group: API returned null');
      }

      return group;
    },

    addHost: async (page: Page, groupId: number, hostId: number): Promise<void> => {
      await awxAPI.post(page, `groups/${groupId}/hosts/`, { id: hostId }, { expectStatus: 204 });
    },
  },
  ui: {
    createGroup: async (page: Page, options: CreateInventoryGroupOptions): Promise<string> => {
      const groupName = options.groupName ?? createE2EName('group');
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: options.inventoryName }, page);
      await page.getByRole('tab', { name: 'Groups' }).click();

      const createGroupAction = page
        .getByRole('link', { name: 'Create group' })
        .or(page.getByRole('button', { name: 'Create group' }));
      await createGroupAction.click();

      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(groupName);
      if (options.description) {
        await page.getByRole('textbox', { name: 'Description' }).fill(options.description);
      }
      if (options.variables) {
        await fillMonacoEditor(page, options.variables);
      }
      await page.getByRole('button', { name: 'Create group' }).click();
      await expect(page.getByRole('heading', { name: groupName, exact: true })).toBeVisible();
      return groupName;
    },

    createHost: async (page: Page, options: CreateInventoryHostOptions): Promise<string> => {
      const hostName = options.hostName ?? createE2EName('host');
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: options.inventoryName }, page);
      await page.getByRole('tab', { name: 'Hosts' }).click();
      await page.getByRole('link', { name: 'Create host' }).click();
      await page.getByTestId('name').fill(hostName);
      await page.getByRole('button', { name: 'Create host' }).click();
      await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();
      return hostName;
    },

    deleteGroup: async (page: Page, options: DeleteInventoryGroupOptions): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: options.inventoryName }, page);
      await page.getByRole('tab', { name: 'Groups' }).click();
      const groupRow = await getTableRow(page, options.groupName);
      await groupRow.getByRole('checkbox').check();
      await page.getByLabel('kebab dropdown toggle').click();
      await page.getByRole('menuitem', { name: 'Delete groups' }).click();
      await page.getByTestId('delete-groups-dialog-radio-delete').check();
      await page.getByTestId('delete-group-modal-delete-button').click();
      await expect(
        page.getByRole('heading', {
          name: 'There are currently no groups added to this inventory.',
        })
      ).toBeVisible();
    },
  },
} as const;
