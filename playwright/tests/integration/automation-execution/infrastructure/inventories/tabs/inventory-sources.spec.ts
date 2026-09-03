import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../../../../commands/clickTableRow';
import { clickTableRowAction } from '../../../../../../commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '../../../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../../../commands/createE2EName';
import { navigateTo } from '../../../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../../../commands/setup';
import { Organization, Project, Inventory, Notifier } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test.describe('Inventory Source List', () => {
  test(
    'should create an inventory source from a project with all fields',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await Organization.ui.create(page);
      const projectName = await Project.ui.create(page, { organizationName });
      const { inventorySourceName, inventoryName } = await Inventory.ui.createSource(page, {
        organizationName,
        projectName,
      });

      await expect(page.getByTestId('name')).toContainText(inventorySourceName);
      await expect(page.getByTestId('source')).toContainText('Sourced from a Project');
      await expect(page.getByTestId('organization')).toContainText(organizationName);
      await expect(page.getByTestId('project')).toContainText(projectName);

      await Inventory.ui.delete(page, inventoryName);
      await Project.ui.delete(page, projectName);
      await Organization.ui.delete(page, organizationName);
    }
  );

  test(
    'should edit source from the list view and update info',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await Organization.ui.create(page);
      const inventoryName = await Inventory.ui.create(page, { organizationName });

      const { inventorySourceName } = await Inventory.ui.createSource(page, {
        organizationName,
        inventoryName,
        projectName: 'Demo Project',
      });

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

      await expect(page.getByTestId('description')).toContainText('mock description', {
        timeout: 10_000,
      });
      await expect(page.getByTestId('inventory-file')).toContainText('hello_world.yml', {
        timeout: 10_000,
      });
      await expect(page.getByTestId('enabled-options')).toContainText('Overwrite', {
        timeout: 10_000,
      });

      await Inventory.ui.delete(page, inventoryName);
      await Organization.ui.delete(page, organizationName);
    }
  );
});

test.describe('Inventory Source Schedules', () => {
  test(
    'should create and delete schedule from inventory source',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await Organization.ui.create(page);
      const inventoryName = await Inventory.ui.create(page, { organizationName });
      const scheduleName = createE2EName('schedule');

      await Inventory.ui.createSource(page, {
        organizationName,
        inventoryName,
        projectName: 'Demo Project',
        scheduleName,
      });

      await page.getByLabel('kebab dropdown toggle').click();
      await page.getByRole('menuitem', { name: 'Delete schedule' }).click();
      await confirmAndAssertDeletion(page);

      await expect(page.getByRole('heading', { name: 'Schedules' })).toBeVisible();

      await Inventory.ui.delete(page, inventoryName);
      await Organization.ui.delete(page, organizationName);
    }
  );
});

test.describe('Inventory Source Notifications', () => {
  const notificationTypes = [
    { type: 'start' as const },
    { type: 'success' as const },
    { type: 'failure' as const },
  ];

  for (const { type } of notificationTypes) {
    test(
      `should enable notification on ${type} for inventory source`,
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const organizationName = await Organization.ui.create(page);
        const inventoryName = await Inventory.ui.create(page, { organizationName });
        const notifierName = await Notifier.ui.createSlack(page);

        const { inventorySourceName } = await Inventory.ui.createSource(page, {
          organizationName,
          inventoryName,
          projectName: 'Demo Project',
        });

        // Navigate to notifications tab and enable notification
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
        await clickTableRow({ text: inventoryName }, page);
        await page.getByRole('tab', { name: 'Sources' }).click();
        await clickTableRow({ text: inventorySourceName }, page);
        await page.getByRole('tab', { name: 'Notifications' }).click();

        await expect(page.getByTestId('page-toolbar')).toBeVisible();

        // Enable notification based on type
        // Find the row by notifier name and click the appropriate toggle
        const notificationRow = page.getByRole('row').filter({ hasText: notifierName });
        await expect(notificationRow).toBeVisible();

        // Get all toggle switches in the row (Start, Success, Failure order)
        const toggleSwitches = notificationRow.getByRole('switch');
        const switchIndex = type === 'start' ? 0 : type === 'success' ? 1 : 2;
        const toggleSwitch = toggleSwitches.nth(switchIndex);

        await expect(toggleSwitch).toBeVisible();
        await toggleSwitch.click();

        // Verify the toggle is now enabled
        await expect(toggleSwitch).toBeChecked();

        // Use API-based cleanup to cancel running jobs and avoid timeout
        await Notifier.api.deleteByName(page, notifierName);
        await Organization.api.deleteByName(page, organizationName);
      }
    );
  }
});

test.describe('Inventory Source Type Changes', () => {
  test(
    'should create EC2 inventory source and edit basic fields',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await Organization.ui.create(page);
      const inventoryName = await Inventory.ui.create(page, { organizationName });

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

      await Inventory.ui.delete(page, inventoryName);
      await Organization.ui.delete(page, organizationName);
    }
  );
});
