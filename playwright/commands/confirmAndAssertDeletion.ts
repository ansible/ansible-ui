import { expect } from '@playwright/test';
import { Page } from 'playwright-core';

/**
 * Confirms the deletion process on the given page.
 *
 * This function performs the following steps:
 * 1. Clicks the confirm button.
 * 2. Clicks the submit button.
 * 3. Verifies that the progress description contains the text 'Success'.
 * 4. Clicks the close button.
 * 5. Ensures that the dialog is hidden.
 *
 * @param page - The Playwright Page object representing the browser page.
 */
export async function confirmAndAssertDeletion(page: Page) {
  await page.locator('#confirm').click();
  await page.locator('#submit').click();
  while (await page.getByText('Pending').last().isVisible()) {
    await page.getByText('Pending').last().isHidden();
  }
  while (await page.getByRole('button', { name: 'Retry', exact: true }).isVisible()) {
    await page.getByRole('button', { name: 'Retry' }).click();
    while (await page.getByText('Pending').isVisible()) {
      await page.getByText('Pending').isHidden();
    }
    if (await page.getByRole('button', { name: 'Success', exact: true }).isVisible()) {
      continue;
    }
  }
  await expect(page.getByRole('gridcell', { name: 'Success' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
}
