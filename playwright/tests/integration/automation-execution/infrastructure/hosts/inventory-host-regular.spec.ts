import { expect, test } from '@playwright/test';
import { clickPageAction } from '../../../../../commands/clickPageAction';
import { clickTableRow } from '../../../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../../commands/createE2EName';
import { getTableRow } from '../../../../../commands/getTableRow';
import { navigateTo } from '../../../../../commands/navigateTo';
import { runAdHocCommandWizard } from '../../../../../commands/runAdHocCommandWizard';
import { setupAfter, setupBefore } from '../../../../../commands/setup';
import {
  Organization,
  Project,
  JobTemplate,
  Credential,
  ExecutionEnvironment,
  Inventory,
  InventoryHost,
} from '@ansible/playwright/utils';

test.describe('Inventory Host - Regular Inventory Tests', () => {
  let organizationName: string;
  let inventoryName: string;

  test.beforeEach(async ({ page }) => {
    await setupBefore({ path: '/execution/infrastructure/inventories' })({ page });

    // Create shared resources on first test (resource optimization)
    if (!organizationName) {
      organizationName = await Organization.ui.create(page);
      inventoryName = await Inventory.ui.create(page, {
        inventoryName: createE2EName('inventory'),
        organizationName,
      });
    }
  });

  test.afterEach(setupAfter);

  test(
    'can create, edit, associate, and disassociate groups at inventory -> hosts -> groups tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(4 * 60 * 1000);

      const hostName = await InventoryHost.ui.create(page, inventoryName, {
        description: 'Test host for groups',
        variables: 'test: true',
      });

      const groupName1 = createE2EName('group');
      const groupName2 = createE2EName('group');

      // Create first group at inventory level and associate it to host
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: inventoryName }, page);
      await page.getByRole('tab', { name: 'Groups' }).click();
      await page.getByText('Create group', { exact: true }).click();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(groupName1);
      await page.getByRole('button', { name: 'Create group', exact: true }).click();
      await expect(page.getByRole('heading', { name: groupName1, exact: true })).toBeVisible();

      // Associate first group to host immediately
      await page.getByRole('tab', { name: 'Hosts' }).click();
      await page.getByText('Add existing host', { exact: true }).click();
      const addHostDialog = page.getByRole('dialog');
      await expect(addHostDialog).toBeVisible();
      await addHostDialog.getByLabel('Select all').check();
      await page.getByRole('button', { name: 'Add hosts', exact: true }).click();
      await expect(addHostDialog).not.toBeVisible();

      // Now navigate to host and edit the group name
      await InventoryHost.ui.navigateToGroupsTab(inventoryName, hostName, page);
      const groupRow1 = await getTableRow(page, groupName1);
      await groupRow1.getByLabel('Edit group').click();
      await expect(page.getByRole('heading', { name: `Edit ${groupName1}` })).toBeVisible();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(`${groupName1}-changed`);
      await page.getByRole('button', { name: 'Save group', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: `${groupName1}-changed`, exact: true })
      ).toBeVisible();

      // Create second group and associate to host
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: inventoryName }, page);
      await page.getByRole('tab', { name: 'Groups' }).click();
      await page.getByText('Create group', { exact: true }).click();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(groupName2);
      await page.getByRole('button', { name: 'Create group', exact: true }).click();
      await expect(page.getByRole('heading', { name: groupName2, exact: true })).toBeVisible();

      // Associate second group to host
      await page.getByRole('tab', { name: 'Hosts' }).click();
      await page.getByText('Add existing host', { exact: true }).click();
      const addHostDialog2 = page.getByRole('dialog');
      await expect(addHostDialog2).toBeVisible();
      await addHostDialog2.getByLabel('Select all').check();
      await page.getByRole('button', { name: 'Add hosts', exact: true }).click();
      await expect(addHostDialog2).not.toBeVisible();

      // Verify both groups are associated
      await InventoryHost.ui.navigateToGroupsTab(inventoryName, hostName, page);
      await expect(page.locator('tbody')).toContainText(`${groupName1}-changed`);
      await expect(page.locator('tbody')).toContainText(groupName2);

      // Disassociate all groups
      await page.getByLabel('Select all').check();
      await page.getByRole('button', { name: 'Disassociate groups' }).click();
      const disassociateDialog = page.getByRole('dialog');
      await expect(disassociateDialog).toBeVisible();
      await disassociateDialog.locator('#confirm').click();
      await page.getByRole('button', { name: 'Disassociate groups', exact: true }).click();
      await expect(
        page.getByText('There are currently no groups associated with this host')
      ).toBeVisible();

      // Re-associate all groups
      await InventoryHost.ui.navigateToGroupsTab(inventoryName, hostName, page);
      await page.getByRole('button', { name: 'Associate groups' }).click();
      const associateDialog = page.getByRole('dialog');
      await expect(associateDialog).toBeVisible();
      await associateDialog.getByLabel('Select all').check();
      await page.getByRole('button', { name: 'Confirm', exact: true }).click();
      await expect(associateDialog).not.toBeVisible();

      // Verify both groups are back
      await InventoryHost.ui.navigateToGroupsTab(inventoryName, hostName, page);
      await expect(page.locator('tbody')).toContainText(`${groupName1}-changed`);
      await expect(page.locator('tbody')).toContainText(groupName2);

      // Disassociate only groupName2
      await InventoryHost.ui.navigateToGroupsTab(inventoryName, hostName, page);
      const groupRow2 = await getTableRow(page, groupName2);
      await groupRow2.getByLabel('Select row').check();
      await page.getByRole('button', { name: 'Disassociate groups' }).click();
      const disassociateDialog2 = page.getByRole('dialog');
      await expect(disassociateDialog2).toBeVisible();
      await disassociateDialog2.locator('#confirm').click();
      await page.getByRole('button', { name: 'Disassociate groups', exact: true }).click();
      await expect(disassociateDialog2).not.toBeVisible({ timeout: 10000 });

      // Verify only groupName1-changed remains
      await InventoryHost.ui.navigateToGroupsTab(inventoryName, hostName, page);
      await expect(page.locator('tbody')).toContainText(`${groupName1}-changed`);
      await expect(page.locator('tbody')).not.toContainText(groupName2);

      await InventoryHost.ui.bulkDelete(page, inventoryName);
    }
  );

  test(
    'can create, edit and delete inventory host from list view',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);

      const hostName = await InventoryHost.ui.create(page, inventoryName, {
        description: 'This is the description',
        variables: 'test: true',
      });

      await InventoryHost.ui.navigateToInventoryHostsTab(inventoryName, page);
      const hostRow = await getTableRow(page, hostName);
      await hostRow.getByLabel('Edit host').click();
      await expect(page.getByRole('heading', { name: `Edit ${hostName}` })).toBeVisible();
      await page.getByRole('textbox', { name: 'Description', exact: true }).clear();
      await page
        .getByRole('textbox', { name: 'Description', exact: true })
        .fill('This is the description edited');
      await page.getByRole('button', { name: 'Save host', exact: true }).click();
      await expect(page.locator('#description')).toContainText('This is the description edited');
      await page.getByRole('tab', { name: 'Back to Hosts' }).click();

      await InventoryHost.ui.deleteFromList(page, inventoryName, hostName);
    }
  );

  test(
    'can edit and delete inventory host from details view',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);

      const hostName = await InventoryHost.ui.create(page, inventoryName, {
        description: 'This is the description',
        variables: 'test: true',
      });

      await InventoryHost.ui.navigateToDetails(inventoryName, hostName, page);
      await clickPageAction('Edit host', page);
      await expect(page.getByRole('heading', { name: `Edit ${hostName}` })).toBeVisible();
      await page.getByRole('textbox', { name: 'Description', exact: true }).clear();
      await page
        .getByRole('textbox', { name: 'Description', exact: true })
        .fill('This is the description edited');
      await page.getByRole('button', { name: 'Save host', exact: true }).click();
      await expect(page.locator('#description')).toContainText('This is the description edited');
      await expect(page.getByRole('heading', { name: hostName, exact: true })).toBeVisible();

      // Already on details page after edit, delete directly
      await clickPageAction('Delete host', page);
      await confirmAndAssertDeletion(page);
    }
  );

  test(
    'can bulk delete multiple hosts from the hosts tab of an inventory',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);

      await InventoryHost.ui.create(page, inventoryName);
      await InventoryHost.ui.create(page, inventoryName);

      await InventoryHost.ui.bulkDelete(page, inventoryName);
    }
  );

  test(
    'can launch a job template that uses an inventory with a particular host and view the job on the host jobs tab inside the inventory',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(4 * 60 * 1000);

      const hostName = await InventoryHost.ui.create(page, inventoryName);

      const projectName = await Project.ui.create(page, { organizationName });
      const jobTemplateName = await JobTemplate.ui.create(page, { inventoryName, projectName });

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: inventoryName }, page);
      await page.getByRole('tab', { name: 'Job Templates' }).click();
      const templateRow = await getTableRow(page, jobTemplateName);
      await templateRow.getByLabel('Launch template').click();
      await expect(page.getByRole('heading', { name: jobTemplateName }).first()).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Output' })).toBeVisible();

      await InventoryHost.ui.navigateToDetails(inventoryName, hostName, page);
      await page.getByRole('tab', { name: 'Jobs' }).click();
      await expect(page.locator('tbody')).toContainText(jobTemplateName, { timeout: 30000 });

      await JobTemplate.ui.delete(page, jobTemplateName);

      await InventoryHost.ui.navigateToInventoryHostsTab(inventoryName, page);
      await InventoryHost.ui.deleteFromList(page, inventoryName, hostName);
      await Project.ui.delete(page, projectName);
    }
  );

  test(
    'can run ad-hoc command from inventory hosts tab and from groups tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      const executionEnvironmentName = await ExecutionEnvironment.ui.create(page, {
        organizationName,
      });
      const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

      await InventoryHost.ui.create(page, inventoryName);

      await InventoryHost.ui.navigateToInventoryHostsTab(inventoryName, page);

      await expect(page.getByRole('button', { name: 'Run command', exact: true })).toBeVisible();

      await page.getByRole('button', { name: 'Run command', exact: true }).click();

      await runAdHocCommandWizard(
        {
          module: 'shell',
          moduleArgs: 'echo "Hello World"',
          verbosity: '0',
          limit: 'all',
          forks: 2,
          showChanges: true,
          becomeEnabled: true,
          executionEnvironmentName,
          credentialName,
        },
        page
      );

      const groupName = createE2EName('group');
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: inventoryName }, page);
      await page.getByRole('tab', { name: 'Groups' }).click();
      await page.getByText('Create group', { exact: true }).click();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(groupName);
      await page.getByRole('button', { name: 'Create group', exact: true }).click();
      await page.getByRole('tab', { name: 'Hosts' }).click();
      await page.getByText('Add existing host', { exact: true }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await dialog.getByLabel('Select all').check();
      await page.getByRole('button', { name: 'Add hosts', exact: true }).click();

      await page.getByRole('button', { name: 'Run command' }).click();

      await runAdHocCommandWizard(
        {
          module: 'shell',
          moduleArgs: 'echo "Hello World"',
          verbosity: '0',
          limit: 'all',
          forks: 2,
          showChanges: true,
          becomeEnabled: true,
          executionEnvironmentName,
          credentialName,
        },
        page
      );

      await InventoryHost.ui.navigateToInventoryHostsTab(inventoryName, page);
      await InventoryHost.ui.bulkDelete(page, inventoryName);

      await Credential.ui.delete(page, credentialName);
      await ExecutionEnvironment.ui.delete(page, executionEnvironmentName);
    }
  );
});
