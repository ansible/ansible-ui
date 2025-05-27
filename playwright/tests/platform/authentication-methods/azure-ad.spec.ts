import { expect, test } from '@playwright/test';
import { createAuthenticationMethod } from './authentication-utils';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { logout } from '../../../commands/logout';
import { login } from '../../../commands/login';
import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
import { navigateTo } from '../../../commands/navigateTo';
import { clickTableRowAction } from '../../../commands/clickTableRowAction';
import { filterTable } from '../../../commands/filterTable';

test.beforeEach(setupBefore({ path: '/access/authenticators' }));
test.afterEach(setupAfter);

test(
  'Azure AD Authentication form - create, edit, update and delete',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const authMethodName = await createAuthenticationMethod(
      {
        name: 'e2e-azure-ad-auth',
        type: 'Azuread',
      },
      page
    );
    await expect(page.locator('#oidc-key')).toContainText('1234abc');
    await expect(page.locator('#oidc-secret')).toContainText('$encrypted$');
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
