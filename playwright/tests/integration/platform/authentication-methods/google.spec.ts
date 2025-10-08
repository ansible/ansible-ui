import { expect, test } from '@playwright/test';
import { clickTableRowAction } from '../../../../commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '../../../../commands/confirmAndAssertDeletion';
import { filterTable } from '../../../../commands/filterTable';
import { login } from '../../../../commands/login';
import { logout } from '../../../../commands/logout';
import { navigateTo } from '../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import { createAuthenticationMethod } from './authentication-utils';

test.beforeEach(setupBefore({ path: '/access/authenticators' }));
test.afterEach(setupAfter);

test(
  'Google auth form - create, edit, update and delete',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const authMethodName = await createAuthenticationMethod(
      {
        name: 'e2e-google-auth',
        type: 'Google OAuth',
      },
      page
    );
    await expect(page.locator('#google-oauth2-key')).toContainText('GoogleKey');
    await expect(page.locator('#google-oauth2-secret')).toContainText('$encrypted$');
    await page.getByRole('tab', { name: 'Back to Authentication Methods' }).click();
    await filterTable({ filterValue: authMethodName }, page);
    await page.getByRole('gridcell', { name: 'Click to enable' }).locator('span').first().click();
    await logout(page);
    await expect(page.getByRole('link', { name: `${authMethodName}` })).toBeVisible({
      timeout: 10000,
    });
    await login(page);
    await navigateTo(page, 'Access Management', 'Authentication Methods');
    await clickTableRowAction(
      {
        text: `${authMethodName}`,
        action: 'Edit authentication',
        inKebab: true,
      },
      page
    );
    await page.getByRole('textbox', { name: 'Name' }).fill(`${authMethodName}_edited`);
    await page.getByRole('button', { name: 'Save Authentication Method' }).click();
    await expect(page.getByRole('heading')).toContainText(`${authMethodName}_edited`);
    await page.getByRole('tab', { name: 'Back to Authentication Methods' }).click();
    await clickTableRowAction(
      {
        text: `${authMethodName}`,
        action: 'Delete authentication',
        inKebab: true,
      },
      page
    );
    await confirmAndAssertDeletion(page);
  }
);
