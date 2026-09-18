import { Page, expect } from '@playwright/test';

export let platformUI = process.env.PLATFORM_UI ?? '';
if (!platformUI) {
  if (process.env.DEV_SERVER_PROTOCOL === 'http') {
    platformUI = 'http://localhost:4100';
  } else {
    platformUI = 'https://localhost:4100';
  }
}
// Remove trailing slash to prevent double slashes when constructing URLs like `${platformUI}/path`
platformUI = platformUI.replace(/\/+$/, '');
platformUI = platformUI.replace(/:\/\/localhost(?=:\d+(?:[/?#]|$))/, '://127.0.0.1');
export const platformURL = new URL(platformUI);

/**
 * Logs into Ansible UI.
 */
export async function login(
  page: Page,
  url: string = platformUI,
  options?: { username?: string; password?: string }
) {
  // Go to the login page
  await page.goto(url);

  // Wait for the login form to be ready
  await expect(page).toHaveTitle(/Ansible/, { timeout: 10000 });

  // Enter the username
  await page.fill('#pf-login-username-id', options?.username ?? process.env.PLATFORM_USERNAME!);

  // Enter the password
  await page.fill('#pf-login-password-id', options?.password ?? process.env.PLATFORM_PASSWORD!);

  // Click the login button
  await page.click('button[type="submit"]');

  // Verify we are logged in
  await expect(
    page
      .getByTestId('toolbar')
      .getByRole('button', { name: options?.username ?? process.env.PLATFORM_USERNAME! })
  ).toBeVisible();
}
