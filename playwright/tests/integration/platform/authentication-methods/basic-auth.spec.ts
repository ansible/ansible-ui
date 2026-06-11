import { test } from '@playwright/test';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Authentication } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/access/authenticators' }));
test.afterEach(setupAfter);

test(
  'Create local authenticator in ui, verify details and enable it',
  { tag: ['@not_mock', '@tier1'] },
  async ({ page }) => {
    const authMethodName = await Authentication.ui.createMethod(page, {
      name: 'e2e-local-auth',
      type: 'Local',
    });
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
