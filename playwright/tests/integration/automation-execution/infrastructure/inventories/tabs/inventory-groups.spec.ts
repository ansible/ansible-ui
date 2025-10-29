import { expect, test } from '@playwright/test';
import { clearTableFilters } from '../../../../../../commands/clearTableFilters';
import { clickPageAction } from '../../../../../../commands/clickPageAction';
import { clickTableRow } from '../../../../../../commands/clickTableRow';
import { clickTableRowAction } from '../../../../../../commands/clickTableRowAction';
import { createE2EName } from '../../../../../../commands/createE2EName';
import { getTableRow } from '../../../../../../commands/getTableRow';
import { navigateTo } from '../../../../../../commands/navigateTo';
import { runAdHocCommandWizard } from '../../../../../../commands/runAdHocCommandWizard';
import { setupAfter, setupBefore } from '../../../../../../commands/setup';
import {
  createOrganization,
  deleteOrganization,
} from '../../../../access-management/organizations/organization-utils';
import { createAwxCredential, deleteAwxCredential } from '../../credentials/credential-utils';
import {
  createExecutionEnvironment,
  deleteExecutionEnvironment,
} from '../../execution-environments/execution-environment-utils';
import { createInventory, deleteInventory } from '../inventory-utils';
import { createInventoryGroup, createInventoryHost } from './inventory-groups-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test.describe('Inventory Groups - List View', () => {
  test(
    'can create group with variables, view details, and delete from list',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const inventoryName = await createInventory({}, page);
      const groupName = createE2EName('group');
      const variablesText = 'test: true\ntest2: false';

      // createInventory leaves us on the inventory details page
      await page.getByRole('tab', { name: 'Groups' }).click();
      await page.getByRole('link', { name: 'Create group' }).click();
      await expect(page.getByRole('heading', { name: 'Create group', exact: true })).toBeVisible();

      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(groupName);
      await page.getByRole('textbox', { name: 'Description' }).fill('This is a description');
      await page.getByRole('textbox', { name: 'Editor content' }).fill(variablesText);

      await page.getByRole('button', { name: 'Create group' }).click();
      await page.waitForURL(/\/groups\/\d+\/details/);

      await expect(page.getByRole('heading', { name: groupName, exact: true })).toBeVisible();
      await expect(page.locator('#name')).toContainText(groupName);
      await expect(page.locator('#description')).toContainText('This is a description');
      await expect(page.getByRole('code')).toContainText(variablesText);

      await page.getByRole('tab', { name: 'Back to Groups' }).click();

      const groupRow = await getTableRow(page, groupName);
      await groupRow.getByRole('checkbox').check();

      await page.getByRole('button', { name: 'toolbar actions' }).click();
      await page.getByRole('menuitem', { name: 'Delete groups' }).click();

      await page.getByTestId('delete-groups-dialog-radio-delete').check();
      await page.getByTestId('delete-group-modal-delete-button').click();

      // Wait for deletion to complete and verify no groups remain
      await clearTableFilters(page);

      // Check that the group is gone - either empty state or no results
      await expect(
        page.getByText(/There are currently no groups|No results found/i).first()
      ).toBeVisible({ timeout: 10000 });

      await deleteInventory(inventoryName, page);
    }
  );

  test('can edit group from details page', { tag: ['@not_mock'] }, async ({ page }) => {
    const inventoryName = await createInventory({}, page);
    const groupName = await createInventoryGroup({ inventoryName }, page);
    await createInventoryHost({ inventoryName }, page);

    // After createInventoryHost, navigate back to the inventory Groups tab
    await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
    await clickTableRow({ text: inventoryName }, page);
    await page.getByRole('tab', { name: 'Groups' }).click();

    await clickTableRow({ text: groupName }, page);
    await clickPageAction('Edit group', page);

    await expect(page.getByRole('heading', { name: `Edit ${groupName}` })).toBeVisible();

    const nameField = page.getByRole('textbox', { name: 'Name', exact: true });
    await nameField.fill(`${groupName}-changed`);

    await page.getByRole('button', { name: 'Save group' }).click();

    await expect(
      page.getByRole('heading', { name: `${groupName}-changed`, exact: true })
    ).toBeVisible();

    await deleteInventory(inventoryName, page);
  });

  test('can bulk delete multiple groups', { tag: ['@not_mock'] }, async ({ page }) => {
    const inventoryName = await createInventory({}, page);
    await createInventoryGroup({ inventoryName }, page);
    await createInventoryGroup({ inventoryName }, page);
    await createInventoryGroup({ inventoryName }, page);

    await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
    await clickTableRow({ text: inventoryName }, page);
    await page.getByRole('tab', { name: 'Groups' }).click();

    await page.getByRole('checkbox', { name: 'Select all' }).check();

    await page.getByRole('button', { name: 'toolbar actions' }).click();
    await page.getByRole('menuitem', { name: 'Delete groups' }).click();

    await page.getByTestId('delete-groups-dialog-radio-delete').check();
    await page.getByTestId('delete-group-modal-delete-button').click();

    await clearTableFilters(page);

    // Check that all groups are gone - either empty state or no results
    await expect(
      page.getByText(/There are currently no groups|No results found/i).first()
    ).toBeVisible({ timeout: 10000 });

    await deleteInventory(inventoryName, page);
  });

  test('can run ad-hoc command against group', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await createOrganization(page);
    const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);
    const executionEnvironmentName = await createExecutionEnvironment(page, {
      organizationName,
    });
    const inventoryName = await createInventory({ organizationName }, page);
    await createInventoryGroup({ inventoryName }, page);
    await page.getByRole('tab', { name: 'Back to Groups' }).click();

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

    await expect(page.getByRole('tab', { name: 'Output' })).toBeVisible({ timeout: 15000 });
    await page.waitForSelector('[data-testid="running-status"]');

    await page.getByRole('button', { name: 'Cancel job' }).click();
    const confirmCheckbox = page.locator('#confirm');
    await expect(confirmCheckbox).toBeVisible();
    await expect(confirmCheckbox).toBeEnabled();
    await confirmCheckbox.click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Cancel job' }).click();

    await deleteInventory(inventoryName, page);
    await deleteAwxCredential(credentialName, page);
    await deleteExecutionEnvironment(executionEnvironmentName, page);
    await deleteOrganization(organizationName, page);
  });
});

