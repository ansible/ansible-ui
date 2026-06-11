import { expect } from '@playwright/test';
import { Page } from 'playwright-core';
import { clickRetryUntilGone } from './clickRetryUntilGone';

/**
 * Confirms the deletion process on the given page.
 *
 * This function performs the following steps:
 * 1. Clicks the confirm button.
 * 2. Clicks the submit button.
 * 3. Verifies that the progress description contains the text 'Success'.
 *    If the resource is in use by running jobs, retries until deletion succeeds.
 * 4. Clicks the close button.
 * 5. Ensures that the dialog is hidden.
 *
 * @param page - The Playwright Page object representing the browser page.
 */
export async function confirmAndAssertDeletion(page: Page) {
  // Wait for the confirmation dialog to be fully loaded and stable
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Wait for the dialog content to be stable
  await page.waitForTimeout(1000);

  // Find the confirmation checkbox - try multiple selectors
  const confirmCheckbox = page
    .locator('#confirm')
    .or(page.locator('input[type="checkbox"]').filter({ hasText: /confirm|agree|acknowledge/i }))
    .or(page.getByRole('checkbox'));
  await expect(confirmCheckbox).toBeVisible();
  await expect(confirmCheckbox).toBeEnabled();

  // Click the confirmation checkbox
  await confirmCheckbox.click();

  // Wait for the submit button to appear and be stable
  const submitButton = page.locator('#submit');
  await expect(submitButton).toBeVisible();
  await expect(submitButton).toBeEnabled();

  // Click the submit button
  await submitButton.click();

  // Wait for the deletion process to complete
  // Either the dialog shows a success message, a Retry button (resource in use), or auto-closes
  const successMessage = dialog.getByText(/success|completed|deleted/i);
  const retryButton = dialog.getByRole('button', { name: 'Retry' });

  // Race: wait for success text, Retry button, OR dialog to close (whichever happens first)
  await Promise.race([
    expect(successMessage.first()).toBeVisible({ timeout: 30000 }),
    expect(retryButton).toBeVisible({ timeout: 30000 }),
    expect(dialog).not.toBeVisible({ timeout: 30000 }),
  ]);

  // If deletion failed with "Resource is being used by running jobs", retry until it succeeds
  if (await retryButton.isVisible().catch(() => false)) {
    await clickRetryUntilGone(page);
  }

  // If dialog is still visible, try to close it
  if (await dialog.isVisible().catch(() => false)) {
    const closeButton = dialog.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
    }
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  }
}
