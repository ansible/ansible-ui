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
  const username = options?.username ?? process.env.PLATFORM_USERNAME!;
  const password = options?.password ?? process.env.PLATFORM_PASSWORD!;
  const usernameField = page.locator('#pf-login-username-id');
  const toolbarUser = page.getByTestId('toolbar').getByRole('button', { name: username });

  // SPA bootstrap can hang on `load` (long-lived requests). DOMContentLoaded is
  // enough to start waiting for the login form or the authenticated shell.
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await expect(page).toHaveTitle(/Ansible/, { timeout: 30_000 });

  // PatternFly Spinner aria-label is "Contents" while the app hydrates. Do not
  // fill the login fields until the form (or an already-authenticated toolbar)
  // is actually on the page.
  const loginReady = usernameField.or(toolbarUser).first();
  try {
    await expect(loginReady).toBeVisible({ timeout: 30_000 });
  } catch {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(loginReady).toBeVisible({ timeout: 30_000 });
  }

  if (await toolbarUser.isVisible().catch(() => false)) {
    return;
  }

  await usernameField.fill(username);
  await page.locator('#pf-login-password-id').fill(password);
  await page.click('button[type="submit"]');

  await expect(toolbarUser).toBeVisible({ timeout: 30_000 });
}
