import { expect, test } from '@playwright/test';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTableByText } from '@ansible/playwright/commands/filterTableByText';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { RemoteRegistry } from '@ansible/playwright/utils';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Execution Environments - List Operations', () => {
  test(
    'should create, edit, and delete execution environment via UI',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const remoteRegistry = await RemoteRegistry.api.create(page);
      const eeName = createE2EName('ee', { noWhitespace: true }).toLowerCase();
      const upstreamName = createE2EName('upstream', { noWhitespace: true }).toLowerCase();

      try {
        await test.step('Navigate to Execution Environments and start creation', async () => {
          await navigateTo(page, 'Automation Content', 'Execution Environments');
          await expect(page.getByTestId('page-title')).toHaveText('Execution Environments');

          await page.getByTestId('create-execution-environment').click();
        });

        await test.step('Fill in execution environment form and submit', async () => {
          await expect(
            page.getByRole('heading', { name: 'Create execution environment' })
          ).toBeVisible();

          await page.getByTestId('name').fill(eeName);
          await page.getByTestId('upstream-name').fill(upstreamName);

          await page.locator('#registry').click();
          await page.getByLabel('Search input').fill(remoteRegistry.name);
          await page.getByRole('option', { name: remoteRegistry.name }).click();

          await page.getByTestId('Submit').click();
        });

        await test.step('Verify execution environment was created', async () => {
          await filterTableByText({ filterValue: eeName }, page);

          await expect(page.getByRole('row').filter({ hasText: eeName })).toBeVisible();
          await expect(page.getByTestId('name-column-cell')).toContainText(eeName);

          await page.getByRole('link', { name: eeName, exact: true }).click();
        });

        await test.step('Edit execution environment - add description', async () => {
          await page.getByTestId('edit-execution-environment').click();

          await page.getByTestId('description').click();
          await page.getByTestId('description').fill('nice new description');
          await page.getByTestId('upstream-name').click();
          await page.getByTestId('upstream-name').clear();
          await page.getByTestId('upstream-name').fill('pulp/pulp-fixtures/new');

          await page.getByTestId('Submit').click();
        });

        await test.step('Verify description was added', async () => {
          await navigateTo(page, 'Automation Content', 'Execution Environments');
          await filterTableByText({ filterValue: eeName }, page);

          await expect(page.getByTestId('description-column-cell')).toContainText(
            'nice new description'
          );

          // Navigate back to details page for next edit step
          await clickTableRow({ filterLabel: 'Name', text: eeName }, page);
          await expect(page).toHaveURL(new RegExp(`/execution-environments/${eeName}`));
        });

        await test.step('Edit execution environment - revert upstream name', async () => {
          await page.getByTestId('edit-execution-environment').click();

          await page.getByTestId('upstream-name').click();
          await page.getByTestId('upstream-name').clear();
          await page.getByTestId('upstream-name').fill(upstreamName);

          await page.getByTestId('Submit').click();
        });

        await test.step('Delete execution environment from list', async () => {
          await navigateTo(page, 'Automation Content', 'Execution Environments');
          await filterTableByText({ filterValue: eeName }, page);

          await expect(page.getByTestId('name-column-cell')).toContainText(eeName);

          await page.getByTestId('actions-column-cell').getByTestId('actions-dropdown').click();
          await page.getByTestId('delete-execution-environment').click();
        });

        await test.step('Confirm deletion and verify removal', async () => {
          await expect(page.getByText('Permanently delete execution environments')).toBeVisible();
          await expect(page.locator('.pf-v6-c-alert.pf-m-danger')).not.toBeVisible();

          await page.locator('#confirm').check();
          await page.getByRole('button', { name: 'Delete execution environments' }).click();

          await expect(page.getByText('Permanently delete execution environments')).not.toBeVisible(
            { timeout: 30000 }
          );

          await expect(page.getByText('No results found')).toBeVisible();
          await expect(
            page.getByText(
              'No results match this filter criteria. Clear all filters and try again.'
            )
          ).toBeVisible();
        });
      } finally {
        await RemoteRegistry.api.delete(page, remoteRegistry.id);
      }
    }
  );
});
