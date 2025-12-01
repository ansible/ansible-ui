import { expect, Page } from '@playwright/test';
import { navigateTo } from '../commands/navigateTo';

export const Settings = {
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
