import { expect, test } from '@playwright/test';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { login } from '@ansible/playwright/commands/login';
import { logout } from '@ansible/playwright/commands/logout';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { createAuthenticationMethod } from './authentication-utils';

test.beforeEach(setupBefore({ path: '/access/authenticators' }));
test.afterEach(setupAfter);
test.setTimeout(2 * 60 * 1000);
test(
  'Azure AD Authentication form - create, edit, update and delete',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const authMethodName = await createAuthenticationMethod(
      {
        name: 'e2e-azure-ad-auth',
        type: 'Azure AD',
      },
      page
    );
    // getting client ID / OIDC key depending on which field the build has
    const clientIdLocator = page.getByTestId('client-id');
    const oidcKeyLocator = page.getByTestId('oidc-key');
    // if build is up to date and has Client ID, use that, otherwise use OIDC
    const keyLocator = (await clientIdLocator.count()) > 0 ? clientIdLocator : oidcKeyLocator;
    await expect(keyLocator).toContainText('1234abc');
    // getting secret and / OIDC secret depending on which field the build has
    const secretLocator = page.getByTestId('secret');
    const oidcSecretLocator = page.getByTestId('oidc-secret');
    // if build is up to date and has secret, use that, otherwise use OIDC
    const passwordLocator = (await secretLocator.count()) > 0 ? secretLocator : oidcSecretLocator;
    await expect(passwordLocator).toContainText('$encrypted$');
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
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill(`${authMethodName}_edited`);
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
