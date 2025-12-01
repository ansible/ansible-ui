import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';

export const Notifier = {
  ui: {
    createSlack: async (page: Page): Promise<string> => {
      const notifierName = createE2EName('notifier');
      await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
      await page.getByText('Create notifier', { exact: true }).click();
      await page.getByPlaceholder('Enter notifier name').fill(notifierName);
      await page.getByLabel('Organization *').click();
      await page.getByRole('option', { name: 'Default' }).click();
      await page.getByLabel('Notification type *').click();
      await page.getByRole('option', { name: 'Slack' }).click();
      await page.getByPlaceholder('Enter token').fill('abc');
      await page.getByPlaceholder('Enter destination channels').fill('#abc');
      await page.getByRole('button', { name: 'Save notifier' }).click();
      await expect(page.getByRole('heading', { name: notifierName, exact: true })).toBeVisible();
      return notifierName;
    },

    delete: async (page: Page, notifierName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
      await clickTableRow({ filterLabel: 'Name', text: notifierName, clearFilters: false }, page);
      await clickPageAction('Delete Notifier', page);
      await confirmAndAssertDeletion(page);
    },
  },
} as const;
