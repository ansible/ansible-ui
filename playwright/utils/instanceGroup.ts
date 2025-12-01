import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { awxAPI } from '../commands/apiClient';
import { InstanceGroup as InstanceGroupType } from '@ansible/awx-ui/interfaces/InstanceGroup';

export interface CreateInstanceGroupOptions {
  name?: string;
  policy_instance_list?: string[];
}

export const InstanceGroup = {
  api: {
    create: async (
      page: Page,
      options: CreateInstanceGroupOptions = {}
    ): Promise<InstanceGroupType> => {
      const instanceGroupName = options.name ?? createE2EName('instanceGroup');

      const instanceGroup = await awxAPI.post<InstanceGroupType>(page, '/instance_groups/', {
        name: instanceGroupName,
        policy_instance_list: options.policy_instance_list ?? [],
      });

      if (!instanceGroup) {
        throw new Error('Failed to create instance group: no response from API');
      }

      return instanceGroup;
    },
  },

  ui: {
    create: async (page: Page, options: CreateInstanceGroupOptions = {}): Promise<string> => {
      const instanceGroupName = options.name ?? createE2EName('instanceGroup');
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
      await page.getByLabel('dropdown toggle', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create instance group' }).click();
      await page.getByPlaceholder('Enter instance group name').fill(instanceGroupName);
      await page.getByRole('button', { name: 'Create instance group' }).click();
      await expect(
        page.getByRole('heading', { name: instanceGroupName, exact: true })
      ).toBeVisible();
      await expect(page.locator('#name')).toContainText(instanceGroupName);
      return instanceGroupName;
    },

    delete: async (page: Page, instanceGroupName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
      await clickTableRow({ text: instanceGroupName }, page);
      await clickPageAction('Delete instance group', page);
      await confirmAndAssertDeletion(page);
    },
  },
} as const;
