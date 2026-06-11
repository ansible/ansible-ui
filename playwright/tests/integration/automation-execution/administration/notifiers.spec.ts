import { test, expect } from '@playwright/test';
import { Notifier } from '@ansible/playwright/utils/notifier';
import { bulkDeleteResources } from '@ansible/playwright/commands/bulkDeleteResources';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore({ path: '/execution/administration/notifiers' }));
test.afterEach(setupAfter);

test.describe('Notifiers - List View', () => {
  test(
    'should test a notifier and verify status changes',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);
      const notifierName = await Notifier.ui.createSlack(page);

      await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
      await filterTable({ filterLabel: 'Name', filterValue: notifierName }, page);

      const row = page.getByRole('row', { name: notifierName });
      await expect(row).toBeVisible();

      await row.getByTestId('test-notifier').click();

      const statusCell = row.getByTestId('status-column-cell');
      await expect(statusCell.getByText(/Pending|Running|Failed|Success/i)).toBeVisible({
        timeout: 30000,
      });

      // Use force-delete with retries since UI/API deletion is blocked while notifications are pending
      await Notifier.api.forceDeleteByName(page, notifierName);
    }
  );

  test('should copy a notifier and bulk delete', { tag: ['@not_mock'] }, async ({ page }) => {
    const originalName = await Notifier.ui.createSlack(page);

    await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');

    await filterTable({ filterLabel: 'Name', filterValue: originalName }, page);

    const row = page.getByRole('row', { name: originalName });
    await expect(row).toBeVisible();
    await row.getByTestId('actions-dropdown').click();

    const copyResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/notification_templates/') &&
        response.url().includes('/copy/') &&
        response.status() === 201
    );

    await page.getByTestId('duplicate-notifier').click();

    const copyResponse = await copyResponsePromise;
    const copiedNotifier = (await copyResponse.json()) as { name: string; id: number };
    const copiedName = copiedNotifier.name;

    await expect(page.getByTestId('alert-toaster')).toContainText('duplicated');

    await filterTable({ filterLabel: 'Name', filterValue: originalName }, page);
    await expect(page.getByRole('gridcell', { name: originalName, exact: true })).toBeVisible();

    await clearTableFilters(page);
    await filterTable({ filterLabel: 'Name', filterValue: copiedName }, page);
    await expect(page.getByRole('gridcell', { name: copiedName, exact: true })).toBeVisible();

    await bulkDeleteResources(
      {
        resourceType: 'notifiers',
        resourceNames: [originalName, copiedName],
        filterLabel: 'Name',
        navigationPath: ['Automation Execution', 'Administration', 'Notifiers'],
      },
      page
    );
  });
});

