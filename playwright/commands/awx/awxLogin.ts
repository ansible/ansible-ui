import { Page, expect } from '@playwright/test';

export async function awxLogin(page: Page) {
  // await page.goto('https://awx.dev-ui.gcp.testing.ansible.com/ui_next');
  // await page.goto(process.env.AWX_SERVER!);
  await page.goto('https://localhost:4101');
  await expect(page).toHaveTitle(/AWX/);
  await page.fill('#pf-login-username-id', process.env.AWX_USENAME!);
  await page.fill('#pf-login-password-id', process.env.AWX_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.click('button[aria-label="Close"]');
  await expect(page.getByText('Welcome to AWX')).toBeVisible();
}
