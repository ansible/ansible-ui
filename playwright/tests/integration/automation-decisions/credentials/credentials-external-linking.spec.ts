import type { EdaCredential as EdaCredentialInterface } from '@ansible/eda-ui/interfaces/EdaCredential';
import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { SAAS_URL } from '@ansible/playwright/commands/constants';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';
import { EdaCredential } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/infrastructure/credentials' }));
test.afterEach(setupAfter);

test.beforeEach(async ({ page }) => {
  const buildType = await checkBuildType(page);
  if (buildType === SAAS_URL) {
    test.skip();
  }
});

test.describe('EDA Credentials - External Credential Linking', () => {
  test(
    'should disable password field when linked to external credential',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('linked-credential');
      const externalCredentialName = createE2EName('external-cred');
      let externalCredentialId: number | undefined;
      let createdCredentialId: number | undefined;

      try {
        await test.step('Create external credential via API', async () => {
          const externalCredential = await EdaCredential.api.create(page, {
            name: externalCredentialName,
            credentialTypeName: 'HashiCorp Vault Secret Lookup',
            description: 'External credential for field linking test',
            inputs: {
              url: 'https://vault.example.com',
              token: 'test-vault-token',
              api_version: 'v1',
              default_auth_path: '/test/secret',
            },
          });
          externalCredentialId = externalCredential.id;
        });

        await test.step('Navigate and start creation', async () => {
          await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
          await expect(
            page.getByRole('heading', { name: 'Credentials', exact: true })
          ).toBeVisible();
          await page.getByText('Create credential').click();
        });

        await test.step('Fill credential form', async () => {
          await page.getByPlaceholder('Enter credential name').fill(credentialName);
          await singleSelectByLabel('Organization', 'Default', page);
        });

        await test.step('Select Source Control type', async () => {
          await page.getByRole('button', { name: 'Credential type' }).click();
          await page.getByRole('textbox', { name: 'Search input' }).fill('Source Control');
          await page.getByRole('option', { name: 'Source Control' }).click();
        });

        await test.step('Verify password field is initially enabled', async () => {
          await expect(page.getByRole('textbox', { name: 'Password' })).toBeEnabled();
        });

        await test.step('Open secret management modal for password field', async () => {
          const passwordGroup = page.getByTestId('inputs-password-form-group');
          await passwordGroup.getByTestId('secret-management-input').click();
          await expect(page.getByText('Secret Management System')).toBeVisible();
        });

        await test.step('Select external credential in modal', async () => {
          const dialog = page.getByRole('dialog');
          await dialog.getByTestId('id').click();
          const menuContent = page.locator('.pf-v6-c-menu__content');
          await menuContent.getByLabel('Search input').fill(externalCredentialName);
          await menuContent.getByRole('option', { name: externalCredentialName }).click();
        });

        await test.step('Fill metadata fields and submit modal', async () => {
          await page.getByLabel('Path to Secret').fill('/secret/data/test');
          await page.getByLabel('Key Name').fill('password');
          await page.getByRole('button', { name: 'Finish' }).click();
        });

        await test.step('Submit credential form and capture ID', async () => {
          const createResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/eda-credentials') &&
              !response.url().includes('/credential-input-sources') &&
              response.request().method() === 'POST' &&
              response.status() === 201
          );

          await page.getByRole('button', { name: 'Create credential' }).click();

          const createResponse = await createResponsePromise;
          const responseBody = (await createResponse.json()) as EdaCredentialInterface;
          createdCredentialId = responseBody.id;

          await expect(
            page.getByRole('heading', { name: credentialName, exact: true })
          ).toBeVisible();
        });

        await test.step('Navigate to edit and verify password is disabled', async () => {
          await clickPageAction('Edit credential', page);
          await expect(page.getByRole('heading', { name: `Edit ${credentialName}` })).toBeVisible();
          await expect(page.getByRole('textbox', { name: 'Password' })).toBeDisabled();
        });
      } finally {
        if (createdCredentialId) {
          await EdaCredential.api.delete(page, createdCredentialId);
        }
        if (externalCredentialId) {
          await EdaCredential.api.delete(page, externalCredentialId);
        }
      }
    }
  );
});
