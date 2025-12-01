/** @deprecated Use InstanceGroup from '@ansible/playwright/utils' instead */

import { Page, expect } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { awxAPI } from '@ansible/playwright/commands/apiClient';
import { Instance } from '@ansible/awx-ui/interfaces/Instance';
import { InstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';

export async function createInstanceGroup(options: { name?: string }, page: Page) {
  const instanceGroupName = options.name ?? createE2EName('instanceGroup');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
  await page.getByLabel('dropdown toggle', { exact: true }).click();
  await page.getByRole('menuitem', { name: 'Create instance group' }).click();
  await page.getByPlaceholder('Enter instance group name').fill(instanceGroupName);
  await page.getByRole('button', { name: 'Create instance group' }).click();
  await expect(page.getByRole('heading', { name: instanceGroupName, exact: true })).toBeVisible();
  await expect(page.locator('#name')).toContainText(instanceGroupName);
  return instanceGroupName;
}

export async function deleteInstanceGroup(instanceGroupName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
  await clickTableRow({ text: instanceGroupName }, page);
  await clickPageAction('Delete instance group', page);
  await confirmAndAssertDeletion(page);
}

export async function createInstance(options: { hostname?: string }, page: Page) {
  const hostname = options.hostname ?? createE2EName();
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
  await expect(page.getByRole('heading', { name: 'Instances' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create instance' })).toBeVisible();
  await page.getByRole('button', { name: 'Create instance' }).click();
  await expect(page.getByRole('heading', { name: 'Create instance' })).toBeVisible();
  await page.getByLabel('Host name').fill(hostname);
  await page.getByRole('button', { name: 'Create instance' }).click();
  await expect(page.getByRole('heading', { name: hostname })).toBeVisible();
  return hostname;
}

/**
 * Creates an instance via API (requires K8s/OpenShift deployment)
 */
export async function createInstanceAPI(page: Page, hostname: string): Promise<Instance> {
  const instance = await awxAPI.post<Instance>(page, '/instances/', {
    hostname,
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
}

/**
 * Creates an instance group via API with optional instance associations
 */
export async function createInstanceGroupAPI(
  page: Page,
  options: { name?: string; policy_instance_list?: string[] }
): Promise<InstanceGroup> {
  const instanceGroupName = options.name ?? createE2EName('instanceGroup');

  const instanceGroup = await awxAPI.post<InstanceGroup>(page, '/instance_groups/', {
    name: instanceGroupName,
    policy_instance_list: options.policy_instance_list ?? [],
  });

  if (!instanceGroup) {
    throw new Error('Failed to create instance group: no response from API');
  }

  return instanceGroup;
}
