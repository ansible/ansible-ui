import { Page, expect } from '@playwright/test';

/**
 * Logs out of Platform UI
 */
export async function logout(page: Page, options?: { username?: string }) {
  await page
    .locator('header')
    .getByRole('button', {
      name: `${options?.username ?? process.env.PLATFORM_USERNAME!}`,
      exact: true,
    })
    .click();
  await Promise.all([
    page.waitForURL(/\/login(?:[/?#]|$)/, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    }),
    page.getByRole('menuitem', { name: 'Logout' }).click(),
  ]);

  // Verify we are on the AAP page
  await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible({
    timeout: 30_000,
  });
}
