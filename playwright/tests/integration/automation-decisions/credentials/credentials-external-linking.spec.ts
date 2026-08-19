import type { EdaCredential as EdaCredentialInterface } from '@ansible/eda-ui/interfaces/EdaCredential';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { isSaaS } from '@ansible/playwright/commands/getTopologyType';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';
import { EdaCredential } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/infrastructure/credentials' }));
test.afterEach(setupAfter);

test.beforeEach(() => {
  if (isSaaS()) {
    test.skip();
  }
});

test.describe('EDA External Credentials - Creation and Testing', () => {
  test(
    'should create an external credential and test it',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('external-credential');
      let credentialId: number | undefined;

      try {
        await test.step('Navigate and start creation', async () => {
          await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
          await expect(
            page.getByRole('heading', { name: 'Credentials', exact: true })
          ).toBeVisible();
          await page.getByText('Create credential').click();
        });

        await test.step('Fill basic credential information', async () => {
          await page.getByPlaceholder('Enter credential name').fill(credentialName);
          await page
            .getByPlaceholder('Enter description')
            .fill('This is an external credential for testing.');
          await singleSelectByLabel('Organization', 'Default', page);
        });

        await test.step('Select HashiCorp Vault Secret Lookup type', async () => {
          await page.getByRole('button', { name: 'Credential type' }).click();
          await page
            .getByRole('textbox', { name: 'Search input' })
            .fill('HashiCorp Vault Secret Lookup');
          await page.getByRole('option', { name: 'HashiCorp Vault Secret Lookup' }).click();
        });

        await test.step('Fill credential inputs', async () => {
          await page.getByTestId('inputs-url').fill('http://external-user.local');
          await page.getByTestId('inputs-token').fill('test-vault-token');
        });

        await test.step('Verify Test button is enabled and open test modal', async () => {
          await expect(page.getByRole('button', { name: 'Test' })).toBeEnabled();
          await page.getByRole('button', { name: 'Test' }).click();
        });

        await test.step('Verify test modal appears and cancel', async () => {
          const dialog = page.getByRole('dialog');
          await expect(
            dialog.getByRole('heading', { name: 'Test external credential' })
          ).toBeVisible();
          await dialog.getByRole('button', { name: 'Cancel' }).click();
        });

        await test.step('Create credential and verify details', async () => {
          const createResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/eda-credentials') &&
              response.request().method() === 'POST' &&
              response.status() === 201
          );

          await page.getByRole('button', { name: 'Create credential' }).click();

          const createResponse = await createResponsePromise;
          const responseBody = (await createResponse.json()) as EdaCredentialInterface;
          credentialId = responseBody.id;

          await expect(
            page.getByRole('heading', { name: credentialName, exact: true })
          ).toBeVisible();
          await expect(page.locator('#name')).toContainText(credentialName);
          await expect(page.locator('#description')).toContainText(
            'This is an external credential for testing.'
          );
          await expect(page.getByTestId('credential-type')).toContainText(
            'HashiCorp Vault Secret Lookup'
          );
          await expect(page.getByTestId('url')).toContainText('http://external-user.local');
        });
      } finally {
        if (credentialId) {
          await EdaCredential.api.delete(page, credentialId);
        }
      }
    }
  );
});

