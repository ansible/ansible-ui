import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../../../../commands/clickTableRow';
import { clickTableRowAction } from '../../../../../../commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '../../../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../../../commands/createE2EName';
import { navigateTo } from '../../../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../../../commands/setup';
import {
  createOrganization,
  deleteOrganization,
} from '../../../../access-management/organizations/organization-utils';
import {
  createSlackNotifier,
  deleteNotifier,
} from '../../../administration/notifiers/notifier-utils';
import {
  createInventory,
  createInventorySource,
  createInventorySourceFromProject,
  deleteInventory,
  toggleNotificationForInventorySource,
} from '../inventory-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test.describe('Inventory Source List', () => {
  test(
    'should create an inventory source from a project with all fields',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await createOrganization(page);
      const { inventorySourceName, inventoryName } = await createInventorySource(
        { organizationName, projectName: 'Demo Project' },
        page
      );

      await expect(page.getByTestId('name')).toContainText(inventorySourceName);
      await expect(page.getByTestId('source')).toContainText('Sourced from a Project');
      await expect(page.getByTestId('organization')).toContainText(organizationName);
      await expect(page.getByTestId('project')).toContainText('Demo Project');

      await deleteInventory(inventoryName, page);
      await deleteOrganization(organizationName, page);
    }
  );

  test(
    'should edit source from the list view and update info',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await createOrganization(page);
      const inventoryName = await createInventory({ organizationName }, page);

      const inventorySourceName = await createInventorySourceFromProject(
        {
          inventoryName,
          projectName: 'Demo Project',
        },
        page
      );

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: inventoryName }, page);
      await page.getByRole('tab', { name: 'Sources' }).click();
      await clickTableRowAction(
        { text: inventorySourceName, action: 'Edit inventory source' },
        page
      );

      await page.getByTestId('description').clear();
      await page.getByTestId('description').fill('mock description');

      await page.locator('#inventory-file-toggle').click();
      await page.locator('button[aria-label="Clear input value"]').click();
      await page
        .locator('#inventory-typeahead-select-input input[type="text"]')
        .fill('hello_world.yml');
      await page.getByRole('option', { name: 'hello_world.yml' }).click();

      await page.getByLabel('Overwrite', { exact: true }).check();

      await page.getByRole('button', { name: 'Save source' }).click();
      await expect(
        page.getByRole('heading', { name: inventorySourceName, exact: true })
      ).toBeVisible();

      await expect(page.getByTestId('description')).toContainText('mock description');
      await expect(page.getByTestId('inventory-file')).toContainText('hello_world.yml');
      await expect(page.getByTestId('enabled-options')).toContainText('Overwrite');

      await deleteInventory(inventoryName, page);
      await deleteOrganization(organizationName, page);
    }
  );
});

test.describe('Inventory Source Schedules', () => {
  test(
    'should create and delete schedule from inventory source',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await createOrganization(page);
      const inventoryName = await createInventory({ organizationName }, page);
      const scheduleName = createE2EName('schedule');

      await createInventorySourceFromProject(
        {
          inventoryName,
          projectName: 'Demo Project',
          scheduleName,
        },
        page
      );

      await page.getByLabel('kebab dropdown toggle').click();
      await page.getByRole('menuitem', { name: 'Delete schedule' }).click();
      await confirmAndAssertDeletion(page);

      await expect(page.getByRole('heading', { name: 'Schedules' })).toBeVisible();

      await deleteInventory(inventoryName, page);
      await deleteOrganization(organizationName, page);
    }
  );
});

test.describe('Inventory Source Notifications', () => {
  const notificationTypes = [
    { type: 'start' as const, gridcell: 'Click to disable start Click' },
    { type: 'success' as const, gridcell: 'Click to disable success Click' },
    { type: 'failure' as const, gridcell: 'Click to disable error Click' },
  ];

  for (const { type, gridcell } of notificationTypes) {
    test(
      `should enable notification on ${type} for inventory source`,
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const organizationName = await createOrganization(page);
        const inventoryName = await createInventory({ organizationName }, page);
        const notifierName = await createSlackNotifier(page);

        const inventorySourceName = await createInventorySourceFromProject(
          {
            inventoryName,
            projectName: 'Demo Project',
          },
          page
        );

        await toggleNotificationForInventorySource(
          {
            inventoryName,
            inventorySourceName,
            notificationName: notifierName,
            notificationType: type,
          },
          page
        );

        if (type === 'failure') {
          const row = page.getByRole('row', { name: notifierName });
          await expect(row.locator('label').nth(2)).toBeVisible();
        } else {
          await expect(page.getByRole('gridcell', { name: gridcell }).first()).toBeVisible();
        }

        await deleteNotifier(page, notifierName);
        await deleteInventory(inventoryName, page);
        await deleteOrganization(organizationName, page);
      }
    );
  }
});

test.describe('Inventory Source Type Changes', () => {
  test(
    'should create EC2 inventory source and edit basic fields',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await createOrganization(page);
      const inventoryName = await createInventory({ organizationName }, page);

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: inventoryName }, page);
      await page.getByRole('tab', { name: 'Sources' }).click();
      await page.getByText('Create source', { exact: true }).click();

      const sourceName = createE2EName('source');
      await page.getByPlaceholder('Enter source name').fill(sourceName);
      await page.getByRole('button', { name: 'Select source' }).click();
      await page.getByRole('option', { name: 'Amazon EC2' }).click();

      await page.getByRole('button', { name: 'Create source' }).click();
      await expect(page.getByRole('heading', { name: sourceName, exact: true })).toBeVisible();

      await expect(page.getByTestId('name')).toContainText(sourceName);
      await expect(page.getByTestId('source')).toContainText('Amazon EC2');

      await deleteInventory(inventoryName, page);
      await deleteOrganization(organizationName, page);
    }
  );
});
