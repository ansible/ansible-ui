import { test, expect, Page } from '@playwright/test';
import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { Instance, InstanceGroup } from '@ansible/playwright/utils';
import type { Instance as InstanceType } from '@ansible/awx-ui/interfaces/Instance';
import type { InstanceGroup as InstanceGroupType } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { expectRowToContain } from '@ansible/playwright/commands/expectRowToContain';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test.describe('Instance Groups - Instances Tab (K8s)', () => {
  test.beforeEach('Check if running on K8s/OpenShift deployment', async ({ page }) => {
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
        await Instance.ui.create(page, { hostname: instanceHostname });
        await InstanceGroup.ui.create(page, { name: instanceGroupName });
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
        await InstanceGroup.ui.delete(page, instanceGroupName);
      });
    }
  );

  test(
    'can bulk disassociate instances from instance group',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      let instanceGroup: InstanceGroupType;
      const instanceGroupName = createE2EName('', { noWhitespace: true });
      const instances: InstanceType[] = [];

      await test.step('Create 5 instances', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');

        for (let i = 0; i < 5; i++) {
          const hostname = createE2EName(`instance-to-disassociate-${i}-${instanceGroupName}`, {
            noWhitespace: true,
          });
          const instance = await Instance.api.create(page, hostname);
          instances.push(instance);
        }
      });

      await test.step('Create instance group with associated instances via API', async () => {
        instanceGroup = await InstanceGroup.api.create(page, {
          name: instanceGroupName,
          policy_instance_list: instances.map((instance) => instance.hostname),
        });

        // Wait for K8s reconciliation before navigating to UI
        const isAssociated = await InstanceGroup.api.checkInstancesAssociated(
          page,
          instanceGroup.id,
          instances.length
        );
        if (!isAssociated) {
          await InstanceGroup.api.cleanupInstancesAndGroup(
            page,
            instanceGroup?.id,
            instances.map((i) => i.id)
          );
          test.skip(
            true,
            'K8s instance association not ready - reconciliation may be slow or failing'
          );
        }
      });

      await test.step('Navigate to instance group Instances tab', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
        await clickTableRow({ filterLabel: 'Name', text: instanceGroup.name }, page);
        await expect(page.getByRole('heading', { name: instanceGroup.name })).toBeVisible();
        await page.getByRole('tab', { name: 'Instances', exact: true }).click();
      });

      await test.step('Verify instances are associated', async () => {
        await expect(page.locator('table')).toBeVisible();
        await expect(page.locator('tbody tr').first()).toBeVisible();
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
        await expect(page.getByText('There are currently no instances added')).toBeVisible({
          timeout: 30000,
        });
        await expect(
          page.getByText('Please associate an instance by using the button below.')
        ).toBeVisible({ timeout: 30000 });
      });

      await test.step('Cleanup resources', async () => {
        await InstanceGroup.api.cleanupInstancesAndGroup(
          page,
          instanceGroup?.id,
          instances.map((i) => i.id)
        );
      });
    }
  );

  test.describe('Health Check', () => {
    let instance: InstanceType;
    let instanceGroup: InstanceGroupType;

    test.beforeEach('Create instance and instance group', async ({ page }) => {
      // Create and associate an instance to an instance group
      instance = await Instance.api.create(
        page,
        createE2EName('', {
          noWhitespace: true,
        })
      );
      instanceGroup = await InstanceGroup.api.create(page, {
        name: createE2EName(),
      });

      // Directly associate the instance (immediate, no K8s reconciliation needed)
      await InstanceGroup.api.associateInstance(page, instanceGroup.id, instance.id);

      // Navigate to instance group Instances tab
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
      await clickTableRow({ filterLabel: 'Name', text: instanceGroup.name }, page);
      await expect(page.getByRole('heading', { name: instanceGroup.name })).toBeVisible();
      await page.getByRole('tab', { name: 'Instances', exact: true }).click();
    });

    test.afterEach('Delete instance and instance group', async ({ page }) => {
      if (instance) {
        await Instance.api.delete(page, instance.id);
      }
      if (instanceGroup) {
        await InstanceGroup.api.delete(page, instanceGroup.id);
      }
    });

    test(
      'can run health check from toolbar against an instance',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const isReady = await Instance.api.checkHealthCheckReady(page, instance.id);
        if (!isReady) {
          test.skip(
            true,
            'Instance not ready for health checks - infrastructure may be provisioning'
          );
        }

        const instanceRow = page.getByRole('row', { name: instance.hostname });
        await expect(instanceRow).toBeVisible({ timeout: 10000 });
        await instanceRow.getByRole('checkbox').check();
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
        const isReady = await Instance.api.checkHealthCheckReady(page, instance.id);
        if (!isReady) {
          test.skip(
            true,
            'Instance not ready for health checks - infrastructure may be provisioning'
          );
        }

        const instanceRow = page.getByRole('row', { name: instance.hostname });
        await expect(instanceRow).toBeVisible({ timeout: 10000 });
        await instanceRow.getByRole('button', { name: 'Run health check' }).click();
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
        const isReady = await Instance.api.checkHealthCheckReady(page, instance.id);
        if (!isReady) {
          test.skip(
            true,
            'Instance not ready for health checks - infrastructure may be provisioning'
          );
        }

        const instanceRow = page.getByRole('row', { name: instance.hostname });
        await expect(instanceRow).toBeVisible({ timeout: 10000 });
        await instanceRow.getByRole('link', { name: instance.hostname }).click();

        await expect(page.getByTestId('status')).toHaveText('Installed');
        await expect(page.getByRole('button', { name: 'Run health check' })).toBeVisible();
        await page.getByRole('button', { name: 'Run health check' }).click();
        await expect(
          page.getByTestId('alert-toaster').getByText('Running health check on')
        ).toBeVisible();
        await expect(page.getByTestId('status')).toHaveText('Running', { timeout: 30000 });
      }
    );
  });
});

async function isK8sDeployment(page: Page): Promise<boolean> {
  return InstanceGroup.api.isK8sDeployment(page);
}