test.describe('Inventory Groups - Related Groups', () => {
  test(
    'can create and disassociate new related group',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const inventoryName = await createInventory({}, page);
      const groupName = await createInventoryGroup({ inventoryName }, page);
      const relatedGroupName = createE2EName('related-group');

      await page.getByRole('tab', { name: 'Related Groups' }).click();

      await page.getByRole('button', { name: 'Create group' }).click();
      await expect(page.getByRole('heading', { name: 'Create group', exact: true })).toBeVisible();

      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(relatedGroupName);
      await page.getByRole('button', { name: 'Create group' }).click();

      await expect(page.getByRole('heading', { name: groupName, exact: true })).toBeVisible();

      await page.getByRole('tab', { name: 'Related Groups' }).click();

      const relatedGroupRow = await getTableRow(page, relatedGroupName);
      await relatedGroupRow.getByRole('checkbox').check();

      await page.getByRole('button', { name: 'toolbar actions' }).click();
      await page.getByRole('menuitem', { name: 'Disassociate groups' }).click();

      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
      await page.getByRole('button', { name: 'Disassociate groups' }).click();
      await expect(page.getByRole('heading', { name: 'No results found' })).toBeVisible();
      await clearTableFilters(page);
      await expect(
        page.getByRole('heading', { name: 'There are currently no groups related to this group.' })
      ).toBeVisible();
      await deleteInventory(inventoryName, page);
    }
  );

  test(
    'can add existing group, edit it, and disassociate',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const inventoryName = await createInventory({}, page);
      const groupName = await createInventoryGroup({ inventoryName }, page);
      await page.getByRole('tab', { name: 'Back to Groups' }).click();

      const newGroupName = await createInventoryGroup(
        { inventoryName, groupName: 'new-group' },
        page
      );
      await page.getByRole('tab', { name: 'Back to Groups' }).click();

      await clickTableRow({ text: groupName }, page);
      await page.getByRole('tab', { name: 'Related Groups' }).click();
      await page.getByRole('button', { name: 'Add existing group' }).click();

      const newGroupRow = await getTableRow(page, newGroupName);
      await newGroupRow.getByRole('checkbox').check();

      await page.getByRole('button', { name: 'Add groups' }).click();
      await expect(page.getByRole('link', { name: newGroupName })).toBeVisible();

      await clickTableRowAction({ text: newGroupName, action: 'Edit group' }, page);

      await expect(page.getByRole('heading', { name: `Edit ${newGroupName}` })).toBeVisible();

      const nameField = page.getByRole('textbox', { name: 'Name', exact: true });
      await nameField.fill(`${newGroupName}-changed`);

      await page.getByRole('button', { name: 'Save group' }).click();

      await expect(
        page.getByRole('heading', { name: `${newGroupName}-changed`, exact: true })
      ).toBeVisible();

      await page.getByRole('tab', { name: 'Back to Groups' }).click();

      await clickTableRow({ text: groupName }, page);

      await page.getByRole('tab', { name: 'Related Groups' }).click();

      const editedGroupRow = await getTableRow(page, `${newGroupName}-changed`);
      await editedGroupRow.getByRole('checkbox').check();

      await page.getByRole('button', { name: 'toolbar actions' }).click();
      await page.getByRole('menuitem', { name: 'Disassociate groups' }).click();

      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
      await page.getByRole('button', { name: 'Disassociate groups' }).click();
      await expect(page.getByRole('heading', { name: 'No results found' })).toBeVisible();
      await clearTableFilters(page);
      await expect(
        page.getByRole('heading', { name: 'There are currently no groups related to this group.' })
      ).toBeVisible();

      await deleteInventory(inventoryName, page);
    }
  );

  test('can run ad-hoc command against related group', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await createOrganization(page);
    const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);
    const executionEnvironmentName = await createExecutionEnvironment(page, {
      organizationName,
    });

    const relatedGroupName = createE2EName('related-group');
    const inventoryName = await createInventory({ organizationName }, page);
    const groupName = await createInventoryGroup({ inventoryName }, page);

    await page.getByRole('tab', { name: 'Related Groups' }).click();
    await page.getByRole('button', { name: 'Create group' }).click();

    await page.getByRole('textbox', { name: 'Name', exact: true }).fill(relatedGroupName);
    await page.getByRole('button', { name: 'Create group' }).click();

    await expect(page.getByRole('heading', { name: groupName, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: relatedGroupName })).toBeVisible();

    await page.getByRole('tab', { name: 'Back to Groups' }).click();
    await clickTableRow({ text: groupName }, page);
    await page.getByRole('tab', { name: 'Related Groups' }).click();

    const relatedGroupRow = await getTableRow(page, relatedGroupName);
    await relatedGroupRow.getByRole('checkbox').check();

    await page.getByRole('button', { name: 'Run command' }).click();

    await runAdHocCommandWizard(
      {
        module: 'shell',
        moduleArgs: 'echo "Hello World"',
        verbosity: '0',
        limit: relatedGroupName,
        forks: 2,
        showChanges: true,
        becomeEnabled: true,
        executionEnvironmentName,
        credentialName,
      },
      page
    );

    await expect(page.getByRole('tab', { name: 'Output' })).toBeVisible({ timeout: 15000 });
    await page.waitForSelector('[data-testid="running-status"]');

    await page.getByRole('button', { name: 'Cancel job' }).click();
    const confirmCheckbox = page.locator('#confirm');
    await expect(confirmCheckbox).toBeVisible();
    await expect(confirmCheckbox).toBeEnabled();
    await confirmCheckbox.click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Cancel job' }).click();

    await deleteInventory(inventoryName, page);
    await deleteAwxCredential(credentialName, page);
    await deleteExecutionEnvironment(executionEnvironmentName, page);
    await deleteOrganization(organizationName, page);
  });
});

