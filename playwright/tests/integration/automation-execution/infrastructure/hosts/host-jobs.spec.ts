import { expect, test } from '@playwright/test';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Host } from '@ansible/playwright/utils/host';
import { Inventory } from '@ansible/playwright/utils/inventory';
import { JobTemplate } from '@ansible/playwright/utils/jobTemplate';
import { Organization } from '@ansible/playwright/utils/organization';
import { Project } from '@ansible/playwright/utils/project';
import { AwxHost as HostType } from '@ansible/awx-ui/interfaces/AwxHost';
import { Inventory as InventoryType } from '@ansible/awx-ui/interfaces/Inventory';
import { JobTemplate as JobTemplateType } from '@ansible/awx-ui/interfaces/JobTemplate';
import { Project as ProjectType } from '@ansible/awx-ui/interfaces/Project';
import { PlatformOrganization as OrganizationType } from '@ansible/platform-ui/interfaces/PlatformOrganization';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test.describe('Host Jobs Tab', () => {
  let organization: OrganizationType;
  let project: ProjectType;
  let inventory: InventoryType;
  let jobTemplate: JobTemplateType;
  let host: HostType;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
    inventory = await Inventory.api.create(page, { organization: organization.id });
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
    'should relaunch jobs from host jobs tab and bulk delete jobs',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(120000);

      await test.step('Launch job from inventory', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: inventory.name }, page);
        await page.getByRole('tab', { name: 'Job Templates' }).click();

        await clickTableRowAction({ text: jobTemplate.name, action: 'Launch template' }, page);

        await expect(page.getByTestId('page-title')).toHaveText(jobTemplate.name);
        await expect(page.getByRole('tab', { name: 'Output' })).toHaveAttribute(
          'aria-selected',
          'true'
        );

        await expect(
          page
            .getByTestId('pending-status')
            .or(page.getByTestId('waiting-status'))
            .or(page.getByTestId('running-status'))
            .or(page.getByTestId('success-status'))
        ).toBeVisible({ timeout: 30000 });
      });

      await test.step('Relaunch job from host jobs tab', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Hosts');
        await clickTableRow({ text: host.name }, page);
        await expect(page.getByRole('heading', { name: host.name, exact: true })).toBeVisible();
        await page.getByRole('tab', { name: 'Jobs' }).click();

        await clickTableRowAction({ text: jobTemplate.name, action: 'Relaunch job' }, page);

        await expect(page.getByTestId('page-title')).toHaveText(jobTemplate.name);
        await expect(page.getByRole('tab', { name: 'Output' })).toHaveAttribute(
          'aria-selected',
          'true'
        );

        await expect(
          page.getByTestId('running-status').or(page.getByTestId('success-status'))
        ).toBeVisible({ timeout: 30000 });
      });

      await test.step('Bulk delete jobs from host jobs tab', async () => {
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Hosts');
        await clickTableRow({ text: host.name }, page);
        await expect(page.getByRole('heading', { name: host.name, exact: true })).toBeVisible();
        await page.getByRole('tab', { name: 'Jobs' }).click();

        await page.getByRole('toolbar').isVisible();
        await clearTableFilters(page);

        await expect(page.locator('tbody tr')).toHaveCount(2);

        await page.getByLabel('Select all').check();
        await page.getByLabel('toolbar actions').click();
        await page.getByRole('menuitem', { name: 'Delete jobs' }).click();

        await confirmAndAssertDeletion(page);
      });
    }
  );
});
