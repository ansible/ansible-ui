import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { awxAPI } from '../commands/apiClient';

export const Notifier = {
  api: {
    delete: async (page: Page, notifierId: number): Promise<void> => {
      await awxAPI.delete(page, `notification_templates/${notifierId}/`);
    },

    deleteByName: async (page: Page, notifierName: string): Promise<void> => {
      const notifiers = await awxAPI.get<{ results: { id: number; name: string }[] }>(
        page,
        '/notification_templates/',
        { params: { name: notifierName } }
      );
      if (notifiers?.results?.[0]?.id) {
        await awxAPI.delete(page, `notification_templates/${notifiers.results[0].id}/`);
      }
    },

    /** Best-effort delete of a notifier, retrying until pending notifications resolve.
     * AWX blocks deletion while notifications are pending (405), so we retry with delays.
     * This is cleanup code — it will not fail the test if deletion cannot complete in time. */
    forceDeleteByName: async (
      page: Page,
      notifierName: string,
      timeout = 120000
    ): Promise<void> => {
      const notifiers = await awxAPI.get<{ results: { id: number; name: string }[] }>(
        page,
        '/notification_templates/',
        { params: { name: notifierName } }
      );
      const notifierId = notifiers?.results?.[0]?.id;
      if (!notifierId) return;

      const start = Date.now();
      while (Date.now() - start < timeout) {
        try {
          await awxAPI.delete(page, `notification_templates/${notifierId}/`);
          return;
        } catch {
          await page.waitForTimeout(5000);
        }
      }
    },
  },
  ui: {
    createSlack: async (page: Page): Promise<string> => {
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
      return notifierName;
    },

    delete: async (page: Page, notifierName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Administration', 'Notifiers');
      await clickTableRow({ filterLabel: 'Name', text: notifierName, clearFilters: true }, page);
      await clickPageAction('Delete Notifier', page);
      await confirmAndAssertDeletion(page);
    },
  },
} as const;
