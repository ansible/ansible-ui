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
  await page.getByRole('menuitem', { name: 'Logout' }).click();

  // Verify we are on the AAP page
  await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible();
}
