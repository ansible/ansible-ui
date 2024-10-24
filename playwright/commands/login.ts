import { Page, expect } from '@playwright/test';

export const platformUrl = process.env.PLATFORM_UI ?? 'https://localhost:4100';
export const platformURL = new URL(platformUrl);

/**
 * Logs into AWX.
 */
export async function login(page: Page) {
  // Go to the AWX login page
  await page.goto(process.env.PLATFORM_UI ?? platformUrl);

  // Verify we are on the AWX page
  await expect(page).toHaveTitle(/Ansible Automation Platform/);

  // Enter the username
  await page.fill('#pf-login-username-id', process.env.PLATFORM_USERNAME!);

  // Enter the password
  await page.fill('#pf-login-password-id', process.env.PLATFORM_PASSWORD!);

  // Click the login button
  await page.click('button[type="submit"]');

  // Verify we are on the AWX dashboard
  await expect(page.getByText('Welcome to the Ansible Automation Platform')).toBeVisible();
}
