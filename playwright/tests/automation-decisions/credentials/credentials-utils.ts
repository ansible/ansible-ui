import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../../../commands/clickPageAction';
import { clickTableRow } from '../../../commands/clickTableRow';
import { createE2EName } from '../../../commands/createE2EName';
import { navigateTo } from '../../../commands/navigateTo';

export async function createEdaCredential(options: { credentialName?: string }, page: Page) {
  await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
  await page.getByText('Create credential').click();
  const credentialName = options.credentialName ?? createE2EName('credential');
  await page.getByPlaceholder('Enter credential name').fill(credentialName);
  await page.getByRole('button', { name: 'Organization' }).click();
  await page.getByRole('option', { name: 'Default' }).click();
  await page.getByRole('button', { name: 'Select credential type' }).click();
  await page.getByRole('option', { name: 'Red Hat Ansible Automation' }).click();
  await page.getByRole('textbox', { name: 'Red Hat Ansible Automation' }).click();
  await page.getByRole('textbox', { name: 'Red Hat Ansible Automation' }).fill('https://1.1.1.1/');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('test');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.getByRole('button', { name: 'Create credential' }).click();
  await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
  return credentialName;
}

export async function createEdaEventStreamCredential(
  options: { credentialName?: string },
  page: Page
) {
  await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
  await page.getByText('Create credential').click();
  const credentialName = options.credentialName ?? createE2EName('credential');
  await page.getByPlaceholder('Enter credential name').fill(credentialName);
  await page.getByRole('button', { name: 'Organization' }).click();
  await page.getByRole('option', { name: 'Default' }).click();
  await page.getByRole('button', { name: 'Select credential type' }).click();
  await page.getByRole('option', { name: 'Basic Event Stream' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('test');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.getByRole('button', { name: 'Create credential' }).click();
  await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
  return credentialName;
}

export async function deleteEdaCredential(credentialName: string, page: Page) {
  await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
  await clickTableRow(
    {
      text: credentialName,
      pageTitle: 'Credentials',
      filterLabel: 'Name',
      filterValue: credentialName,
      clearFilters: true,
    },
    page
  );
  await clickPageAction('Delete credential', page);
  await page.locator('#confirm').click();
  await page.locator('#submit').click();
  await expect(page.locator('[data-ouia-component-type="PF5/ModalContent"]')).toContainText(
    'Success'
  );
}
