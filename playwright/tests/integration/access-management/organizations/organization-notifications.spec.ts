import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../../commands/clickTableRow';
import { filterTable } from '../../../../commands/filterTable';
import { navigateTo } from '../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import {
  createSlackNotifier,
  deleteNotifier,
} from '../../automation-execution/administration/notifiers/notifier-utils';
import { createOrganization, deleteOrganization } from './organization-utils';

test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

// Notifications Tab for Organizations tests (converted from Cypress)
test.describe('Notifications Tab for Organizations', () => {
  let organizationName: string;
  let notifierName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await createOrganization(page);
    notifierName = await createSlackNotifier(page);
  });

  test.afterEach(async ({ page }) => {
    await deleteNotifier(page, notifierName).catch(() => {});
    await deleteOrganization(organizationName, page).catch(() => {});
  });

  test(
    'can navigate to the Organizations -> Notifications list and then to the details page of the Notification',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      // Navigate to Notifications tab
      await page.getByRole('tab', { name: 'Notifications' }).click();

      // Filter to find the notification
      await filterTable(
        {
          pageTitle: organizationName,
          filterLabel: 'Name',
          filterValue: notifierName,
        },
        page
      );

      // Verify notification appears in table
      await expect(page.locator('tbody tr')).toHaveCount(1);
      await expect(page.locator('tbody')).toContainText(notifierName);

      // Click on notification name to navigate to details
      await page.getByRole('link', { name: notifierName }).click();

      // Verify we're on the notification details page
      await expect(page.getByRole('heading', { name: notifierName })).toBeVisible();
    }
  );

  test(
    'can toggle the Organizations -> Notification on and off for job approval',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      // Navigate to Notifications tab
      await page.getByRole('tab', { name: 'Notifications' }).click();

      // Filter to find the notification
      await filterTable(
        {
          pageTitle: organizationName,
          filterLabel: 'Name',
          filterValue: notifierName,
        },
        page
      );

      // Verify notification appears in table
      await expect(page.locator('tbody tr')).toHaveCount(1);
      await expect(page.locator('tbody')).toContainText(notifierName);

      // Enable approval notification
      await page.getByLabel('Click to enable approval').click();

      // Verify approval is enabled and then disable it
      await expect(page.getByLabel('Click to disable approval')).toBeVisible({ timeout: 5000 });
      await page.getByLabel('Click to disable approval').click();

      // Verify approval is disabled again
      await expect(page.getByLabel('Click to enable approval')).toBeVisible({ timeout: 5000 });
    }
  );

  test(
    'can toggle the Organizations -> Notification on and off for job start',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      // Navigate to Notifications tab
      await page.getByRole('tab', { name: 'Notifications' }).click();

      // Filter to find the notification
      await filterTable(
        {
          pageTitle: organizationName,
          filterLabel: 'Name',
          filterValue: notifierName,
        },
        page
      );

      // Verify notification appears in table
      await expect(page.locator('tbody tr')).toHaveCount(1);
      await expect(page.locator('tbody')).toContainText(notifierName);

      // Enable start notification (use first() if multiple exist)
      await page.getByLabel('Click to enable start').first().click();

      // Verify start is enabled and then disable it
      await expect(page.getByLabel('Click to disable start').first()).toBeVisible({
        timeout: 5000,
      });
      await page.getByLabel('Click to disable start').first().click();

      // Verify start is disabled and enable it again
      await expect(page.getByLabel('Click to enable start').first()).toBeVisible({ timeout: 5000 });
      await page.getByLabel('Click to enable start').first().click();
    }
  );

  test(
    'can toggle the Organizations -> Notification on and off for job success',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      // Navigate to Notifications tab
      await page.getByRole('tab', { name: 'Notifications' }).click();

      // Filter to find the notification
      await filterTable(
        {
          pageTitle: organizationName,
          filterLabel: 'Name',
          filterValue: notifierName,
        },
        page
      );

      // Verify notification appears in table
      await expect(page.locator('tbody tr')).toHaveCount(1);
      await expect(page.locator('tbody')).toContainText(notifierName);

      // Enable success notification
      await page.getByLabel('Click to enable success').click();

      // Verify success is enabled and then disable it
      await expect(page.getByLabel('Click to disable success')).toBeVisible({ timeout: 5000 });
      await page.getByLabel('Click to disable success').click();

      // Verify success is disabled again
      await expect(page.getByLabel('Click to enable success')).toBeVisible({ timeout: 5000 });
    }
  );

  test(
    'can toggle the Organizations -> Notification on and off for job failure',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      // Navigate to Notifications tab
      await page.getByRole('tab', { name: 'Notifications' }).click();

      // Filter to find the notification
      await filterTable(
        {
          pageTitle: organizationName,
          filterLabel: 'Name',
          filterValue: notifierName,
        },
        page
      );

      // Verify notification appears in table
      await expect(page.locator('tbody tr')).toHaveCount(1);
      await expect(page.locator('tbody')).toContainText(notifierName);

      // Enable failure notification
      await page.getByLabel('Click to enable failure').click();

      // Verify failure is enabled and then disable it
      await expect(page.getByLabel('Click to disable failure')).toBeVisible({ timeout: 5000 });
      await page.getByLabel('Click to disable failure').click();

      // Verify failure is disabled again
      await expect(page.getByLabel('Click to enable failure')).toBeVisible({ timeout: 5000 });
    }
  );
});
