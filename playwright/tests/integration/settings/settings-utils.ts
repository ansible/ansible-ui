/** @deprecated Use Settings from '@ansible/playwright/utils' instead */

import { expect, Page } from '@playwright/test';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';

export const revertAllSettings = async (page: Page, category: string) => {
  await navigateTo(page, 'Settings', 'Automation Execution', category);

  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('button', { name: 'Revert all to default', exact: true }).click();

  const confirmDialog = page.getByRole('dialog', { name: 'Revert settings confirmation' });
  await expect(confirmDialog).toBeVisible();
  await page.getByRole('button', { name: 'Confirm revert all', exact: true }).click();

  await expect(confirmDialog).toBeHidden();
};
