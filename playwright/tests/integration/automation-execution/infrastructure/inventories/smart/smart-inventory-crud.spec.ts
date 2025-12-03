import { expect, test } from '@playwright/test';
import { clickPageAction } from '../../../../../../commands/clickPageAction';
import { confirmAndAssertDeletion } from '../../../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../../../commands/createE2EName';
import { navigateTo } from '../../../../../../commands/navigateTo';
import { Organization } from '../../../../../../utils/organization';
import { setupAfter, setupBefore } from '../../../../../../commands/setup';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test.describe('Smart Inventory', () => {
  test(
    'can create, edit a smart inventory, assert info on details page, and delete inventory',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await Organization.ui.create(page);
      const smartInvName = createE2EName('smart-inventory');

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await page.getByLabel('dropdown toggle', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create smart inventory' }).click();

      await page.getByPlaceholder('Enter inventory name').fill(smartInvName);
      await page.getByPlaceholder('Enter description').fill('description');
      await page.getByPlaceholder('Enter smart host filter').fill('name=host1');
      await page.getByLabel('Organization *').click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(organizationName);
      await page.getByRole('option', { name: organizationName }).click();

      await page.getByRole('button', { name: 'Create inventory' }).click();

      await expect(page.getByRole('heading', { name: smartInvName, exact: true })).toBeVisible();
      await expect(page.locator('#name')).toContainText(smartInvName);
      await expect(page.locator('#description')).toContainText('description');
      await expect(page.locator('#organization')).toContainText(organizationName);
      await expect(page.getByLabel('Label group category').getByRole('listitem')).toContainText(
        'name=host1'
      );

      await clickPageAction('Edit inventory', page);
      await page.getByPlaceholder('Enter smart host filter').clear();
      await page.getByPlaceholder('Enter smart host filter').fill('name=host2');
      await page.getByPlaceholder('Enter description').clear();
      await page.getByPlaceholder('Enter description').fill('updated description');
      await page.getByRole('button', { name: 'Save inventory' }).click();

      await expect(page.locator('#description')).toContainText('updated description');
      await expect(page.getByLabel('Label group category').getByRole('listitem')).toContainText(
        'name=host2'
      );

      await clickPageAction('Delete inventory', page);
      await confirmAndAssertDeletion(page);
      await expect(page.getByRole('heading', { name: 'Inventories', exact: true })).toBeVisible();
      await Organization.ui.delete(page, organizationName);
    }
  );
});