test.describe('EDA External Credentials - Linking', () => {
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

        await test.step('Open secret management modal and verify external credential is pre-selected', async () => {
          const passwordGroup = page.getByTestId('inputs-password-form-group');
          await passwordGroup.getByTestId('secret-management-input').click();

          const dialog = page.getByRole('dialog');
          await expect(dialog.getByText('Secret Management System')).toBeVisible();
          await expect(dialog.getByTestId('id')).toContainText(externalCredentialName);

          await dialog.getByRole('button', { name: 'Cancel' }).click();
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

  test(
    'should clear linked external credential field',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('clear-link-credential');
      let credentialId: number | undefined;
      let externalCredentialId: number | undefined;

      try {
        const externalCredential = await EdaCredential.api.create(page, {
          name: createE2EName('external-cred'),
          credentialTypeName: 'HashiCorp Vault Secret Lookup',
          description: 'External credential for clear test',
          inputs: {
            url: 'https://vault.example.com',
            token: 'test-vault-token',
            api_version: 'v1',
            default_auth_path: '/test/secret',
          },
        });
        externalCredentialId = externalCredential.id;

        await test.step('Navigate and start creation', async () => {
          await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
          await expect(
            page.getByRole('heading', { name: 'Credentials', exact: true })
          ).toBeVisible();
          await page.getByText('Create credential').click();
        });

        await test.step('Fill credential form', async () => {
          await page.getByPlaceholder('Enter credential name').fill(credentialName);
          await page.getByPlaceholder('Enter description').fill('Test clearing linked fields.');
          await singleSelectByLabel('Organization', 'Default', page);
        });

        await test.step('Select Source Control type', async () => {
          await page.getByRole('button', { name: 'Credential type' }).click();
          await page.getByRole('textbox', { name: 'Search input' }).fill('Source Control');
          await page.getByRole('option', { name: 'Source Control' }).click();
        });

        await test.step('Link password field to external credential', async () => {
          const passwordGroup = page.getByTestId('inputs-password-form-group');
          await passwordGroup.getByTestId('secret-management-input').click();

          const dialog = page.getByRole('dialog');
          await dialog.getByTestId('id').click();

          const menuContent = page.locator('.pf-v6-c-menu__content');
          await menuContent.getByLabel('Search input').fill(externalCredential.name);
          await menuContent.getByRole('option', { name: externalCredential.name }).click();

          await page.getByTestId('secret-path').fill('test/path');
          await page.getByTestId('secret-key').fill('test_key');

          await expect(dialog.getByRole('button', { name: 'Test' })).toBeEnabled();
          await dialog.getByRole('button', { name: 'Test' }).click();

          await expect(page.locator('[data-ouia-component-type="PF6/Alert"]')).toBeVisible({
            timeout: 10000,
          });

          await dialog.getByRole('button', { name: 'Finish' }).click();
        });

        await test.step('Verify field is disabled then clear the link', async () => {
          await expect(page.getByTestId('inputs-password')).toBeDisabled();
          await expect(page.getByTestId('clear-secret-management-input')).toBeVisible();

          await page.getByTestId('clear-secret-management-input').click();
        });

        await test.step('Verify field is enabled and fill manually', async () => {
          await expect(page.getByTestId('inputs-password')).toBeEnabled();
          await page.getByTestId('inputs-password').fill('manual-password');
          await page.getByRole('textbox', { name: 'Username' }).fill('manual-user');
        });

        await test.step('Create credential and verify', async () => {
          const createResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/eda-credentials') &&
              response.request().method() === 'POST' &&
              response.status() === 201
          );

          await page.getByRole('button', { name: 'Create credential' }).click();

          const createResponse = await createResponsePromise;
          const responseBody = (await createResponse.json()) as EdaCredentialInterface;
          credentialId = responseBody.id;

          await expect(
            page.getByRole('heading', { name: credentialName, exact: true })
          ).toBeVisible();
          await expect(page.locator('#name')).toContainText(credentialName);
          await expect(page.getByTestId('username')).toContainText('manual-user');
        });
      } finally {
        if (credentialId) {
          await EdaCredential.api.delete(page, credentialId);
        }
        if (externalCredentialId) {
          await EdaCredential.api.delete(page, externalCredentialId);
        }
      }
    }
  );

  test(
    'should link multiple fields from different external credentials',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('multi-link-credential');
      let credentialId: number | undefined;
      let firstExternalCredentialId: number | undefined;
      let secondExternalCredentialId: number | undefined;

      try {
        const firstExternalCredential = await EdaCredential.api.create(page, {
          name: createE2EName('first-external'),
          credentialTypeName: 'HashiCorp Vault Secret Lookup',
          description: 'First external credential for multi-link test',
          inputs: {
            url: 'https://vault.example.com',
            token: 'test-vault-token',
            api_version: 'v1',
            default_auth_path: '/test/secret',
          },
        });
        firstExternalCredentialId = firstExternalCredential.id;

        const secondExternalCredential = await EdaCredential.api.create(page, {
          name: createE2EName('second-external'),
          credentialTypeName: 'HashiCorp Vault Secret Lookup',
          description: 'Second external credential for multi-link test',
          inputs: {
            url: 'https://vault2.example.com',
            token: 'second-vault-token',
            username: 'second-external-user',
            password: 'second-external-password',
            default_auth_path: 'approle',
            api_version: 'v1',
          },
        });
        secondExternalCredentialId = secondExternalCredential.id;

        await test.step('Navigate and start creation', async () => {
          await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
          await expect(
            page.getByRole('heading', { name: 'Credentials', exact: true })
          ).toBeVisible();
          await page.getByText('Create credential').click();
        });

        await test.step('Fill credential form', async () => {
          await page.getByPlaceholder('Enter credential name').fill(credentialName);
          await page
            .getByPlaceholder('Enter description')
            .fill('Credential with multiple external links.');
          await singleSelectByLabel('Organization', 'Default', page);
        });

        await test.step('Select Source Control type', async () => {
          await page.getByRole('button', { name: 'Credential type' }).click();
          await page.getByRole('textbox', { name: 'Search input' }).fill('Source Control');
          await page.getByRole('option', { name: 'Source Control' }).click();
        });

        await test.step('Link username field to first external credential', async () => {
          const usernameGroup = page.getByTestId('inputs-username-form-group');
          await usernameGroup.getByTestId('secret-management-input').click();

          const dialog = page.getByRole('dialog');
          await dialog.getByTestId('id').click();

          const menuContent = page.locator('.pf-v6-c-menu__content');
          await menuContent.getByLabel('Search input').fill(firstExternalCredential.name);
          await menuContent.getByRole('option', { name: firstExternalCredential.name }).click();

          await page.getByTestId('secret-path').fill('test/path');
          await page.getByTestId('secret-key').fill('test_key');

          await expect(dialog.getByRole('button', { name: 'Test' })).toBeEnabled();
          await dialog.getByRole('button', { name: 'Test' }).click();

          await expect(page.locator('[data-ouia-component-type="PF6/Alert"]')).toBeVisible({
            timeout: 10000,
          });

          await dialog.getByRole('button', { name: 'Finish' }).click();
        });

        await test.step('Link password field to second external credential', async () => {
          const passwordGroup = page.getByTestId('inputs-password-form-group');
          await passwordGroup.getByTestId('secret-management-input').click();

          const dialog = page.getByRole('dialog');
          await dialog.getByTestId('id').click();

          const menuContent = page.locator('.pf-v6-c-menu__content');
          await menuContent.getByLabel('Search input').fill(secondExternalCredential.name);
          await menuContent.getByRole('option', { name: secondExternalCredential.name }).click();

          await page.getByTestId('secret-path').fill('test/path');
          await page.getByTestId('secret-key').fill('test_key');

          await expect(dialog.getByRole('button', { name: 'Test' })).toBeEnabled();
          await dialog.getByRole('button', { name: 'Test' }).click();

          await expect(page.locator('[data-ouia-component-type="PF6/Alert"]')).toBeVisible({
            timeout: 10000,
          });

          await dialog.getByRole('button', { name: 'Finish' }).click();
        });

        await test.step('Verify both fields are disabled', async () => {
          await expect(page.getByTestId('inputs-username')).toBeDisabled();
          await expect(page.getByTestId('inputs-password')).toBeDisabled();
        });

        await test.step('Create credential and verify', async () => {
          const createResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/eda-credentials') &&
              response.request().method() === 'POST' &&
              response.status() === 201
          );

          await page.getByRole('button', { name: 'Create credential' }).click();

          const createResponse = await createResponsePromise;
          const responseBody = (await createResponse.json()) as EdaCredentialInterface;
          credentialId = responseBody.id;

          await expect(
            page.getByRole('heading', { name: credentialName, exact: true })
          ).toBeVisible();
        });

        await test.step('Verify details show both external credential links', async () => {
          await expect(page.locator('#name')).toContainText(credentialName);

          const usernameField = page.getByTestId('username-*');
          await expect(usernameField).toContainText('External:');
          await expect(usernameField).toContainText(firstExternalCredential.name);

          const passwordField = page.getByTestId('password-*');
          await expect(passwordField).toContainText('External:');
          await expect(passwordField).toContainText(secondExternalCredential.name);
        });
      } finally {
        if (credentialId) {
          await EdaCredential.api.delete(page, credentialId);
        }
        if (firstExternalCredentialId) {
          await EdaCredential.api.delete(page, firstExternalCredentialId);
        }
        if (secondExternalCredentialId) {
          await EdaCredential.api.delete(page, secondExternalCredentialId);
        }
      }
    }
  );
});

