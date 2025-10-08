import { test } from '@playwright/test';
import { clickTableRowAction } from '../../../../commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '../../../../commands/confirmAndAssertDeletion';
import { filterTable } from '../../../../commands/filterTable';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import { createAuthenticationMethod } from './authentication-utils';

test.beforeEach(setupBefore({ path: '/access/authenticators' }));
test.afterEach(setupAfter);

test(
  'Create local authenticator in ui, verify details and enable it',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const authMethodName = await createAuthenticationMethod(
      {
        name: 'e2e-local-auth',
        type: 'Local',
      },
      page
    );
    await page.getByRole('tab', { name: 'Back to Authentication Methods' }).click();
    await filterTable({ filterValue: authMethodName }, page);
    await page.getByRole('gridcell', { name: 'Click to enable' }).locator('span').first().click();
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
