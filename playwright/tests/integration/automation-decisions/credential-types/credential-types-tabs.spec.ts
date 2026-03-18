import { expect, test } from '@playwright/test';
import type { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { edaAPI } from '@ansible/playwright/commands/apiClient';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { getTableRow } from '@ansible/playwright/commands/getTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { EdaCredentialType, Organization } from '@ansible/playwright/utils';
import { EdaOrganization } from '@ansible/playwright/utils/edaOrganization';

test.beforeEach(setupBefore({ path: '/decisions/infrastructure/credential-types' }));
test.afterEach(setupAfter);

test.describe('EDA Credentials Type - Tabs', () => {
  let organization: PlatformOrganization;
  let edaOrgId: number;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
    const ansibleId = organization.summary_fields?.resource?.ansible_id;
    if (!ansibleId) {
      throw new Error('Platform organization missing ansible_id');
    }
    const edaOrganization = await EdaOrganization.api.getByAnsibleId(page, ansibleId);
    edaOrgId = edaOrganization.id;
  });

  test.afterEach(async ({ page }) => {
    await Organization.api.delete(page, organization.id);
  });

  test(
    'can view credentials in use via Credentials Tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credTypeName = await EdaCredentialType.ui.create(page);
      let credentialId: number | undefined;
      const credentialName = createE2EName('credential');

      try {
        await test.step('Get credential type ID', async () => {
          const credentialTypes = await edaAPI.get<{
            results: Array<{ id: number; name: string }>;
          }>(page, `credential-types/?name=${encodeURIComponent(credTypeName)}`);
          const credType = credentialTypes?.results?.[0];
          if (!credType) {
            throw new Error('Credential type not found');
          }

          // Create credential via API
          const credential = (await edaAPI.post(page, '/eda-credentials/', {
            name: credentialName,
            organization_id: edaOrgId,
            credential_type_id: credType.id,
            description: 'This is a Credential with custom credential type',
            inputs: {
              username: 'test_username',
            },
          })) as { id: number };
          credentialId = credential.id;
        });

        await test.step('Navigate to credential type details', async () => {
          await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credential Types');
          await clickTableRow(
            {
              text: credTypeName,
              filterLabel: 'Name',
              filterValue: credTypeName,
              clearFilters: true,
            },
            page
          );
          await expect(
            page.getByRole('heading', { name: credTypeName, exact: true })
          ).toBeVisible();
        });

        await test.step('Click Credentials tab and view credential', async () => {
          await page.getByRole('tab', { name: 'Credentials' }).click();

          // Click credential row to view details
          await clickTableRow(
            {
              text: credentialName,
              filterLabel: 'Name',
              filterValue: credentialName,
              clearFilters: true,
            },
            page
          );
          await expect(
            page.getByRole('heading', { name: credentialName, exact: true })
          ).toBeVisible();
        });
      } finally {
        if (credentialId) {
          await edaAPI.delete(page, `/eda-credentials/${credentialId}/`);
        }
        await EdaCredentialType.ui.delete(page, credTypeName);
      }
    }
  );

  test('can remove credentials via Credentials Tab', { tag: ['@not_mock'] }, async ({ page }) => {
    const credTypeName = await EdaCredentialType.ui.create(page);
    const credentialName = createE2EName('credential');
    let credentialId: number | undefined;

    try {
      await test.step('Create credential via API', async () => {
        const credentialTypes = await edaAPI.get<{ results: Array<{ id: number; name: string }> }>(
          page,
          `credential-types/?name=${encodeURIComponent(credTypeName)}`
        );
        const credType = credentialTypes?.results?.[0];
        if (!credType) {
          throw new Error('Credential type not found');
        }

        const credential = (await edaAPI.post(page, '/eda-credentials/', {
          name: credentialName,
          organization_id: organization.id,
          credential_type_id: credType.id,
          description: 'This is a Credential with custom credential type',
          inputs: {
            username: 'test_username',
          },
        })) as { id: number };
        credentialId = credential.id;
      });

      await test.step('Navigate to credential type details', async () => {
        await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credential Types');
        await clickTableRow(
          {
            text: credTypeName,
            filterLabel: 'Name',
            filterValue: credTypeName,
            clearFilters: true,
          },
          page
        );
        await expect(page.getByRole('heading', { name: credTypeName, exact: true })).toBeVisible();
      });

      await test.step('Click Credentials tab', async () => {
        await page.getByRole('tab', { name: 'Credentials' }).click();
      });

      await test.step('Select and delete credential', async () => {
        const row = await getTableRow(page, credentialName);
        await row.getByRole('checkbox', { name: 'Select row' }).check();

        // Click toolbar actions and delete
        await page.getByRole('button', { name: 'toolbar actions' }).click();
        await page.getByRole('menuitem', { name: 'Delete credentials' }).click();

        // Confirm deletion
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.locator('#confirm').click();
        await dialog.getByRole('button', { name: 'Delete credentials', exact: true }).click();

        // Verify deletion
        await expect(dialog).not.toBeVisible();
        await expect(page.getByRole('row', { name: credentialName })).not.toBeVisible();
      });
    } finally {
      // Clean up credential first (if it exists)
      if (credentialId) {
        try {
          await edaAPI.delete(page, `/eda-credentials/${credentialId}/`);
        } catch {
          // Credential may have been deleted by the test, ignore errors
        }
      }
      // Then clean up credential type
      await EdaCredentialType.ui.delete(page, credTypeName);
    }
  });
});