test.describe('EDA External Credentials - Error Handling', () => {
  test(
    'should show appropriate error when external credential test fails',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('failing-external-credential');
      let credentialId: number | undefined;

      try {
        await test.step('Navigate and start creation', async () => {
          await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
          await expect(
            page.getByRole('heading', { name: 'Credentials', exact: true })
          ).toBeVisible();
          await page.getByText('Create credential').click();
        });

        await test.step('Fill credential form', async () => {
          await page.getByPlaceholder('Enter credential name').fill(credentialName);
          await page
            .getByPlaceholder('Enter description')
            .fill('External credential with invalid credentials.');
          await singleSelectByLabel('Organization', 'Default', page);
        });

        await test.step('Select HashiCorp Vault type and fill invalid inputs', async () => {
          await page.getByRole('button', { name: 'Credential type' }).click();
          await page
            .getByRole('textbox', { name: 'Search input' })
            .fill('HashiCorp Vault Secret Lookup');
          await page.getByRole('option', { name: 'HashiCorp Vault Secret Lookup' }).click();

          await page.getByTestId('inputs-url').fill('https://invalid-vault.example.com');
          await page.getByTestId('inputs-token').fill('invalid-token');
        });

        await test.step('Test external credential with invalid data', async () => {
          await page.getByRole('button', { name: 'Test' }).click();

          const dialog = page.getByRole('dialog');
          await expect(
            dialog.getByRole('heading', { name: 'Test external credential' })
          ).toBeVisible();

          await page.getByTestId('secret-path').fill('test/path');
          await page.getByTestId('secret-key').fill('test_key');
          await dialog.getByTestId('Submit').click();
        });

        await test.step('Verify error message appears', async () => {
          const alert = page.locator('[data-ouia-component-type="PF6/Alert"]');
          await expect(alert).toBeVisible({ timeout: 10000 });
          await expect(alert).toContainText('Bad Request');
        });

        await test.step('Close modal and create credential anyway', async () => {
          const dialog = page.getByRole('dialog');
          await dialog.getByRole('button', { name: 'Cancel' }).click();

          const createResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/eda-credentials') &&
              response.request().method() === 'POST' &&
              response.status() === 201
          );

          await page.getByRole('button', { name: 'Create credential' }).click();

          const createResponse = await createResponsePromise;
          const responseBody = (await createResponse.json()) as EdaCredentialInterface;
          credentialId = responseBody.id;

          await expect(
            page.getByRole('heading', { name: credentialName, exact: true })
          ).toBeVisible();
          await expect(page.locator('#name')).toContainText(credentialName);
        });
      } finally {
        if (credentialId) {
          await EdaCredential.api.delete(page, credentialId);
        }
      }
    }
  );

  test(
    'should show no results when searching for non-existent external credential',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('no-link-credential');
      let credentialId: number | undefined;

      try {
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

        await test.step('Select Container Registry type', async () => {
          await page.getByRole('button', { name: 'Credential type' }).click();
          await page.getByRole('textbox', { name: 'Search input' }).fill('Container Registry');
          await page.getByRole('option', { name: 'Container Registry' }).click();
        });

        await test.step('Try to link to non-existent external credential', async () => {
          const passwordGroup = page.getByTestId('inputs-password-form-group');
          await passwordGroup.getByTestId('secret-management-input').click();

          const dialog = page.getByRole('dialog');
          await dialog.getByTestId('id').click();

          const menuContent = page.locator('.pf-v6-c-menu__content');
          await menuContent.getByLabel('Search input').fill('Not a credential type');

          await expect(page.locator('#id-select')).toContainText('No results found');

          // Close the dropdown by clicking outside of it (on the dialog heading)
          await dialog.getByRole('heading', { name: 'Secret Management System' }).click();
          await expect(menuContent).not.toBeVisible();
        });

        await test.step('Cancel modal and fill field manually', async () => {
          const dialog = page.getByRole('dialog');
          await dialog.getByRole('button', { name: 'Cancel' }).click();

          await page.getByRole('textbox', { name: 'Password' }).fill('manual-password');
          await page.getByRole('textbox', { name: 'Username' }).fill('manual-user');
        });

        await test.step('Create credential and verify', async () => {
          const createResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/eda-credentials') &&
              response.request().method() === 'POST' &&
              response.status() === 201
          );

          await page.getByRole('button', { name: 'Create credential' }).click();

          const createResponse = await createResponsePromise;
          const responseBody = (await createResponse.json()) as EdaCredentialInterface;
          credentialId = responseBody.id;

          await expect(
            page.getByRole('heading', { name: credentialName, exact: true })
          ).toBeVisible();
          await expect(page.locator('#name')).toContainText(credentialName);
        });
      } finally {
        if (credentialId) {
          await EdaCredential.api.delete(page, credentialId);
        }
      }
    }
  );
});
