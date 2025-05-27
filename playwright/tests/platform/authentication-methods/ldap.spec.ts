import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createAuthenticationMethod } from './authentication-utils';
import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
import { navigateTo } from '../../../commands/navigateTo';
import { clickTableRowAction } from '../../../commands/clickTableRowAction';
import { filterTable } from '../../../commands/filterTable';

test.beforeEach(setupBefore({ path: '/access/authenticators' }));
test.afterEach(setupAfter);

test(
  'LDAP auth form - create, edit, update and delete',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const authMethodName = await createAuthenticationMethod(
      {
        name: 'e2e-ldap-auth',
        type: 'LDAP',
      },
      page
    );
    await expect(page.getByRole('heading')).toContainText(authMethodName);
    await page.getByRole('tab', { name: 'Back to Authentication Methods' }).click();
    await filterTable({ filterValue: authMethodName }, page);
    await page.getByRole('gridcell', { name: 'Click to enable' }).locator('span').first().click();
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
    await expect(page.locator('[data-cy="page-title"]')).toContainText(`${authMethodName}_edited`);
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
