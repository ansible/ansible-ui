import { InstanceGroup as InstanceGroupType } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { Page, expect } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';
import { Instance } from './instance';
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

    /**
     * Associates an instance to an instance group via API.
     */
    associateInstance: async (
      page: Page,
      instanceGroupId: number,
      instanceId: number
    ): Promise<void> => {
      await awxAPI.post(
        page,
        `/instance_groups/${instanceGroupId}/instances/`,
        { id: instanceId },
        { expectStatus: 204 }
      );
    },

    /**
     * Checks if the current deployment is K8s/OpenShift by reading system settings.
     */
    isK8sDeployment: async (page: Page): Promise<boolean> => {
      try {
        const settings = await awxAPI.get<{ IS_K8S?: boolean }>(page, '/settings/system/');
        return settings?.IS_K8S === true;
      } catch {
        return false;
      }
    },

    /**
     * Cleans up an instance group and its associated instances via API.
     * Deletes the instance group first, then deprovisions all instances.
     */
    cleanupInstancesAndGroup: async (
      page: Page,
      instanceGroupId: number | undefined,
      instanceIds: number[]
    ): Promise<void> => {
      if (instanceGroupId) {
        await awxAPI.delete(page, `/instance_groups/${instanceGroupId}/`);
      }
      for (const instanceId of instanceIds) {
        await Instance.api.delete(page, instanceId);
      }
    },

    /**
     * Checks if instances are associated with instance group (K8s reconciliation complete).
     *
     * Returns:
     * - true: Expected instances visible in instance group
     * - false: Instances not associated after 30s (K8s reconciliation issue)
     *
     * @param page - Playwright page object
     * @param instanceGroupId - ID of the instance group
     * @param expectedInstanceCount - Number of instances that should be associated
     * @returns Promise<boolean> - true if instances associated, false otherwise
     */
    checkInstancesAssociated: async (
      page: Page,
      instanceGroupId: number,
      expectedInstanceCount: number
    ): Promise<boolean> => {
      const maxWaitTime = 30000; // 30 seconds
      const checkInterval = 2000; // 2 seconds
      const startTime = Date.now();
      let pollCount = 0;

      while (Date.now() - startTime < maxWaitTime) {
        pollCount++;

        try {
          const instances = await awxAPI.get<{ count: number; results: unknown[] }>(
            page,
            `/instance_groups/${instanceGroupId}/instances/`
          );
          if (!instances) {
            return false;
          }

          // Check if expected number of instances are associated
          if (
            instances.count >= expectedInstanceCount &&
            instances.results.length >= expectedInstanceCount
          ) {
            // eslint-disable-next-line no-console
            console.log(
              `Instance group ${instanceGroupId} has ${instances.count} instances (expected ${expectedInstanceCount}) after ${pollCount} polls (${Date.now() - startTime}ms)`
            );
            return true;
          }
        } catch {
          // API error (404, network issue, etc.) - instance group not accessible
          return false;
        }

        await page.waitForTimeout(checkInterval);
      }

      // K8s reconciliation didn't complete within 30s
      const totalTime = Date.now() - startTime;
      // eslint-disable-next-line no-console
      console.log(
        `Instance group ${instanceGroupId} K8s reconciliation incomplete after ${pollCount} polls in ${totalTime}ms (expected ${expectedInstanceCount} instances, max wait: ${maxWaitTime}ms)`
      );
      return false;
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
