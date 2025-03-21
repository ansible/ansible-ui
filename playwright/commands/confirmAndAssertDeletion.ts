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

  //while modal is showing
  const pageModal = page.getByRole('dialog');

  while (await pageModal.isVisible()) {
    if (await page.getByText('Pending').last().isVisible()) {
      await page.getByText('Pending').last().isHidden();
    } else if (await page.getByRole('button', { name: 'Retry', exact: true }).isVisible()) {
      await page.getByRole('button', { name: 'Retry' }).click();
    } else if (await page.getByText('Success').first().isVisible()) {
      await page.getByRole('button', { name: 'Close', exact: true }).click();
      continue;
    }
  }
  await expect(pageModal).toBeHidden();
}
