import { expect, test } from '@playwright/test';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { DecisionEnvironment } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/decisions/decision-environments' }));
test.afterEach(setupAfter);

test.describe('EDA Decision Environments List', () => {
  test(
    'should bulk delete Decision Environments from the list',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const deName1 = createE2EName('decision-environment');
      const deName2 = createE2EName('decision-environment');
      let deId1: number | undefined;
      let deId2: number | undefined;

      try {
        await test.step('Create first decision environment via API', async () => {
          const de1 = await DecisionEnvironment.api.create(page, { name: deName1 });
          deId1 = de1.id;
        });

        await test.step('Create second decision environment via API', async () => {
          const de2 = await DecisionEnvironment.api.create(page, { name: deName2 });
          deId2 = de2.id;
        });

        await test.step('Navigate and set table view', async () => {
          await navigateTo(page, 'Automation Decisions', 'Decision Environments');
          await page.getByRole('button', { name: 'table view' }).click();
        });

        await test.step('Select first decision environment', async () => {
          await filterTable(
            {
              pageTitle: 'Decision Environments',
              filterLabel: 'Name',
              filterValue: deName1,
            },
            page
          );
          await page.getByRole('checkbox', { name: 'Select row' }).first().click();
          await clearTableFilters(page);
        });

        await test.step('Select second decision environment', async () => {
          await filterTable(
            {
              pageTitle: 'Decision Environments',
              filterLabel: 'Name',
              filterValue: deName2,
            },
            page
          );
          await page.getByRole('checkbox', { name: 'Select row' }).first().click();
          await clearTableFilters(page);
        });

        await test.step('Bulk delete selected decision environments', async () => {
          // Click toolbar actions dropdown
          await page.getByRole('button', { name: 'toolbar actions' }).click();
          await page.getByRole('menuitem', { name: 'Delete decision environments' }).click();

          // Confirm deletion
          const dialog = page.getByRole('dialog');
          await dialog.locator('#confirm').click();
          await dialog
            .getByRole('button', { name: 'Delete decision environments', exact: true })
            .click();

          // Verify both deletions succeeded
          await expect(dialog.getByTestId('progress').getByText('Success')).toBeVisible();
        });

        // Clear the IDs since resources were deleted successfully
        deId1 = undefined;
        deId2 = undefined;
      } finally {
        // Cleanup in case bulk delete failed
        if (deId1) {
          try {
            await DecisionEnvironment.api.delete(page, deId1);
          } catch {
            // Ignore cleanup errors
          }
        }
        if (deId2) {
          try {
            await DecisionEnvironment.api.delete(page, deId2);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );

  test(
    'should verify the delete functionality of items in the kebab menu of the DE card view',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const deName = createE2EName('decision-environment');
      let deId: number | undefined;

      try {
        await test.step('Create decision environment via API', async () => {
          const de = await DecisionEnvironment.api.create(page, { name: deName });
          deId = de.id;
        });

        await test.step('Navigate to Decision Environments list', async () => {
          await navigateTo(page, 'Automation Decisions', 'Decision Environments');
          await expect(
            page.getByRole('heading', { name: 'Decision Environments', exact: true })
          ).toBeVisible();
        });

        await test.step('Switch to table view and filter', async () => {
          await page.getByRole('button', { name: 'table view' }).click();
          await filterTable(
            {
              pageTitle: 'Decision Environments',
              filterLabel: 'Name',
              filterValue: deName,
            },
            page
          );
        });

        await test.step('Switch to card view', async () => {
          await page.getByRole('button', { name: 'card view' }).click();
        });

        await test.step('Delete from card kebab menu', async () => {
          // Find the card by data-ouia-component-id and click kebab dropdown
          const card = page.locator(`[data-ouia-component-id="${deId}"]`);
          await card.getByLabel('kebab dropdown toggle').click();

          // Click delete option from menu
          await page
            .locator('.pf-v6-c-menu__content')
            .getByRole('menuitem', { name: 'Delete decision environment' })
            .click();

          // Confirm deletion in dialog
          const dialog = page.getByRole('dialog');
          await dialog.locator('#confirm').click();
          await dialog.getByRole('button', { name: /Delete decision environment/i }).click();

          // Verify success
          await expect(dialog.getByTestId('progress').getByText('Success')).toBeVisible();

          await clearTableFilters(page);
        });

        // Clear deId since deletion was successful
        deId = undefined;
      } finally {
        if (deId) {
          try {
            await DecisionEnvironment.api.delete(page, deId);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );
});
