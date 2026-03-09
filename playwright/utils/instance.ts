import { Page, expect } from '@playwright/test';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { awxAPI } from '../commands/apiClient';
import { Instance as InstanceType } from '@ansible/awx-ui/interfaces/Instance';

export interface CreateInstanceOptions {
  hostname?: string;
  listenerPort?: number;
  managedByPolicy?: boolean;
  peersFromControlNodes?: boolean;
}

export const Instance = {
  api: {
    /**
     * Creates an instance via API (requires K8s/OpenShift deployment)
     */
    create: async (page: Page, hostname: string, listenerPort?: number): Promise<InstanceType> => {
      const instance = await awxAPI.post<InstanceType>(page, '/instances/', {
        hostname,
        listener_port: listenerPort ?? null,
        enabled: true,
        managed_by_policy: true,
        peers_from_control_nodes: false,
        node_state: 'installed',
        node_type: 'execution',
      });

      if (!instance) {
        throw new Error('Failed to create instance: no response from API');
      }

      return instance;
    },
    delete: async (page: Page, instanceId: number): Promise<void> => {
      await awxAPI.patch(page, `/instances/${instanceId}/`, {
        node_state: 'deprovisioning',
      });
    },
    /**
     * Checks if instance is ready for health checks by verifying instance state.
     *
     * Returns:
     * - true: Instance ready for health checks (node_state is "ready" or "installed")
     * - false: Instance not ready (stuck in "provisioning" or error states)
     *
     * @param page - Playwright page object
     * @param instanceId - ID of the instance to monitor
     * @returns Promise<boolean> - true if ready, false otherwise
     */
    checkHealthCheckReady: async (page: Page, instanceId: number): Promise<boolean> => {
      const maxWaitTime = 30000; // 30 seconds
      const checkInterval = 2000; // 2 seconds
      const startTime = Date.now();
      let pollCount = 0;

      while (Date.now() - startTime < maxWaitTime) {
        pollCount++;

        try {
          const instance = await awxAPI.get<InstanceType>(page, `/instances/${instanceId}/`);

          if (!instance) {
            return false;
          }

          const nodeState = String(instance.node_state || '');

          // Instance in error/failure state
          if (
            nodeState === 'provision-fail' ||
            nodeState === 'deprovision-fail' ||
            nodeState === 'unavailable'
          ) {
            const elapsed = Date.now() - startTime;
            // eslint-disable-next-line no-console
            console.log(
              `Instance ${instanceId} in error state "${nodeState}" after ${pollCount} polls (${elapsed}ms)`
            );
            return false;
          }

          // Instance ready for operations (installed or ready state)
          if (nodeState === 'ready' || nodeState === 'installed') {
            return true;
          }
        } catch {
          // API error (404, network issue, etc.) - instance not accessible
          return false;
        }

        await page.waitForTimeout(checkInterval);
      }

      // Stuck in provisioning or unknown state for 30s
      const totalTime = Date.now() - startTime;
      // eslint-disable-next-line no-console
      console.log(
        `Instance ${instanceId} not ready after ${pollCount} polls in ${totalTime}ms (max: ${maxWaitTime}ms)`
      );
      return false;
    },
  },

  ui: {
    create: async (page: Page, options: CreateInstanceOptions = {}): Promise<string> => {
      const hostname = options.hostname ?? createE2EName('', { noWhitespace: true });
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
      await expect(page.getByRole('heading', { name: 'Instances' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create instance' })).toBeVisible();
      await page.getByRole('button', { name: 'Create instance' }).click();
      await expect(page.getByRole('heading', { name: 'Create instance' })).toBeVisible();
      await page.getByLabel('Host name').fill(hostname);
      await page.getByRole('button', { name: 'Create instance' }).click();
      await expect(page.getByRole('heading', { name: hostname })).toBeVisible();
      return hostname;
    },
  },
} as const;
