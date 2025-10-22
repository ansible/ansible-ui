import { expect, test } from '@playwright/test';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { createSlackNotifier, deleteNotifier } from '../administration/notifiers/notifier-utils';
import { createInventory, deleteInventory } from '../infrastructure/inventories/inventory-utils';
import { createJobTemplate, deleteJobTemplate } from './job-template-utils';

test.setTimeout(2 * 60 * 1000);
test.describe('Job Template - notifications tab', () => {
  let inventoryName: string;

  test.beforeEach(async ({ page }) => {
    await setupBefore({ path: '/' })({ page });
    inventoryName = await createInventory({}, page);
  });

  test.afterEach(async ({ page }) => {
    await deleteInventory(inventoryName, page);
    await setupAfter({ page });
  });
  test(
    'can navigate to the Job Templates -> Notifications list and then to the details page of the Notification',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      const notifierName = await createSlackNotifier(page);
      const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByRole('button', { name: 'table view' }).click();
      await clickTableRow(
        {
          pageTitle: 'Automation Templates',
          text: jobTemplateName,
          filterLabel: 'Name',
          filterValue: jobTemplateName,
          clearFilters: false,
        },
        page
      );
      await expect(page.getByRole('heading')).toContainText(jobTemplateName);
      await page.getByRole('tab', { name: 'Notifications' }).click();
      await page.getByRole('link', { name: notifierName }).click();
      await expect(page.getByRole('heading')).toContainText(notifierName);
      await deleteJobTemplate(jobTemplateName, page);
      await deleteNotifier(page, notifierName);
    }
  );

  test(
    'can toggle the Job Templates -> Notification on and off for job start',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      const notifierName = await createSlackNotifier(page);
      const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByRole('button', { name: 'table view' }).click();
      await clickTableRow(
        {
          pageTitle: 'Automation Templates',
          text: jobTemplateName,
          filterLabel: 'Name',
          filterValue: jobTemplateName,
          clearFilters: false,
        },
        page
      );
      await expect(page.getByRole('heading')).toContainText(jobTemplateName);
      await page.getByRole('tab', { name: 'Notifications' }).click();
      await filterTable(
        {
          filterLabel: 'Name',
          filterValue: notifierName,
          clearFilters: false,
        },
        page
      );
      await page
        .getByRole('gridcell', { name: 'Click to disable start Click' })
        .first()
        .isVisible();
      await page.getByRole('row', { name: notifierName }).locator('label').first().click();
      await page.getByRole('gridcell', { name: 'Click to enable start Click' }).first().isVisible();
      await deleteJobTemplate(jobTemplateName, page);
      await deleteNotifier(page, notifierName);
    }
  );

  test(
    'can toggle the Job Templates -> Notification on and off for job success',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      const notifierName = await createSlackNotifier(page);
      const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByRole('button', { name: 'table view' }).click();
      await clickTableRow(
        {
          pageTitle: 'Automation Templates',
          text: jobTemplateName,
          filterLabel: 'Name',
          filterValue: jobTemplateName,
          clearFilters: false,
        },
        page
      );
      await expect(page.getByRole('heading')).toContainText(jobTemplateName);
      await page.getByRole('tab', { name: 'Notifications' }).click();
      await filterTable(
        {
          filterLabel: 'Name',
          filterValue: notifierName,
          clearFilters: false,
        },
        page
      );
      await page.getByRole('row', { name: notifierName }).locator('label').nth(1).click();
      await page
        .getByRole('gridcell', { name: 'Click to disable success Click' })
        .first()
        .isVisible();
      await page.getByRole('row', { name: notifierName }).locator('label').nth(1).click();
      await page
        .getByRole('gridcell', { name: 'Click to enable success Click' })
        .first()
        .isVisible();
      await deleteJobTemplate(jobTemplateName, page);
      await deleteNotifier(page, notifierName);
    }
  );

  test(
    'can toggle the Job Templates -> Notification on and off for job failure',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      const notifierName = await createSlackNotifier(page);
      const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByRole('button', { name: 'table view' }).click();
      await clickTableRow(
        {
          pageTitle: 'Automation Templates',
          text: jobTemplateName,
          filterLabel: 'Name',
          filterValue: jobTemplateName,
          clearFilters: false,
        },
        page
      );
      await expect(page.getByRole('heading')).toContainText(jobTemplateName);
      await page.getByRole('tab', { name: 'Notifications' }).click();
      await filterTable(
        {
          filterLabel: 'Name',
          filterValue: notifierName,
          clearFilters: false,
        },
        page
      );
      await page.getByRole('row', { name: notifierName }).locator('label').nth(2).click();
      await page
        .getByRole('gridcell', { name: 'Click to disable failure Click' })
        .first()
        .isVisible();
      await page.getByRole('row', { name: notifierName }).locator('label').nth(2).click();
      await page
        .getByRole('gridcell', { name: 'Click to enable failure Click' })
        .first()
        .isVisible();
      await deleteJobTemplate(jobTemplateName, page);
      await deleteNotifier(page, notifierName);
    }
  );
});