test.describe('Notifiers - Create and Delete by Type', () => {
  test('should create and delete Email notifier', { tag: ['@not_mock'] }, async ({ page }) => {
    const notifierName = createE2EName('notifier-Email');

    await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
    await page.getByText('Create notifier', { exact: true }).click();
    await page.getByPlaceholder('Enter notifier name').fill(notifierName);
    await page.getByLabel('Organization *').click();
    await page.getByRole('option', { name: 'Default' }).click();
    await page.getByLabel('Notification type *').click();
    await page.getByRole('option', { name: 'Email' }).click();

    await page.getByTestId('notification-configuration-username').fill('test@example.com');
    await page.getByTestId('notification-configuration-password').fill('password123');
    await page.getByTestId('notification-configuration-host').fill('https://smtp.example.com');
    await page.getByTestId('notification-configuration-recipients').fill('recipient@example.com');
    await page.getByTestId('notification-configuration-sender').fill('sender@example.com');
    await page.getByTestId('notification-configuration-port').fill('587');
    await page.getByTestId('notification-configuration-timeout').fill('30');
    await page.getByTestId('notification_configuration-use_tls').click();
    await page.getByTestId('notification_configuration-use_ssl').click();

    await page.getByRole('button', { name: 'Save notifier' }).click();
    await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

    await Notifier.ui.delete(page, notifierName);
  });

  test('should create and delete Grafana notifier', { tag: ['@not_mock'] }, async ({ page }) => {
    const notifierName = createE2EName('notifier-Grafana');

    await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
    await page.getByText('Create notifier', { exact: true }).click();
    await page.getByPlaceholder('Enter notifier name').fill(notifierName);
    await page.getByLabel('Organization *').click();
    await page.getByRole('option', { name: 'Default' }).click();
    await page.getByLabel('Notification type *').click();
    await page.getByRole('option', { name: 'Grafana' }).click();

    await page
      .getByTestId('notification-configuration-grafana-url-form-group')
      .locator('input')
      .fill('https://grafana.example.com');
    await page.getByTestId('notification-configuration-dashboardid').fill('dashboard-id');
    await page.getByTestId('notification-configuration-panelid').fill('panel-id');
    await page.getByTestId('notification-configuration-annotation-tags').fill('test-tag');
    await page.getByTestId('notification_configuration-grafana_no_verify_ssl').click();
    await page.getByTestId('notification-configuration-grafana-key').fill('test-key');

    await page.getByRole('button', { name: 'Save notifier' }).click();
    await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

    await Notifier.ui.delete(page, notifierName);
  });

  test('should create and delete IRC notifier', { tag: ['@not_mock'] }, async ({ page }) => {
    const notifierName = createE2EName('notifier-IRC');

    await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
    await page.getByText('Create notifier', { exact: true }).click();
    await page.getByPlaceholder('Enter notifier name').fill(notifierName);
    await page.getByLabel('Organization *').click();
    await page.getByRole('option', { name: 'Default' }).click();
    await page.getByLabel('Notification type *').click();
    await page.getByRole('option', { name: 'IRC' }).click();

    await page.getByTestId('notification-configuration-port').fill('6667');
    await page.getByTestId('notification-configuration-server').fill('https://irc.server.com');
    await page.getByTestId('notification-configuration-nickname').fill('irc_nickname');
    await page.getByTestId('notification-configuration-targets').fill('channel1');
    await page.getByTestId('notification_configuration-use_ssl').click();

    await page.getByRole('button', { name: 'Save notifier' }).click();
    await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

    await Notifier.ui.delete(page, notifierName);
  });

  test('should create and delete Mattermost notifier', { tag: ['@not_mock'] }, async ({ page }) => {
    const notifierName = createE2EName('notifier-Mattermost');

    await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
    await page.getByText('Create notifier', { exact: true }).click();
    await page.getByPlaceholder('Enter notifier name').fill(notifierName);
    await page.getByLabel('Organization *').click();
    await page.getByRole('option', { name: 'Default' }).click();
    await page.getByLabel('Notification type *').click();
    await page.getByRole('option', { name: 'Mattermost' }).click();

    await page
      .getByTestId('notification-configuration-mattermost-url')
      .fill('https://mattermost.example.com');
    await page
      .getByTestId('notification-configuration-mattermost-username')
      .fill('mattermost-user');
    await page
      .getByTestId('notification-configuration-mattermost-channel-form-group')
      .locator('input')
      .fill('test-channel');
    await page
      .getByTestId('notification-configuration-mattermost-icon-url')
      .fill('https://icon.example.com');
    await page.getByTestId('notification_configuration-mattermost_no_verify_ssl').click();

    await page.getByRole('button', { name: 'Save notifier' }).click();
    await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

    await Notifier.ui.delete(page, notifierName);
  });

  test('should create and delete Pagerduty notifier', { tag: ['@not_mock'] }, async ({ page }) => {
    const notifierName = createE2EName('notifier-Pagerduty');

    await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
    await page.getByText('Create notifier', { exact: true }).click();
    await page.getByPlaceholder('Enter notifier name').fill(notifierName);
    await page.getByLabel('Organization *').click();
    await page.getByRole('option', { name: 'Default' }).click();
    await page.getByLabel('Notification type *').click();
    await page.getByRole('option', { name: 'Pagerduty' }).click();

    await page.getByTestId('notification-configuration-subdomain').fill('test-subdomain');
    await page.getByTestId('notification-configuration-token').fill('test-token');
    await page.getByTestId('notification-configuration-service-key').fill('test-service-key');
    await page.getByTestId('notification-configuration-client-name').fill('test-client');

    await page.getByRole('button', { name: 'Save notifier' }).click();
    await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

    await Notifier.ui.delete(page, notifierName);
  });

  test(
    'should create and delete Rocket.Chat notifier',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const notifierName = createE2EName('notifier-RocketChat');

      await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
      await page.getByText('Create notifier', { exact: true }).click();
      await page.getByPlaceholder('Enter notifier name').fill(notifierName);
      await page.getByLabel('Organization *').click();
      await page.getByRole('option', { name: 'Default' }).click();
      await page.getByLabel('Notification type *').click();
      await page.getByRole('option', { name: 'Rocket.Chat' }).click();

      await page
        .getByTestId('notification-configuration-rocketchat-url')
        .fill('https://rocketchat.example.com');
      await page
        .getByTestId('notification-configuration-rocketchat-username-form-group')
        .locator('input')
        .fill('rocketchat-user');
      await page
        .getByTestId('notification-configuration-rocketchat-icon-url-form-group')
        .locator('input')
        .fill('https://icon.example.com');
      await page.getByTestId('notification_configuration-rocketchat_no_verify_ssl').click();

      await page.getByRole('button', { name: 'Save notifier' }).click();
      await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

      await Notifier.ui.delete(page, notifierName);
    }
  );

  test('should create and delete Slack notifier', { tag: ['@not_mock'] }, async ({ page }) => {
    const notifierName = createE2EName('notifier-Slack');

    await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
    await page.getByText('Create notifier', { exact: true }).click();
    await page.getByPlaceholder('Enter notifier name').fill(notifierName);
    await page.getByLabel('Organization *').click();
    await page.getByRole('option', { name: 'Default' }).click();
    await page.getByLabel('Notification type *').click();
    await page.getByRole('option', { name: 'Slack' }).click();

    await page.getByPlaceholder('Enter token').fill('test-token');
    await page.getByPlaceholder('Enter destination channels').fill('#test-channel');
    await page.getByTestId('notification-configuration-hex-color').fill('#3366ff');

    await page.getByRole('button', { name: 'Save notifier' }).click();
    await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

    await Notifier.ui.delete(page, notifierName);
  });

  test('should create and delete Twilio notifier', { tag: ['@not_mock'] }, async ({ page }) => {
    const notifierName = createE2EName('notifier-Twilio');

    await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
    await page.getByText('Create notifier', { exact: true }).click();
    await page.getByPlaceholder('Enter notifier name').fill(notifierName);
    await page.getByLabel('Organization *').click();
    await page.getByRole('option', { name: 'Default' }).click();
    await page.getByLabel('Notification type *').click();
    await page.getByRole('option', { name: 'Twilio' }).click();

    await page.getByTestId('notification-configuration-account-sid').fill('test-sid');
    await page
      .getByTestId('notification-configuration-account-token-form-group')
      .locator('input')
      .fill('test-token');
    await page
      .getByTestId('notification-configuration-from-number-form-group')
      .locator('input')
      .fill('+1234567890');
    await page.getByTestId('notification-configuration-to-numbers').fill('+0987654321');

    await page.getByRole('button', { name: 'Save notifier' }).click();
    await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

    await Notifier.ui.delete(page, notifierName);
  });

  test('should create and delete Webhook notifier', { tag: ['@not_mock'] }, async ({ page }) => {
    const notifierName = createE2EName('notifier-Webhook');

    await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
    await page.getByText('Create notifier', { exact: true }).click();
    await page.getByPlaceholder('Enter notifier name').fill(notifierName);
    await page.getByLabel('Organization *').click();
    await page.getByRole('option', { name: 'Default' }).click();
    await page.getByLabel('Notification type *').click();
    await page.getByRole('option', { name: 'Webhook' }).click();

    await page.getByTestId('notification-configuration-username').fill('webhook-user');
    await page.getByTestId('notification-configuration-url').fill('https://webhook.example.com');
    await page.getByTestId('notification_configuration-disable_ssl_verification').click();
    await page.getByTestId('notification-configuration-http-method').click();
    await page.getByRole('option', { name: 'POST' }).click();

    await page.getByRole('button', { name: 'Save notifier' }).click();
    await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

    await Notifier.ui.delete(page, notifierName);
  });
});

