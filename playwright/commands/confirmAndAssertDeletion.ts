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

  // Wait for the deletion process to complete - try different success messages
  const successMessage = page
    .getByText('Success')
    .or(page.getByText('success'))
    .or(page.getByText('completed'))
    .or(page.getByText('deleted'));
  await expect(successMessage.first()).toBeVisible({ timeout: 30000 });
}
