import { Page } from '@playwright/test';

/**
 * Click a kebab action and confirm the Hub bulk confirmation modal.
 *
 * Handles the Hub bulk confirmation flow with TWO dialogs:
 * 1. Confirmation dialog (checkbox + submit button)
 * 2. Action progress dialog (shows progress, then Close button)
 */
export async function clickKebabActionAndConfirm(actionTestId: string, page: Page) {
  await page.getByTestId('actions-dropdown').click();
  await page.getByTestId(actionTestId).click();

  const modal = page.getByRole('dialog');
  await modal.waitFor({ state: 'visible' });

  await modal.getByTestId('confirm').click();
  await modal.getByTestId('submit').click();

  const closeButton = modal.getByRole('button', { name: 'Close' });
  await closeButton.waitFor({ state: 'visible', timeout: 30000 });
  await closeButton.click();

  await modal.waitFor({ state: 'hidden' });
}
