import { expect, test } from '@playwright/test';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
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

test.describe('Host Facts Tab', () => {
  let organization: OrganizationType;
  let inventory: InventoryType;
  let host: HostType;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
    inventory = await Inventory.api.create(page, { organization: organization.id });
    host = await Host.api.create(page, { inventory: inventory.id });
  });

  test.afterEach(async ({ page }) => {
    await Host.api.delete(page, host.id).catch(() => {});
    await Inventory.api.delete(page, inventory.id).catch(() => {});
    await Organization.api.delete(page, organization.id).catch(() => {});
  });

  test('should view host facts in standalone host', { tag: ['@not_mock'] }, async ({ page }) => {
    await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Hosts');
    await clickTableRow({ text: host.name }, page);
    await expect(page.getByRole('heading', { name: host.name, exact: true })).toBeVisible();

    const url = page.url();
    const hostIdMatch = url.match(/\/hosts\/(\d+)\//);
    const hostId = hostIdMatch ? hostIdMatch[1] : '';

    // Mock the ansible_facts endpoint
    await page.route(`**/api/controller/v2/hosts/${hostId}/ansible_facts/`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ansible_dns: {
            search: ['dev-ui.svc.cluster.local', 'svc.cluster.local', 'cluster.local'],
            options: {
              ndots: '5',
            },
            nameservers: ['10.43.0.10'],
          },
        }),
      });
    });

    await page.getByRole('tab', { name: 'Facts' }).click();

    const codeBlock = page.getByTestId('code-block-value');
    await expect(codeBlock).toContainText('ansible_dns');
    await expect(codeBlock).toContainText('dev-ui.svc.cluster.local');
    await expect(codeBlock).toContainText('svc.cluster.local');
    await expect(codeBlock).toContainText('cluster.local');
    await expect(codeBlock).toContainText('10.43.0.10');
  });
});
