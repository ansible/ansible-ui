import { Page, expect } from '@playwright/test';

/**
 * Logs into AWX.
 */
export async function awxLogin(page: Page) {
  // Go to the AWX login page
  await page.goto('https://localhost:4101');

  // Verify we are on the AWX page
  await expect(page).toHaveTitle(/AWX/);

  // Enter the username
  await page.fill('#pf-login-username-id', process.env.AWX_USERNAME!);

  // Enter the password
  await page.fill('#pf-login-password-id', process.env.AWX_PASSWORD!);

  // Click the login button
  await page.click('button[type="submit"]');

  // Check "Do not show this message again."
  await page.getByRole('dialog').locator('input[type="checkbox"]').check();

  // Close the welcome modal
  await page.click('button[aria-label="Close"]');

  // Verify we are on the AWX dashboard
  await expect(page.getByText('Welcome to AWX')).toBeVisible();
}
