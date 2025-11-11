import { test, expect, Page } from '@playwright/test';
import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import {
  createInstance,
  createInstanceGroup,
  createInstanceGroupAPI,
  deleteInstanceGroup,
  createInstanceAPI,
} from './instance-group-utils';
import { Instance } from '@ansible/awx-ui/interfaces/Instance';
import { InstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { expectRowToContain } from '@ansible/playwright/commands/expectRowToContain';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { awxAPI } from '@ansible/playwright/commands/apiClient';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test.describe('Instance Groups - Instances Tab (K8s)', () => {
  test.beforeEach('Check if running on K8s/OpenShift deployment', async ({ page }) => {
    await page.waitForResponse(
      (response) => response.url().includes('/controller/v2/me') && response.status() === 200,
      { timeout: 10000 }
    );
    // Skip test if not running on K8s/OpenShift deployment
    const isK8s = await isK8sDeployment(page);
    if (!isK8s) {
      test.skip(true, 'Test requires K8s/OpenShift deployment (IS_K8S=true)');
    }
  });

  test(
    'can associate an instance to instance group and disable the instance',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const instanceGroupName = createE2EName();
      const instanceHostname = createE2EName('', { noWhitespace: true });

      await test.step('Create instance and instance group', async () => {
        await createInstance({ hostname: instanceHostname }, page);
        await createInstanceGroup({ name: instanceGroupName }, page);
      });

      await test.step('Navigate to instance group Instances tab', async () => {
        await page.getByRole('tab', { name: 'Instances', exact: true }).click();
      });

      await test.step('Verify empty state and associate instance', async () => {
        await expect(page.getByText('There are currently no instances added')).toBeVisible();
        await expect(
          page.getByText('Please associate an instance by using the button below.')
        ).toBeVisible();

        // Associate instance
        await page.getByRole('button', { name: 'Associate' }).click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByText('Select instances')).toBeVisible();

        await filterTable({ filterLabel: 'Hostname', filterValue: instanceHostname }, page);
        await dialog.locator('input[type="checkbox"]').first().click();
        await dialog.getByRole('button', { name: 'Confirm' }).click();

        await expect(page.getByText('Success', { exact: true }).first()).toBeVisible();
        await dialog.getByRole('button', { name: 'Close' }).click();
        await expect(dialog).not.toBeVisible();
      });

      await test.step('Disable the instance', async () => {
        const instanceRow = page.getByRole('row', { name: instanceHostname });

        await instanceRow
          .getByRole('switch', { name: 'Click to disable instance' })
          .click({ force: true });

        await expect(
          instanceRow.getByRole('switch', { name: 'Click to enable instance' })
        ).not.toBeChecked();

        await expect(
          instanceRow.getByTestId('used-capacity-column-cell').getByText('Unavailable')
        ).toBeVisible();
      });

      await test.step('Remove the instance via Instance list', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
        await clickTableRow({ filterLabel: 'Hostname', text: instanceHostname }, page);
        await clickPageAction('Remove instance', page);
        await confirmAndAssertDeletion(page);
      });

      await test.step('Delete instance group', async () => {
        await deleteInstanceGroup(instanceGroupName, page);
      });
    }
  );

  test(
    'can bulk disassociate instances from instance group',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      let instanceGroup: InstanceGroup;
      const instanceGroupName = createE2EName('', { noWhitespace: true });
      const instances: Instance[] = [];

      await test.step('Create 5 instances', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');

        for (let i = 0; i < 5; i++) {
          const hostname = createE2EName(`instance-to-disassociate-${i}-${instanceGroupName}`, {
            noWhitespace: true,
          });
          const instance = await createInstanceAPI(page, hostname);
          instances.push(instance);
        }
      });

      await test.step('Create instance group with associated instances via API', async () => {
        instanceGroup = await createInstanceGroupAPI(page, {
          name: instanceGroupName,
          policy_instance_list: instances.map((instance) => instance.hostname),
        });
      });

      await test.step('Navigate to instance group Instances tab', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
        await clickTableRow({ filterLabel: 'Name', text: instanceGroup.name }, page);
        await expect(page.getByRole('heading', { name: instanceGroup.name })).toBeVisible();
        await page.getByRole('tab', { name: 'Instances', exact: true }).click();
      });

      await test.step('Verify 5 instances are associated', async () => {
        for (const instance of instances) {
          await expect(page.getByRole('row', { name: instance.hostname })).toBeVisible();
        }
      });

      await test.step('Bulk disassociate all instances', async () => {
        await expect(page.getByRole('button', { name: 'Disassociate' })).toBeVisible();
        await page.locator('input[name="check-all"]').check();
        await page.getByRole('button', { name: 'Disassociate' }).click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByText('Disassociate instance from instance group')).toBeVisible();
        await dialog.locator('#confirm').click();
        await dialog.getByRole('button', { name: 'Disassociate instances' }).click();
      });

      await test.step('Verify instances were disassociated', async () => {
        await expect(page.getByText('There are currently no instances added')).toBeVisible();
        await expect(
          page.getByText('Please associate an instance by using the button below.')
        ).toBeVisible();
      });

      await test.step('Cleanup resources', async () => {
        await awxAPI.delete(page, `/instance_groups/${instanceGroup.id}/`);
        for (const instance of instances) {
          await awxAPI.patch(page, `/instances/${instance.id}/`, {
            node_state: 'deprovisioning',
          });
        }
      });
    }
  );

  test.describe('Health Check', () => {
    let instance: Instance;
    let instanceGroup: InstanceGroup;

    test.beforeEach('Create instance and instance group', async ({ page }) => {
      // Create and associate an instance to an instance group
      instance = await createInstanceAPI(
        page,
        createE2EName('', {
          noWhitespace: true,
        })
      );
      instanceGroup = await createInstanceGroupAPI(page, {
        name: createE2EName(),
        policy_instance_list: [instance.hostname],
      });

      // Navigate to instance group Instances tab
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
      await clickTableRow({ filterLabel: 'Name', text: instanceGroup.name }, page);
      await expect(page.getByRole('heading', { name: instanceGroup.name })).toBeVisible();
      await page.getByRole('tab', { name: 'Instances', exact: true }).click();
    });

    test.afterEach('Delete instance and instance group', async ({ page }) => {
      if (instance) {
        await awxAPI.patch(page, `/instances/${instance.id}/`, {
          node_state: 'deprovisioning',
        });
      }
      if (instanceGroup) {
        await awxAPI.delete(page, `/instance_groups/${instanceGroup.id}/`);
      }
    });

    test(
      'can run health check from toolbar against an instance',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await selectTableRow({ filterLabel: 'Hostname', filterValue: instance.hostname }, page);
        await page
          .getByTestId('page-toolbar')
          .getByRole('button', { name: 'Run health check' })
          .click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByText('Run health checks on these instances')).toBeVisible();
        await dialog.locator('#confirm').click();
        await dialog.getByRole('button', { name: 'Run health check' }).click();
        await expect(page.getByRole('progressbar', { name: 'Processing' })).toBeVisible();
        await dialog.getByRole('button', { name: 'Close' }).click();
        await expect(dialog).not.toBeVisible();

        await expectRowToContain(instance.hostname, 'Running', page, 30000);
      }
    );

    test(
      'can run health check from row action against an instance',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await clickTableRowAction(
          { text: instance.hostname, action: 'Run health check', inKebab: false },
          page
        );
        await expect(
          page.getByTestId('alert-toaster').getByText('Running health check on')
        ).toBeVisible();
        await expectRowToContain(instance.hostname, 'Running', page, 30000);
      }
    );

    test(
      'can run health check from instance details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await clickTableRow({ filterLabel: 'Hostname', text: instance.hostname }, page);

        await expect(page.getByTestId('status')).toHaveText('Installed');
        await expect(page.getByRole('button', { name: 'Run health check' })).toBeVisible();
        await page.getByRole('button', { name: 'Run health check' }).click();
        await expect(
          page.getByTestId('alert-toaster').getByText('Running health check on')
        ).toBeVisible();
        await expect(page.getByTestId('status')).toHaveText('Running');
      }
    );
  });
});

async function isK8sDeployment(page: Page): Promise<boolean> {
  try {
    const settings = await awxAPI.get<{ IS_K8S?: boolean }>(page, '/settings/system/');

    return settings?.IS_K8S === true;
  } catch {
    return false;
  }
}
