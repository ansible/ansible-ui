import { Page, expect } from '@playwright/test';
import { createE2EName } from '../../../../commands/createE2EName';
import { navigateTo } from '../../../../commands/navigateTo';

export async function createSlackNotifier(page: Page) {
  const notifierName = createE2EName('notifier');

  await navigateTo(
    page,
    'Automation ExecutionAutomation Controller',
    'Administration',
    'Notifiers'
  );

  const listCreateButton = page.getByRole('button', { name: 'Create notifier' });
  const emptyPageCreateButton = page.getByRole('link', { name: 'Create notifier' });
  await listCreateButton.or(emptyPageCreateButton).first().click();

  await page.getByPlaceholder('Enter notifier name').click();
  await page.getByPlaceholder('Enter notifier name').fill(notifierName);
  await page.getByLabel('Organization *').click();
  await page.getByRole('option', { name: 'Default The default' }).click();
  await page.getByLabel('Notification type *').click();
  await page.getByRole('option', { name: 'Slack' }).click();
  await page.getByPlaceholder('Enter token').click();
  await page.getByPlaceholder('Enter token').fill('abc');
  await page.getByPlaceholder('Enter destination channels').click();
  await page.getByPlaceholder('Enter destination channels').fill('#abc');
  await page.getByRole('button', { name: 'Save notifier' }).click();

  await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();

  return notifierName;
}

export async function deleteNotifier(page: Page, notifierName: string) {
  await navigateTo(
    page,
    'Automation ExecutionAutomation Controller',
    'Administration',
    'Notifiers'
  );

  await page.getByPlaceholder('Enter search').click();
  await page.getByPlaceholder('Enter search').fill(notifierName);
  await page.getByLabel('Select row 0').check();
  await page
    .getByRole('row', { name: 'Select row 0 E2E notifier' })
    .getByLabel('kebab dropdown toggle')
    .click();
  await page.getByRole('menuitem', { name: 'Delete notifier' }).click();
  await page
    .locator('div')
    .filter({ hasText: /^Yes, I confirm that I want to delete these 1 notifiers\.$/ })
    .nth(1)
    .click();
  await page.getByRole('button', { name: 'Delete notifiers' }).click();
  await expect(page.getByRole('heading', { name: 'Notifiers', exact: true })).toBeVisible();
}
