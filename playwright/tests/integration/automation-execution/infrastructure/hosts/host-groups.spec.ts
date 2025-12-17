import { expect, test } from '@playwright/test';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Host } from '@ansible/playwright/utils/host';
import { Inventory } from '@ansible/playwright/utils/inventory';
import { InventoryGroup } from '@ansible/playwright/utils';
import { JobTemplate } from '@ansible/playwright/utils/jobTemplate';
import { Organization } from '@ansible/playwright/utils/organization';
import { Project } from '@ansible/playwright/utils/project';
import { AwxHost as HostType } from '@ansible/awx-ui/interfaces/AwxHost';
import { Inventory as InventoryType } from '@ansible/awx-ui/interfaces/Inventory';
import { InventoryGroup as InventoryGroupType } from '@ansible/awx-ui/interfaces/InventoryGroup';
import { JobTemplate as JobTemplateType } from '@ansible/awx-ui/interfaces/JobTemplate';
import { Project as ProjectType } from '@ansible/awx-ui/interfaces/Project';
import { PlatformOrganization as OrganizationType } from '@ansible/platform-ui/interfaces/PlatformOrganization';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/hosts' }));
test.afterEach(setupAfter);

test.describe('Host Groups Tab', () => {
  let organization: OrganizationType;
  let project: ProjectType;
  let inventory: InventoryType;
  let jobTemplate: JobTemplateType;
  let host: HostType;
  let group: InventoryGroupType;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
    inventory = await Inventory.api.create(page, { organization: organization.id });

    group = await InventoryGroup.api.create(page, { inventory: inventory.id });

    host = await Host.api.create(page, { inventory: inventory.id });
    project = await Project.api.create(page, { organization: organization.id });

    await Project.api.sync(page, project.id);

    jobTemplate = await JobTemplate.api.create(page, {
      inventoryId: inventory.id,
      projectId: project.id,
      playbook: 'hello_world.yml',
    });
  });

  test.afterEach(async ({ page }) => {
    await JobTemplate.api.delete(page, jobTemplate.id).catch(() => {});
    await Host.api.delete(page, host.id).catch(() => {});
    await Inventory.api.delete(page, inventory.id).catch(() => {});
    await Project.api.delete(page, project.id).catch(() => {});
    await Organization.api.delete(page, organization.id).catch(() => {});
  });

  test(
    'should associate and disassociate groups at standalone host groups tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await test.step('Associate group to host', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Hosts');
        await clickTableRow({ text: host.name }, page);
        await page.getByRole('tab', { name: 'Groups' }).click();

        await page.getByRole('button', { name: 'Associate groups' }).click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();

        await expect(dialog.getByTestId('page-toolbar')).toBeVisible();

        await page.getByRole('checkbox', { name: 'Select all rows' }).check();
        await page.getByRole('button', { name: 'Confirm', exact: true }).click();
        await expect(dialog).not.toBeVisible();

        await expect(page.getByRole('link', { name: group.name })).toBeVisible();
      });

      await test.step('Edit group via host groups tab', async () => {
        await clickTableRowAction({ text: group.name, action: 'Edit group' }, page);

        await expect(page.getByRole('heading', { name: `Edit ${group.name}` })).toBeVisible();

        const nameField = page.getByRole('textbox', { name: 'Name', exact: true });
        await nameField.fill(`${group.name}-edited`);

        await page.getByRole('button', { name: 'Save group' }).click();

        await expect(page.getByRole('heading', { name: `${group.name}-edited` })).toBeVisible();

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Hosts');
        await clickTableRow({ text: host.name }, page);
        await page.getByRole('tab', { name: 'Groups' }).click();

        await expect(page.getByRole('link', { name: `${group.name}-edited` })).toBeVisible();
      });

      await test.step('Disassociate group from host', async () => {
        await page.getByLabel('Select all').check();
        await page.getByRole('button', { name: 'Disassociate groups' }).click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.locator('#confirm').click();
        await page.getByRole('button', { name: 'Disassociate groups', exact: true }).click();

        await expect(
          page.getByText('There are currently no groups associated with this host')
        ).toBeVisible();
      });
    }
  );
});
