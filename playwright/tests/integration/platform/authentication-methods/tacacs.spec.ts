import { expect, test } from '@playwright/test';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { createAuthenticationMethod } from './authentication-utils';

test.beforeEach(setupBefore({ path: '/access/authenticators' }));
test.afterEach(setupAfter);

test(
  'TACACS+ auth form - create, edit, update and delete',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const authMethodName = await createAuthenticationMethod(
      {
        name: 'e2e-tacacs-auth',
        type: 'TACACS+',
      },
      page
    );
    await expect(page.locator('#hostname-of-tacacs\\+\\-server')).toContainText(
      'tacacs.example.com'
    );
    await expect(
      page.locator('#shared-secret-for-authenticating-to-tacacs\\+\\-server-')
    ).toContainText('$encrypted$');
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
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill(`${authMethodName}_edited`);
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
