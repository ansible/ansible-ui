import { Page, expect } from '@playwright/test';
import { createE2EName } from '../../../../commands/createE2EName';
import { navigateTo } from '../../../../commands/navigateTo';
import { filterTableBySelect } from '../../../../commands/filterTableBySelect';
import { clearTableFilters } from '../../../../commands/clearTableFilters';
import { selectTableFilter } from '../../../../commands/selectTableFilter';

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
  await clearTableFilters(page);
  await selectTableFilter('Name', page);
  await filterTableBySelect(notifierName, page);
  await page.getByRole('row', { name: notifierName }).getByLabel('Select row').click();
  await page.getByLabel('toolbar actions').click();
  await page.getByRole('menuitem', { name: 'Delete Notifier' }).click();
  await page.getByText('Yes, I confirm that I want to').click();
  await page.getByRole('button', { name: 'Delete notifiers' }).click();
  await expect(page.getByRole('heading', { name: 'Notifiers', exact: true })).toBeVisible();
}