test.describe('Notifiers - Details Page', () => {
  test(
    'should test and delete a notifier from details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);
      const notifierName = await Notifier.ui.createSlack(page);
      await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
      await clickTableRow({ text: notifierName }, page);
      await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

      await clickPageAction('Test notifier', page);

      const statusLocator = page.getByTestId('status');
      await expect(statusLocator.getByText(/Pending|Running|Failed|Success/i)).toBeVisible({
        timeout: 30000,
      });

      // Use force-delete with retries since UI/API deletion is blocked while notifications are pending
      await Notifier.api.forceDeleteByName(page, notifierName);
    }
  );

  test(
    'should edit a notifier from details page and verify changes',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const notifierName = await Notifier.ui.createSlack(page);
      await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
      await clickTableRow({ text: notifierName }, page);

      await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

      await expect(page.getByTestId('notification-type')).toContainText('slack');
      await expect(page.getByTestId('destination-channels').locator('textarea')).toHaveValue(
        '#test-channel'
      );
      await expect(page.getByTestId('notification-color')).toContainText('#3366ff');

      await clickPageAction('Edit notifier', page);
      await expect(page.getByRole('heading', { name: `Edit ${notifierName}` })).toBeVisible();

      await page.getByTestId('notification-configuration-channels').fill('#new-test-channel');
      await page.getByTestId('notification-configuration-hex-color').fill('#123abc');

      await page.getByRole('button', { name: 'Save notifier' }).click();
      await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

      await expect(page.getByTestId('destination-channels').locator('textarea')).toHaveValue(
        '#new-test-channel'
      );
      await expect(page.getByTestId('notification-color')).toContainText('#123abc');

      await Notifier.ui.delete(page, notifierName);
    }
  );

  test(
    'should duplicate a notifier from details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const notifierName = await Notifier.ui.createSlack(page);
      await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
      await clickTableRow({ text: notifierName }, page);
      await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

      const copyResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/notification_templates/') &&
          response.url().includes('/copy/') &&
          response.status() === 201
      );

      await clickPageAction('Duplicate notifier', page);

      const copyResponse = await copyResponsePromise;
      const copiedNotifier = (await copyResponse.json()) as { name: string; id: number };
      const copiedName = copiedNotifier.name;

      await expect(page.getByTestId('alert-toaster')).toContainText('duplicated');

      await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');

      await Notifier.ui.delete(page, copiedName);
      await Notifier.ui.delete(page, notifierName);
    }
  );
});
