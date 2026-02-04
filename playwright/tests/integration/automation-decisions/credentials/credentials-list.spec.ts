import { expect, test } from '@playwright/test';
import { bulkDeleteResources } from '@ansible/playwright/commands/bulkDeleteResources';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { EdaCredential } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/decisions/infrastructure/credentials' }));
test.afterEach(setupAfter);

test.describe('EDA Credentials List', () => {
  test('should render the Credentials list page', { tag: ['@not_mock'] }, async ({ page }) => {
    await expect(page.getByTestId('page-title')).toHaveText('Credentials');
  });

  test(
    'should render the Credentials details page and show expected information',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('credential');
      let credentialId: number | undefined;

      try {
        await test.step('Create credential via API', async () => {
          const credential = await EdaCredential.api.create(page, {
            name: credentialName,
            credentialTypeName: 'Container Registry',
            description: 'This is a container registry credential',
            inputs: {
              username: 'username',
              password: 'password',
            },
          });
          credentialId = credential.id;
        });

        await test.step('Navigate to credential details page', async () => {
          await clickTableRow(
            {
              text: credentialName,
              pageTitle: 'Credentials',
              filterLabel: 'Name',
              filterValue: credentialName,
              clearFilters: true,
            },
            page
          );
        });

        await test.step('Verify credential details page', async () => {
          await expect(
            page.getByRole('heading', { name: credentialName, exact: true })
          ).toBeVisible();
          await page.getByRole('tab', { name: 'Details' }).click();
          await expect(page.getByTestId('name')).toContainText(credentialName);
        });
      } finally {
        if (credentialId) {
          try {
            await EdaCredential.api.delete(page, credentialId);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );

  test(
    'should filter the Credentials list based on Name',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('credential');
      let credentialId: number | undefined;

      try {
        await test.step('Create credential via API', async () => {
          const credential = await EdaCredential.api.create(page, {
            name: credentialName,
            credentialTypeName: 'Container Registry',
            description: 'This is a container registry credential',
            inputs: {
              username: 'username',
              password: 'password',
            },
          });
          credentialId = credential.id;
        });

        await test.step('Filter credentials by name', async () => {
          await filterTable(
            {
              pageTitle: 'Credentials',
              filterLabel: 'Name',
              filterValue: credentialName,
            },
            page
          );
        });

        await test.step('Verify filtered result', async () => {
          await expect(
            page.locator('td[data-label="Name"]').filter({ hasText: credentialName })
          ).toBeVisible();
        });
      } finally {
        if (credentialId) {
          try {
            await EdaCredential.api.delete(page, credentialId);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );

  test(
    'should bulk delete credentials from the Credentials list',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName1 = createE2EName('credential');
      const credentialName2 = createE2EName('credential');
      let credentialId1: number | undefined;
      let credentialId2: number | undefined;

      try {
        await test.step('Create first credential via API', async () => {
          const credential = await EdaCredential.api.create(page, {
            name: credentialName1,
            credentialTypeName: 'Container Registry',
            description: 'This is a container registry credential',
            inputs: {
              username: 'username',
              password: 'password',
            },
          });
          credentialId1 = credential.id;
        });

        await test.step('Create second credential via API', async () => {
          const credential = await EdaCredential.api.create(page, {
            name: credentialName2,
            credentialTypeName: 'Container Registry',
            description: 'This is a container registry credential',
            inputs: {
              username: 'username',
              password: 'password',
            },
          });
          credentialId2 = credential.id;
        });

        await test.step('Bulk delete credentials', async () => {
          await bulkDeleteResources(
            {
              resourceType: 'credentials',
              resourceNames: [credentialName1, credentialName2],
              filterLabel: 'Name',
              navigationPath: ['Automation Decisions', 'Infrastructure', 'Credentials'],
            },
            page
          );
        });

        // Clear the IDs since resources were deleted successfully
        credentialId1 = undefined;
        credentialId2 = undefined;
      } finally {
        // Cleanup in case bulk delete failed
        if (credentialId1) {
          try {
            await EdaCredential.api.delete(page, credentialId1);
          } catch {
            // Ignore cleanup errors
          }
        }
        if (credentialId2) {
          try {
            await EdaCredential.api.delete(page, credentialId2);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );
});