test.describe('Inventory Groups - Hosts Tab', () => {
  test(
    'can add existing host, create new host in group, and delete host',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const inventoryName = await createInventory({}, page);
      const existingHostName = await createInventoryHost({ inventoryName }, page);
      const groupName = createE2EName('group');

      await page.getByRole('tab', { name: 'Back to Hosts' }).click();
      await page.getByRole('tab', { name: 'Groups' }).click();

      // Create group
      await page.getByRole('link', { name: 'Create group' }).click();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(groupName);
      await page.getByRole('button', { name: 'Create group' }).click();
      await page.getByRole('tab', { name: 'Hosts' }).click();

      // Part 1: Add existing host to group
      await page.getByRole('button', { name: 'Add existing host' }).click();
      const hostRow = await getTableRow(page, existingHostName);
      await hostRow.getByRole('checkbox').check();
      await page.getByRole('button', { name: 'Add host' }).click();
      await expect(page.getByRole('link', { name: existingHostName })).toBeVisible();

      // Part 2: Create new host in group
      const newHostName = createE2EName('host');
      await page.getByTestId('add-host').click();
      await page.getByRole('menuitem', { name: 'Create host' }).click();
      await expect(page.getByRole('heading', { name: 'Create host', exact: true })).toBeVisible();
      await page.getByTestId('name').fill(newHostName);
      await page.getByRole('textbox', { name: 'Description' }).fill('This is the description');
      await page.getByTestId('Submit').click();
      await expect(page.getByRole('heading', { name: newHostName, exact: true })).toBeVisible();

      await page.getByRole('tab', { name: 'Back to Hosts' }).click();
      await expect(page.getByRole('link', { name: newHostName })).toBeVisible();

      // Part 3: Delete the new host
      await clickTableRow({ text: newHostName }, page);
      await clickPageAction('Delete host', page);
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
      await page.getByRole('button', { name: 'Delete hosts' }).click();
      await expect(page.getByRole('heading', { name: inventoryName })).toBeVisible();
      await page.getByRole('textbox', { name: 'Type to filter' }).fill(newHostName);
      await expect(page.getByRole('heading', { name: 'No results found' })).toBeVisible();

      await deleteInventory(inventoryName, page);
    }
  );

  test('can edit host from group hosts tab', { tag: ['@not_mock'] }, async ({ page }) => {
    const inventoryName = await createInventory({}, page);
    const createdHostName = await createInventoryHost({ inventoryName }, page);
    const groupName = await createInventoryGroup({ inventoryName }, page);

    await page.getByRole('tab', { name: 'Back to Groups' }).click();

    await clickTableRow({ text: groupName }, page);

    await page.getByRole('tab', { name: 'Hosts' }).click();
    await page.getByRole('button', { name: 'Add existing host' }).click();

    const hostRow = await getTableRow(page, createdHostName);
    await hostRow.getByRole('checkbox').check();

    await page.getByRole('button', { name: 'Add host' }).click();

    await expect(page.getByRole('link', { name: createdHostName })).toBeVisible();
    await clickTableRowAction({ text: createdHostName, action: 'Edit host' }, page);
    await expect(page.getByRole('heading', { name: `Edit ${createdHostName}` })).toBeVisible();

    await page.getByTestId('name').fill(`${createdHostName}-edited`);
    await page.getByRole('textbox', { name: 'Description' }).fill('This is the description edited');
    await page.getByTestId('Submit').click();

    await expect(
      page.getByRole('heading', { name: `${createdHostName}-edited`, exact: true })
    ).toBeVisible();

    await deleteInventory(inventoryName, page);
  });

  test('can run ad-hoc command against group hosts', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await createOrganization(page);
    const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);
    const executionEnvironmentName = await createExecutionEnvironment(page, {
      organizationName,
    });

    const inventoryName = await createInventory({ organizationName }, page);
    const hostName = await createInventoryHost({ inventoryName }, page);
    const groupName = await createInventoryGroup({ inventoryName }, page);

    await page.getByRole('tab', { name: 'Back to Groups' }).click();
    await clickTableRow({ text: groupName }, page);
    await page.getByRole('tab', { name: 'Hosts' }).click();

    // Add host to the group before running command
    await page.getByRole('button', { name: 'Add existing host' }).click();
    const hostRow = await getTableRow(page, hostName);
    await hostRow.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Add host' }).click();
    await expect(page.getByRole('link', { name: hostName })).toBeVisible();

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

    await expect(page.getByRole('tab', { name: 'Output' })).toBeVisible({ timeout: 15000 });
    await page.waitForSelector('[data-testid="running-status"]');

    await page.getByRole('button', { name: 'Cancel job' }).click();
    const confirmCheckbox = page.locator('#confirm');
    await expect(confirmCheckbox).toBeVisible();
    await expect(confirmCheckbox).toBeEnabled();
    await confirmCheckbox.click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Cancel job' }).click();

    await deleteInventory(inventoryName, page);
    await deleteAwxCredential(credentialName, page);
    await deleteExecutionEnvironment(executionEnvironmentName, page);
    await deleteOrganization(organizationName, page);
  });
});
