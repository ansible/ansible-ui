import { expect, Page } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';
import { navigateTo } from '../commands/navigateTo';

export interface SystemSettings {
  REDHAT_USERNAME?: string;
  REDHAT_PASSWORD?: string;
  SUBSCRIPTIONS_CLIENT_ID?: string;
  SUBSCRIPTIONS_CLIENT_SECRET?: string;
  AUTOMATION_ANALYTICS_URL?: string;
  INSIGHTS_TRACKING_STATE?: boolean;
  [key: string]: unknown;
}

export const Settings = {
  api: {
    getSystem: async (page: Page): Promise<SystemSettings> => {
      const settings = await awxAPI.get<SystemSettings>(page, '/settings/system/');
      if (!settings) {
        throw new Error('Failed to get system settings: API returned null');
      }
      return settings;
    },

    patchSystem: async (page: Page, data: Partial<SystemSettings>): Promise<SystemSettings> => {
      const settings = await awxAPI.patch<SystemSettings>(page, '/settings/system/', data);
      if (!settings) {
        throw new Error('Failed to patch system settings: API returned null');
      }
      return settings;
    },
  },

  ui: {
    revertAll: async (page: Page, category: string): Promise<void> => {
      await navigateTo(page, 'Settings', 'Automation Execution', category);

      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await page.getByRole('button', { name: 'Revert all to default', exact: true }).click();

      const confirmDialog = page.getByRole('dialog', { name: 'Revert settings confirmation' });
      await expect(confirmDialog).toBeVisible();
      await page.getByRole('button', { name: 'Confirm revert all', exact: true }).click();

      await expect(confirmDialog).toBeHidden();
    },
  },
} as const;
