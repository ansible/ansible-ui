import { test, expect, type Page } from '@playwright/test';
import type { Instance as InstanceType } from '@ansible/awx-ui/interfaces/Instance';
import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { expectRowToContain } from '@ansible/playwright/commands/expectRowToContain';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { awxAPI } from '@ansible/playwright/commands/apiClient';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { Instance } from '@ansible/playwright/utils';

async function isK8sDeployment(page: Page): Promise<boolean> {
  try {
    const settings = await awxAPI.get<{ IS_K8S?: boolean }>(page, '/settings/system/');
    return settings?.IS_K8S === true;
  } catch {
    return false;
  }
}

test.describe('Instances (K8s)', () => {
  test.beforeEach(setupBefore({ path: '/' }));
  test.afterEach(setupAfter);

  test.beforeEach('Check if running on K8s/OpenShift deployment', async ({ page }) => {
    await page.waitForResponse(
      (response) => response.url().includes('/controller/v2/me') && response.status() === 200,
      { timeout: 10000 }
    );
    const isK8s = await isK8sDeployment(page);
    if (!isK8s) {
      test.skip(true, 'Test requires K8s/OpenShift deployment (IS_K8S=true)');
    }
  });

  test.describe('Create', () => {
    test('can create instance via UI', { tag: ['@not_mock'] }, async ({ page }) => {
      const createResponsePromise = page.waitForResponse(
        (response) => response.url().includes('/instances/') && response.status() === 201
      );
      const instanceHostname = createE2EName('instance', { noWhitespace: true });

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
      await expect(page.getByRole('heading', { name: 'Instances' })).toBeVisible();

      await page.getByRole('button', { name: 'Create instance' }).click();
      await expect(page.getByRole('heading', { name: 'Create instance' })).toBeVisible();

      await page.getByTestId('hostname').fill(instanceHostname);
      await page.getByTestId('listener-port').fill('9999');
      await page.getByTestId('managed_by_policy').click();
      await page.getByTestId('peers_from_control_nodes').click();

      await page.getByRole('button', { name: 'Create instance' }).click();

      // Verify creation
      const createResponse = await createResponsePromise;
      const instance = (await createResponse.json()) as InstanceType;

      await expect(page.getByRole('heading', { name: instanceHostname })).toBeVisible();
      await expect(page.getByTestId('name')).toContainText(instanceHostname);
      await expect(page.getByTestId('node-type')).toContainText('Execution');
      await expect(page.getByTestId('status')).toContainText('Installed');
      await expect(page.getByTestId('listener-port')).toContainText('9999');

      // Cleanup
      await Instance.api.delete(page, instance.id);
    });
  });

  test.describe('Edit and View', () => {
    let instance: InstanceType;

    test.beforeEach('Create instance', async ({ page }) => {
      const hostname = createE2EName('instance', { noWhitespace: true });
      instance = await Instance.api.create(page, hostname);
    });

    test.afterEach('Delete instance', async ({ page }) => {
      if (instance) {
        await Instance.api.delete(page, instance.id);
      }
    });

    test(
      'can edit instance and validate listener port requirement',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
        await clickTableRowAction(
          {
            filterLabel: 'Hostname',
            text: instance.hostname,
            action: 'Edit instance',
            inKebab: false,
          },
          page
        );

        await expect(
          page.getByRole('heading', { name: `Edit ${instance.hostname}` })
        ).toBeVisible();

        // Verify initial state
        await expect(page.getByTestId('enabled')).toBeChecked();
        await expect(page.getByTestId('managed_by_policy')).toBeChecked();
        await expect(page.getByTestId('peers_from_control_nodes')).not.toBeChecked();

        // Validate listener port is required when peers from control nodes is checked
        await page.getByTestId('peers_from_control_nodes').click();
        await page.getByRole('button', { name: 'Save instance' }).click();
        await expect(page.getByText('Listener port is required')).toBeVisible();

        // Fill required field and save
        await page.getByTestId('listener-port').fill('9999');
        await page.getByRole('button', { name: 'Save instance' }).click();

        // Verify changes
        await expect(page.getByRole('heading', { name: instance.hostname })).toBeVisible();
        await expect(page.getByTestId('listener-port')).toContainText('9999');
      }
    );

    test(
      'can verify download bundle link on details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
        await clickTableRow({ filterLabel: 'Hostname', text: instance.hostname }, page);

        await expect(page.getByRole('heading', { name: instance.hostname })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Details' })).toHaveAttribute(
          'aria-selected',
          'true'
        );

        // Verify download bundle link exists and has correct attributes
        const downloadLink = page.getByTestId('download-bundle').getByRole('link');
        await expect(downloadLink).toBeVisible();
        await expect(downloadLink).toHaveAttribute('download');
        await expect(downloadLink).toHaveAttribute('href', instance.related?.install_bundle || '');
      }
    );

    test(
      'can disable instance and verify status toggle',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
        await clickTableRow({ filterLabel: 'Hostname', text: instance.hostname }, page);

        // Verify enabled state
        await expect(page.getByRole('switch', { name: 'Enabled' })).toBeVisible();

        await clickPageAction('Edit instance', page);
        await expect(
          page.getByRole('heading', { name: `Edit ${instance.hostname}` })
        ).toBeVisible();

        // Disable instance
        const enabledCheckbox = page.getByTestId('enabled');
        await expect(enabledCheckbox).toBeChecked();
        await enabledCheckbox.click();
        await expect(enabledCheckbox).not.toBeChecked();

        await page.getByRole('button', { name: 'Save instance' }).click();

        // Verify disabled state
        await expect(page.getByRole('heading', { name: instance.hostname })).toBeVisible();
        await expect(page.getByRole('switch', { name: 'Disabled' })).toBeVisible();
      }
    );
  });

  test.describe('Remove', () => {
    test('can remove instance from details page', { tag: ['@not_mock'] }, async ({ page }) => {
      const hostname = createE2EName('instance-remove', { noWhitespace: true });
      const instance = await Instance.api.create(page, hostname);

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
      await clickTableRow({ filterLabel: 'Hostname', text: instance.hostname }, page);

      await expect(page.getByRole('heading', { name: instance.hostname })).toBeVisible();

      await clickPageAction('Remove instance', page);
      await confirmAndAssertDeletion(page);

      await expect(page.getByRole('dialog')).not.toBeVisible();
      await expect(page.getByRole('heading', { name: 'Instances', exact: true })).toBeVisible();
    });

    test('can bulk remove instances', { tag: ['@not_mock'] }, async ({ page }) => {
      const instances: InstanceType[] = [];
      for (let i = 0; i < 5; i++) {
        const hostname = createE2EName(`instance-bulk-${i}`, { noWhitespace: true });
        const instance = await Instance.api.create(page, hostname);
        instances.push(instance);
      }

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
      await clearTableFilters(page);

      for (const instance of instances) {
        await filterTable({ filterLabel: 'Hostname', filterValue: instance.hostname }, page);
        await expect(page.locator('tr', { hasText: instance.hostname })).toBeVisible({
          timeout: 10000,
        });
        await page.getByRole('checkbox', { name: 'Select row' }).first().click();
        await clearTableFilters(page);
      }

      await page.getByRole('button', { name: 'toolbar actions' }).click();
      await expect(page.getByRole('menuitem', { name: 'Remove instance' })).toBeVisible();
      await page.getByRole('menuitem', { name: 'Remove instance' }).click();

      await confirmAndAssertDeletion(page);

      await expect(page.getByRole('dialog')).not.toBeVisible();
      await expect(page.getByRole('heading', { name: 'Instances', exact: true })).toBeVisible();
    });
  });

  test.describe('Health Checks', () => {
    let instance: InstanceType;

    test.beforeEach('Create instance', async ({ page }) => {
      const hostname = createE2EName('instance-health', { noWhitespace: true });
      instance = await Instance.api.create(page, hostname);
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
    });

    test.afterEach('Delete instance', async ({ page }) => {
      if (instance) {
        await Instance.api.delete(page, instance.id);
      }
    });

    test('can run health check from list toolbar', { tag: ['@not_mock'] }, async ({ page }) => {
      await selectTableRow({ filterLabel: 'Hostname', filterValue: instance.hostname }, page);
      await page.getByRole('button', { name: 'Actions' }).click();
      await expect(page.getByRole('menuitem', { name: 'Run health check' })).toBeVisible();
      await page.getByRole('menuitem', { name: 'Run health check' }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('Run health checks on these instances')).toBeVisible();
      await expect(
        dialog.getByRole('gridcell', { name: instance.hostname, exact: true })
      ).toBeVisible();

      await dialog.locator('#confirm').click();
      await dialog.getByRole('button', { name: 'Run health check' }).click();

      await expect(page.getByRole('progressbar', { name: 'Processing' })).toBeVisible();
      await dialog.getByRole('button', { name: 'Close' }).click();
      await expect(dialog).not.toBeVisible();

      await expectRowToContain(instance.hostname, 'Running', page, 30000);
    });

    test('can run health check from details page', { tag: ['@not_mock'] }, async ({ page }) => {
      await clickTableRow({ filterLabel: 'Hostname', text: instance.hostname }, page);
      await expect(page.getByRole('heading', { name: instance.hostname })).toBeVisible();

      await expect(page.getByRole('button', { name: 'Run health check' })).toBeVisible();
      await page.getByRole('button', { name: 'Run health check' }).click();

      await expect(
        page.getByTestId('alert-toaster').getByText('Running health check on')
      ).toBeVisible();
      await expect(page.getByTestId('status')).toContainText('Running');
    });

    test('can run health check from list row action', { tag: ['@not_mock'] }, async ({ page }) => {
      await clickTableRowAction(
        {
          filterLabel: 'Hostname',
          text: instance.hostname,
          action: 'Run health check',
          inKebab: false,
        },
        page
      );

      await expect(
        page.getByTestId('alert-toaster').getByText('Running health check on')
      ).toBeVisible();
      await expectRowToContain(instance.hostname, 'Running', page, 30000);
    });
  });

  test.describe('Peers Tab', () => {
    let instance: InstanceType;
    let instanceToAssociate: InstanceType;

    test.beforeEach('Create instances', async ({ page }) => {
      const hostname1 = createE2EName('instance-peers', { noWhitespace: true });
      const hostname2 = createE2EName('instance-to-associate', { noWhitespace: true });
      instance = await Instance.api.create(page, hostname1, 8888);
      instanceToAssociate = await Instance.api.create(page, hostname2, 9999);
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
    });

    test.afterEach('Delete instances', async ({ page }) => {
      if (instance) {
        await Instance.api.delete(page, instance.id);
      }
      if (instanceToAssociate) {
        await Instance.api.delete(page, instanceToAssociate.id);
      }
    });

    test('can associate and disassociate peers', { tag: ['@not_mock'] }, async ({ page }) => {
      // Navigate to peers tab
      await clickTableRow({ filterLabel: 'Hostname', text: instance.hostname }, page);
      await page.getByRole('tab', { name: 'Peers', exact: true }).click();

      // Associate peer
      await page.getByRole('button', { name: 'Associate peers' }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('Select peer addresses')).toBeVisible();

      await filterTable(
        { filterLabel: 'Hostname', filterValue: instanceToAssociate.hostname },
        page
      );
      await dialog.locator('input[type="checkbox"]').first().click();
      await dialog.getByRole('button', { name: 'Associate peers' }).click();

      await expect(page.getByText('Success').first()).toBeVisible();

      // Verify association
      await clickTableRow({ filterLabel: 'Hostname', text: instanceToAssociate.hostname }, page);
      await expect(page.getByRole('heading', { name: instanceToAssociate.hostname })).toBeVisible();

      await page.goBack();
      await expect(page.getByRole('heading', { name: instance.hostname })).toBeVisible();

      // Disassociate peer
      await selectTableRow(
        { filterLabel: 'Hostname', filterValue: instanceToAssociate.hostname },
        page
      );
      await page.getByRole('button', { name: 'Actions' }).click();
      await page.getByRole('menuitem', { name: 'Disassociate peers' }).click();

      const disassociateDialog = page.getByRole('dialog');
      await expect(disassociateDialog).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Disassociate peers' })).toBeVisible();
      await expect(
        disassociateDialog.getByRole('gridcell', {
          name: instanceToAssociate.hostname,
          exact: true,
        })
      ).toBeVisible();

      await disassociateDialog.locator('#confirm').click();
      await disassociateDialog.getByRole('button', { name: 'Disassociate peers' }).click();

      // Verify disassociation
      await expect(page.getByText('Success').first()).toBeVisible({ timeout: 30000 });
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await clearTableFilters(page);
      await expect(page.getByRole('heading', { name: 'No peers found' })).toBeVisible();
    });
  });

  test.describe('Listener Addresses Tab', () => {
    let instance: InstanceType;

    test.beforeEach('Create instance', async ({ page }) => {
      const hostname = createE2EName('instance-listener', { noWhitespace: true });
      instance = await Instance.api.create(page, hostname, 8888);
    });

    test.afterEach('Delete instance', async ({ page }) => {
      if (instance) {
        await Instance.api.delete(page, instance.id);
      }
    });

    test(
      'can view listener addresses and designated port',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instances');
        await clickTableRow({ filterLabel: 'Hostname', text: instance.hostname }, page);
        await page.getByRole('tab', { name: 'Listener Addresses', exact: true }).click();

        await expect(
          page.getByRole('gridcell', { name: instance.hostname, exact: true })
        ).toBeVisible();
        await expect(
          page.getByRole('gridcell', {
            name: instance.listener_port?.toString() || '',
            exact: true,
          })
        ).toBeVisible();

        if (instance.protocol) {
          await expect(
            page.getByRole('gridcell', { name: instance.protocol, exact: true })
          ).toBeVisible();
        }
      }
    );
  });
});
