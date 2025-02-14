import { Page, expect } from '@playwright/test';

export const platformUI = process.env.PLATFORM_UI
  ? process.env.PLATFORM_UI
  : 'https://localhost:4100';
export const platformURL = new URL(platformUI);

/**
 * Logs into the Ansible Automation Platform UI.
 */
export async function login(page: Page, url: string = platformUI) {
  // Go to the login page
  await page.goto(url);

  // Verify we are on the page
  await expect(page).toHaveTitle(/Ansible Automation Platform/);

  // Enter the username
  await page.fill('#pf-login-username-id', process.env.PLATFORM_USERNAME!);

  // Enter the password
  await page.fill('#pf-login-password-id', process.env.PLATFORM_PASSWORD!);

  // Click the login button
  await page.click('button[type="submit"]');
}
