import { Page, expect } from '@playwright/test';

/**
 * Logs out of Platform UI
 */
export async function logout(page: Page) {
  await page.locator('[data-ouia-component-id="account-menu-menu-toggle"]').click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();

  // Verify we are on the AAP page
  await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible();
}
