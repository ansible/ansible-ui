import { expect, test } from '@playwright/test';
import { bulkDeleteResources } from '@ansible/playwright/commands/bulkDeleteResources';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Host } from '@ansible/playwright/utils/host';
import { Inventory } from '@ansible/playwright/utils/inventory';
import { Organization } from '@ansible/playwright/utils/organization';
import { AwxHost as HostType } from '@ansible/awx-ui/interfaces/AwxHost';
import { Inventory as InventoryType } from '@ansible/awx-ui/interfaces/Inventory';
import { PlatformOrganization as OrganizationType } from '@ansible/platform-ui/interfaces/PlatformOrganization';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test.describe('Host CRUD Operations', () => {
  let organization: OrganizationType;
  let inventory: InventoryType;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
    inventory = await Inventory.api.create(page, { organization: organization.id });
  });

  test.afterEach(async ({ page }) => {
    await Inventory.api.delete(page, inventory.id).catch(() => {});
    await Organization.api.delete(page, organization.id).catch(() => {});
  });

  test('should create, edit and delete a host', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(120000);
    let hostName: string;

    await test.step('Create host', async () => {
      hostName = await Host.ui.create(page, {
        inventoryName: inventory.name,
        description: 'E2E test standalone host creation',
        variables: 'ansible_connection: local',
      });
    });

    await test.step('Edit host via list view', async () => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Hosts');
      await clickTableRowAction({ text: hostName, action: 'Edit host' }, page);

      await expect(page.getByRole('heading', { name: `Edit ${hostName}` })).toBeVisible();
      await page.getByRole('textbox', { name: 'Description', exact: true }).clear();
      await page
        .getByRole('textbox', { name: 'Description', exact: true })
        .fill('E2E test standalone host edit');

      await page.getByRole('button', { name: 'Save host', exact: true }).click();

      await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();
      await expect(page.getByTestId('description')).toContainText('E2E test standalone host edit');
    });

    await test.step('Delete host from details view', async () => {
      await Host.ui.delete(page, hostName);
    });
  });

  test('should bulk delete hosts', { tag: ['@not_mock'] }, async ({ page }) => {
    const hosts: HostType[] = [];

    await test.step('Create multiple hosts', async () => {
      for (let i = 0; i < 3; i++) {
        hosts.push(
          await Host.api.create(page, {
            description: `E2E test bulk host deletion ${i}`,
            inventory: inventory.id,
          })
        );
      }
    });

    await test.step('Bulk delete hosts via list view', async () => {
      await bulkDeleteResources(
        {
          resourceType: 'hosts',
          resourceNames: hosts.map((host) => host.name),
          navigationPath: ['Automation Execution', 'Infrastructure', 'Hosts'],
        },
        page
      );
    });
  });
});
