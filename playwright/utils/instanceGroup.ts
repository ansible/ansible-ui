import { InstanceGroup as InstanceGroupType } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { Page, expect } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';

export interface CreateInstanceGroupOptions {
  name?: string;
  policy_instance_list?: string[];
  is_container_group?: boolean;
  max_concurrent_jobs?: number;
  max_forks?: number;
  pod_spec_override?: string;
  policy_instance_minimum?: number;
  policy_instance_percentage?: number;
  credential?: null;
}

export const InstanceGroup = {
  api: {
    create: async (
      page: Page,
      options: CreateInstanceGroupOptions = {}
    ): Promise<InstanceGroupType> => {
      const instanceGroupName = options.name ?? createE2EName('instanceGroup');

      const requestBody: Record<string, unknown> = {
        name: instanceGroupName,
        policy_instance_list: options.policy_instance_list ?? [],
      };

      // Add optional fields if provided
      if (options.is_container_group !== undefined) {
        requestBody.is_container_group = options.is_container_group;
      }
      if (options.max_concurrent_jobs !== undefined) {
        requestBody.max_concurrent_jobs = options.max_concurrent_jobs;
      }
      if (options.max_forks !== undefined) {
        requestBody.max_forks = options.max_forks;
      }
      if (options.pod_spec_override !== undefined) {
        requestBody.pod_spec_override = options.pod_spec_override;
      }
      if (options.policy_instance_minimum !== undefined) {
        requestBody.policy_instance_minimum = options.policy_instance_minimum;
      }
      if (options.policy_instance_percentage !== undefined) {
        requestBody.policy_instance_percentage = options.policy_instance_percentage;
      }
      if (options.credential !== undefined) {
        requestBody.credential = options.credential;
      }

      const instanceGroup = await awxAPI.post<InstanceGroupType>(
        page,
        '/instance_groups/',
        requestBody
      );

      if (!instanceGroup) {
        throw new Error('Failed to create instance group: no response from API');
      }

      return instanceGroup;
    },

    delete: async (page: Page, instanceGroupId: number): Promise<void> => {
      try {
        await awxAPI.delete(page, `/instance_groups/${instanceGroupId}/`);
      } catch (error) {
        // Ignore 404 - resource already deleted
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('404') && !errorMessage.includes('Not Found')) {
          throw error; // Re-throw non-404 errors
        }
      }
    },

    deleteByName: async (page: Page, instanceGroupName: string): Promise<void> => {
      try {
        const groups = await awxAPI.get<{ results: InstanceGroupType[] }>(
          page,
          `/instance_groups/?name=${instanceGroupName}`
        );
        if (groups?.results && groups.results.length > 0) {
          await awxAPI.delete(page, `/instance_groups/${groups.results[0].id}/`);
        }
      } catch {
        // Already deleted or not found
      }
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
