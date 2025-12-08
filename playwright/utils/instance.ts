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
