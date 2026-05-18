import { expect, test } from '@playwright/test';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Organization, Notifier } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

test.describe('Notifications Tab for Organizations', () => {
  let organizationName: string;
  let notifierName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    notifierName = await Notifier.ui.createSlack(page);
  });

  test.afterEach(async ({ page }) => {
    await Notifier.ui.delete(page, notifierName).catch(() => {});
    await Organization.ui.delete(page, organizationName).catch(() => {});
  });

  test(
    'should navigate to the notification details page from the organization notifications list',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      await page.getByRole('tab', { name: 'Notifications' }).click();

      await filterTable(
        {
          pageTitle: organizationName,
          filterLabel: 'Name',
          filterValue: notifierName,
        },
        page
      );

      await expect(page.locator('tbody tr')).toHaveCount(1);
      await expect(page.locator('tbody')).toContainText(notifierName);

      await page.getByRole('link', { name: notifierName }).click();

      await expect(page.getByRole('heading', { name: notifierName })).toBeVisible();
    }
  );

  test(
    'should toggle the notification on and off for job approval',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      await page.getByRole('tab', { name: 'Notifications' }).click();

      await filterTable(
        {
          pageTitle: organizationName,
          filterLabel: 'Name',
          filterValue: notifierName,
        },
        page
      );

      await expect(page.locator('tbody tr')).toHaveCount(1);
      await expect(page.locator('tbody')).toContainText(notifierName);

      await page.getByLabel('Click to enable approval').click();

      await expect(page.getByLabel('Click to disable approval')).toBeVisible({ timeout: 5000 });
      await page.getByLabel('Click to disable approval').click();

      await expect(page.getByLabel('Click to enable approval')).toBeVisible({ timeout: 5000 });
    }
  );

  test(
    'should toggle notifications on and off for job start, success, and failure',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      await page.getByRole('tab', { name: 'Notifications' }).click();

      await filterTable(
        {
          pageTitle: organizationName,
          filterLabel: 'Name',
          filterValue: notifierName,
        },
        page
      );

      await expect(page.locator('tbody tr')).toHaveCount(1);
      await expect(page.locator('tbody')).toContainText(notifierName);

      // Toggle start notification
      await page.getByLabel('Click to enable start').first().click();
      await expect(page.getByLabel('Click to disable start').first()).toBeVisible({
        timeout: 5000,
      });
      await page.getByLabel('Click to disable start').first().click();
      await expect(page.getByLabel('Click to enable start').first()).toBeVisible({ timeout: 5000 });

      // Toggle success notification
      await page.getByLabel('Click to enable success').click();
      await expect(page.getByLabel('Click to disable success')).toBeVisible({ timeout: 5000 });
      await page.getByLabel('Click to disable success').click();
      await expect(page.getByLabel('Click to enable success')).toBeVisible({ timeout: 5000 });

      // Toggle failure notification
      await page.getByLabel('Click to enable failure').click();
      await expect(page.getByLabel('Click to disable failure')).toBeVisible({ timeout: 5000 });
      await page.getByLabel('Click to disable failure').click();
      await expect(page.getByLabel('Click to enable failure')).toBeVisible({ timeout: 5000 });
    }
  );
});
