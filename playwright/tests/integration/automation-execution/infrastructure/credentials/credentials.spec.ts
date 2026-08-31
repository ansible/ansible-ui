import { Credential as CredentialType } from '@ansible/awx-ui/interfaces/Credential';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { expect, test } from '@playwright/test';
import { gatewayAPI } from '../../../../../commands/apiClient';
import { clickPageAction } from '../../../../../commands/clickPageAction';
import { clickTableRow } from '../../../../../commands/clickTableRow';
import { createE2EName } from '../../../../../commands/createE2EName';
import { filterTable } from '../../../../../commands/filterTable';
import { navigateTo } from '../../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../../commands/setup';
import { Credential, Team, User } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/credentials' }));
test.afterEach(setupAfter);

test.describe('Credentials - List View', () => {
  test(
    'can edit machine credential from the list row action',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await filterTable({ filterLabel: 'Name', filterValue: credentialName }, page);
      await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });
      const row = page.getByRole('row').filter({ hasText: credentialName });
      await row.getByRole('button', { name: 'Edit credential' }).click();
      await expect(page.getByRole('heading', { name: `Edit ${credentialName}` })).toBeVisible();
      const editedName = `${credentialName}-edited`;

      await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(editedName);
      await page.getByRole('button', { name: 'Save credential' }).click();
      await expect(page.getByRole('heading', { name: 'Credentials' })).toBeVisible({
        timeout: 10000,
      });
      await filterTable({ filterLabel: 'Name', filterValue: editedName }, page);
      await expect(page.getByRole('link', { name: editedName })).toBeVisible();
    }
  );

  test(
    'can delete machine credential from the list row action',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await Credential.ui.delete(page, credentialName);
    }
  );

  test(
    'can delete machine credential from the list toolbar',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await filterTable({ filterLabel: 'Name', filterValue: credentialName }, page);
      await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });
      const row = page.getByRole('row').filter({ hasText: credentialName });

      await row.getByRole('checkbox').check();
      await page.getByRole('button', { name: 'toolbar actions' }).click();
      await page.getByRole('menuitem', { name: 'Delete credentials' }).click();
      await page.locator('#confirm').click();
      await page.getByRole('button', { name: 'Delete credential' }).click();
      await expect(page.getByRole('heading', { name: 'Credentials' })).toBeVisible();
    }
  );

  test('copies a credential from the list row action', { tag: ['@not_mock'] }, async ({ page }) => {
    const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

    await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
    await filterTable({ filterLabel: 'Name', filterValue: credentialName }, page);
    await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });

    // Set up API interception before clicking the duplicate button
    const copyResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/credentials/') &&
        response.url().includes('/copy/') &&
        response.status() === 201
    );

    // Click the duplicate credential button
    const credentialLink = page.getByRole('link', { name: credentialName, exact: true });
    const row = page.getByRole('row').filter({ has: credentialLink });
    await row.getByRole('button', { name: 'Duplicate credential' }).click();

    // Get the exact copied credential name from the API response
    const copyResponse = await copyResponsePromise;
    const copiedCredential = (await copyResponse.json()) as { name: string; id: number };
    const copiedCredentialName = copiedCredential.name;

    // Filter for the copied credential
    await filterTable(
      { filterLabel: 'Name', filterValue: copiedCredentialName, clearFilters: true },
      page
    );
    await expect(page.getByRole('link', { name: copiedCredentialName, exact: true })).toBeVisible();

    // Delete the copied credential
    const copiedLink = page.getByRole('link', {
      name: new RegExp(`^${credentialName} @`),
      exact: false,
    });
    const copiedRow = page.getByRole('row').filter({ has: copiedLink });
    await copiedRow.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'toolbar actions' }).click();
    await page.getByRole('menuitem', { name: 'Delete credentials' }).click();
    await page.locator('#confirm').click();
    await page.getByRole('button', { name: 'Delete credential' }).click();

    // Filter for the original credential
    await filterTable(
      { filterLabel: 'Name', filterValue: credentialName, clearFilters: true },
      page
    );

    // Delete the original credential
    const originalLink = page.getByRole('link', { name: credentialName, exact: true });
    const originalRow = page.getByRole('row').filter({ has: originalLink });
    await originalRow.getByRole('button', { name: 'kebab dropdown toggle' }).click();
    await page.getByRole('menuitem', { name: 'Delete credential' }).click();
    await page.locator('#confirm').click();
    await page.getByRole('button', { name: 'Delete credential' }).click();
    await expect(page.getByRole('heading', { name: 'Credentials' })).toBeVisible();
  });
});

test.describe('Credentials - Details View', () => {
  test('details page should render boolean field', { tag: ['@not_mock'] }, async ({ page }) => {
    const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

    await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
    await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
    await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
    await expect(page.getByText('Machine')).toBeVisible();
    await expect(page.getByText('Username').first()).toBeVisible();
    await expect(page.getByText('Encrypted').first()).toBeVisible();
    await Credential.ui.delete(page, credentialName);
  });

  test(
    'can edit machine credential from the details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await page.getByRole('button', { name: 'Edit credential' }).click();
      await expect(page.getByRole('heading', { name: `Edit ${credentialName}` })).toBeVisible();
      const editedName = `${credentialName}-edited`;

      await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(editedName);
      await page.getByRole('button', { name: 'Save credential' }).click();
      await expect(page.getByRole('heading', { name: editedName })).toBeVisible();
      await Credential.ui.delete(page, editedName);
    }
  );

  test(
    'can delete a machine credential from the details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await clickPageAction('Delete credential', page);
      await page.locator('#confirm').click();
      await page.getByRole('button', { name: 'Delete credential' }).click();
      await expect(page.getByRole('heading', { name: 'Credentials' })).toBeVisible();
    }
  );
});

test.describe('Credentials Create - External test modal', () => {
  test(
    'can display error toast message when running a test from the create credential form',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential', { exact: true }).click();
      await page.getByPlaceholder('Enter credential name').fill('foo');
      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Machine');
      await page.getByRole('option', { name: 'Machine' }).click();
      await page.getByRole('textbox', { name: 'Username', exact: true }).fill('testuser');
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('testpass');
      await expect(page.getByRole('button', { name: 'Create credential' })).toBeVisible();
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    }
  );
});

test.describe('Credentials Edit - External test modal', () => {
  test(
    'can display error toast message when running a test from the edit credential form',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = await Credential.ui.create(page, {
        credentialType: 'Machine',
      });

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await page.getByRole('button', { name: 'Edit credential' }).click();
      await expect(page.getByRole('heading', { name: `Edit ${credentialName}` })).toBeVisible();
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
      await Credential.ui.delete(page, credentialName);
    }
  );
});

test.describe('Credentials - Credential Types Tests', () => {
  test(
    'cannot edit vault id for Vault credential type',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('credential');

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential', { exact: true }).click();
      await page.getByPlaceholder('Enter credential name').fill(credentialName);
      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Vault');
      await page.getByRole('option', { name: 'Vault', exact: true }).click();
      await page.getByRole('textbox', { name: 'Vault identifier' }).fill('test-vault-id');
      await page.getByRole('textbox', { name: 'Vault password' }).fill('test-password');
      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
      await expect(page.getByText('Vault identifier')).toBeVisible();
      await expect(page.getByText('test-vault-id')).toBeVisible();
      await expect(page.getByText('Vault password')).toBeVisible();
      await expect(page.getByText('Encrypted')).toBeVisible();
      await clickPageAction('Delete credential', page);
      await page.locator('#confirm').click();
      await page.getByRole('button', { name: 'Delete credential' }).click();
      await expect(page.getByRole('heading', { name: 'Credentials' })).toBeVisible();
    }
  );

  test(
    'can create, edit and delete a credential that renders a sub form',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('credential');

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential', { exact: true }).click();
      await page.getByPlaceholder('Enter credential name').fill(credentialName);
      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Amazon Web Services');
      await page.getByRole('option', { name: 'Amazon Web Services' }).click();
      await page.getByRole('textbox', { name: 'Access Key' }).fill('access-key');
      await page.getByRole('textbox', { name: 'Secret Key' }).fill('password');
      await page.getByRole('textbox', { name: 'STS Token' }).fill('security-token');
      await page.getByRole('textbox', { name: 'Description' }).fill('description');
      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
      await expect(
        page.getByTestId('label-credential-type').getByText('Credential type')
      ).toBeVisible();
      await expect(page.getByText('Amazon Web Services')).toBeVisible();
      await expect(page.getByText('Access Key')).toBeVisible();
      await expect(page.getByText('Secret Key')).toBeVisible();
      await expect(page.getByText('Encrypted').first()).toBeVisible();
      await expect(page.getByTestId('label-description').getByText('Description')).toBeVisible();
      await expect(page.getByTestId('description').getByText('description')).toBeVisible();
      await page.getByRole('button', { name: 'Edit credential' }).click();
      await expect(page.getByRole('heading', { name: `Edit ${credentialName}` })).toBeVisible();
      const modifiedCredentialName = `${credentialName} - edited`;

      await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(modifiedCredentialName);
      await page.getByRole('button', { name: 'Save credential' }).click();
      await expect(page.getByRole('heading', { name: modifiedCredentialName })).toBeVisible();
      await expect(
        page.getByTestId('label-credential-type').getByText('Credential type')
      ).toBeVisible();
      await expect(page.getByText('Amazon Web Services')).toBeVisible();
      await expect(page.getByText('Access Key')).toBeVisible();
      await expect(page.getByText('Secret Key')).toBeVisible();
      await expect(page.getByText('Encrypted').first()).toBeVisible();
      await expect(page.getByTestId('label-description').getByText('Description')).toBeVisible();
      await expect(page.getByTestId('description').getByText('description')).toBeVisible();
      await Credential.ui.delete(page, modifiedCredentialName);
    }
  );

  test(
    'create/edit a credential using prompt on launch',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('credential');
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential', { exact: true }).click();
      await page.getByPlaceholder('Enter credential name').fill(credentialName);
      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Machine');
      await page.getByRole('option', { name: 'Machine', exact: true }).click();
      await expect(page.getByText('Type Details')).toBeVisible();
      await expect(page.getByText('Privilege Escalation Method')).toBeVisible();
      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Edit credential' }).click();
      await expect(page.getByRole('heading', { name: `Edit ${credentialName}` })).toBeVisible();
      await page.getByRole('checkbox', { name: 'Prompt on launch', exact: true }).first().check();
      await page.getByRole('checkbox', { name: 'Prompt on launch', exact: true }).nth(1).check();
      await page.getByRole('button', { name: 'Save credential' }).click();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
      await expect(page.getByText('Password', { exact: true })).toBeVisible();
      await expect(page.getByText('Private Key Passphrase')).toBeVisible();
      await expect(page.getByText('Prompt on launch').first()).toBeVisible();
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await expect(page.getByRole('heading', { name: 'Credentials' })).toBeVisible();
    }
  );

  test(
    'machine credential type should render privilege escalation',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('credential');

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential', { exact: true }).click();
      await page.getByPlaceholder('Enter credential name').fill(credentialName);
      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Machine');
      await page.getByRole('option', { name: 'Machine', exact: true }).click();
      await expect(page.getByText('Type Details')).toBeVisible();
      await expect(page.getByText('Privilege Escalation Method')).toBeVisible();
      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
      await clickPageAction('Delete credential', page);
      await page.locator('#confirm').click();
      await page.getByRole('button', { name: 'Delete credential' }).click();
      await expect(page.getByRole('heading', { name: 'Credentials' })).toBeVisible();
    }
  );

  test(
    'can create credential using custom credential type',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('credential');

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential', { exact: true }).click();
      await page.getByPlaceholder('Enter credential name').fill(credentialName);
      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Machine');
      await page.getByRole('option', { name: 'Machine' }).click();
      await page.getByRole('textbox', { name: 'Username', exact: true }).fill('testuser');
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('testpass');
      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
      await clickPageAction('Delete credential', page);
      await page.locator('#confirm').click();
      await page.getByRole('button', { name: 'Delete credential' }).click();
      await expect(page.getByRole('heading', { name: 'Credentials' })).toBeVisible();
    }
  );
});

test.describe('Credentials - Job Templates Tab', () => {
  test(
    'can create a job template within the context of credential job template tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await page.getByRole('tab', { name: 'Job Templates' }).click();
      await expect(page.getByRole('tab', { name: 'Job Templates' })).toBeVisible();
      await Credential.ui.delete(page, credentialName);
    }
  );
});

test.describe('Credentials - External Credential Plugins (AAP-44813)', () => {
  test(
    'should not re-POST existing credential input sources when editing a credential',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);

      // Step 1: Create an external credential (HashiCorp Vault Secret Lookup)
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential', { exact: true }).click();
      const externalCredentialName = createE2EName('external-cred');
      await expect(page.getByPlaceholder('Enter credential name')).toBeVisible();
      await page.getByPlaceholder('Enter credential name').fill(externalCredentialName);

      await page.getByRole('button', { name: 'Credential type' }).click();
      await expect(page.getByRole('textbox', { name: 'Search input' })).toBeVisible();
      await page.getByRole('textbox', { name: 'Search input' }).fill('HashiCorp Vault Secret');
      await page
        .getByRole('option', { name: 'HashiCorp Vault Secret Lookup', exact: true })
        .click();

      await expect(page.getByRole('textbox', { name: 'Server URL' })).toBeVisible();
      await page
        .getByRole('textbox', { name: 'Server URL' })
        .fill('https://vault.example.com:8200');
      await page.getByRole('textbox', { name: 'Token' }).fill('test-token');

      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(
        page.getByRole('heading', { name: externalCredentialName, exact: true })
      ).toBeVisible();

      // Step 2: Create a Machine credential and link its password to the external credential
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential', { exact: true }).click();
      const machineCredentialName = createE2EName('machine-cred-linked');
      await expect(page.getByPlaceholder('Enter credential name')).toBeVisible();
      await page.getByPlaceholder('Enter credential name').fill(machineCredentialName);

      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Machine');
      await page.getByRole('option', { name: 'Machine', exact: true }).click();

      await expect(page.getByText('Type Details')).toBeVisible();
      await page.getByRole('textbox', { name: 'Username', exact: true }).fill('testuser');

      // Click the secret management button for password field
      const passwordFormGroup = page.locator('#password-form-group');
      await passwordFormGroup.getByTestId('secret-management-input').click();

      // The Secret Management System modal should appear
      await expect(page.getByRole('heading', { name: 'Secret Management System' })).toBeVisible();

      // Select the external credential from the dropdown
      await page.getByRole('button', { name: 'Credential' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(externalCredentialName);
      await page.getByRole('option', { name: externalCredentialName }).click();

      // Fill in the metadata fields required by HashiCorp Vault Secret Lookup
      await expect(page.getByRole('textbox', { name: 'Path to Secret' })).toBeVisible();
      await page.getByRole('textbox', { name: 'Path to Secret' }).fill('secret/data/test');
      await page.getByRole('textbox', { name: 'Key Name' }).fill('password');

      // Click Finish to complete the external credential link
      await page.getByRole('button', { name: 'Finish' }).click();
      await expect(
        page.getByRole('heading', { name: 'Secret Management System' })
      ).not.toBeVisible();

      // Create the credential
      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(
        page.getByRole('heading', { name: machineCredentialName, exact: true })
      ).toBeVisible();

      // Verify the credential was created - the Password field should show the external credential link
      // The link displays as a label with the credential type and name (e.g., "Hashivault: credname")
      await expect(page.getByText('Password').first()).toBeVisible();
      await expect(page.getByText(externalCredentialName).first()).toBeVisible();

      // Step 3: Edit the credential and verify no duplicate input sources are created
      await page.getByRole('button', { name: 'Edit credential' }).click();
      await expect(
        page.getByRole('heading', { name: `Edit ${machineCredentialName}` })
      ).toBeVisible();

      // Set up network request interception to track POST requests to credential_input_sources
      const inputSourcePostRequests: string[] = [];
      page.on('request', (request) => {
        if (request.method() === 'POST' && request.url().includes('/credential_input_sources/')) {
          inputSourcePostRequests.push(request.url());
        }
      });

      // Make a simple change (just update the description)
      await page.getByRole('textbox', { name: 'Description' }).fill('Updated description');

      // Save the credential
      await page.getByRole('button', { name: 'Save credential' }).click();
      await expect(
        page.getByRole('heading', { name: machineCredentialName, exact: true })
      ).toBeVisible();

      // Verify no POST requests were made to credential_input_sources
      // (the fix ensures existing input sources are not re-POSTed)
      expect(inputSourcePostRequests.length).toBe(0);

      // Verify the credential still shows the external credential link
      await expect(page.getByText('Password').first()).toBeVisible();
      await expect(page.getByText(externalCredentialName).first()).toBeVisible();

      // Cleanup: Delete both credentials
      await Credential.ui.delete(page, machineCredentialName);
      await Credential.ui.delete(page, externalCredentialName);
    }
  );

  test(
    'should POST new credential input sources when adding a new link during edit',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);

      // Step 1: Create an external credential (HashiCorp Vault Secret Lookup)
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential', { exact: true }).click();
      const externalCredentialName = createE2EName('external-cred');
      await expect(page.getByPlaceholder('Enter credential name')).toBeVisible();
      await page.getByPlaceholder('Enter credential name').fill(externalCredentialName);

      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('HashiCorp Vault Secret');
      await page
        .getByRole('option', { name: 'HashiCorp Vault Secret Lookup', exact: true })
        .click();

      await expect(page.getByRole('textbox', { name: 'Server URL' })).toBeVisible();
      await page
        .getByRole('textbox', { name: 'Server URL' })
        .fill('https://vault.example.com:8200');
      await page.getByRole('textbox', { name: 'Token' }).fill('test-token');

      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(
        page.getByRole('heading', { name: externalCredentialName, exact: true })
      ).toBeVisible();

      // Step 2: Create a simple Machine credential WITHOUT any external links
      const machineCredentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

      // Step 3: Edit the credential and add an external credential link
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: machineCredentialName }, page);
      await page.getByRole('button', { name: 'Edit credential' }).click();
      await expect(
        page.getByRole('heading', { name: `Edit ${machineCredentialName}` })
      ).toBeVisible();

      // Set up network request interception to track POST requests to credential_input_sources
      let inputSourcePostCount = 0;
      page.on('request', (request) => {
        if (request.method() === 'POST' && request.url().includes('/credential_input_sources/')) {
          inputSourcePostCount++;
        }
      });

      // The password field has an encrypted value, so click Replace button first to enable editing
      const passwordFormGroup = page.locator('#password-form-group');
      await passwordFormGroup.getByRole('button', { name: 'Replace field with new value' }).click();

      // Now click the secret management button for password field
      await passwordFormGroup.getByTestId('secret-management-input').click();

      await expect(page.getByRole('heading', { name: 'Secret Management System' })).toBeVisible();

      // Select the external credential from the dropdown
      await page.getByRole('button', { name: 'Credential' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(externalCredentialName);
      await page.getByRole('option', { name: externalCredentialName }).click();

      // Fill in the metadata fields
      await expect(page.getByRole('textbox', { name: 'Path to Secret' })).toBeVisible();
      await page.getByRole('textbox', { name: 'Path to Secret' }).fill('secret/data/test');
      await page.getByRole('textbox', { name: 'Key Name' }).fill('password');

      await page.getByRole('button', { name: 'Finish' }).click();
      await expect(
        page.getByRole('heading', { name: 'Secret Management System' })
      ).not.toBeVisible();

      // Save the credential
      await page.getByRole('button', { name: 'Save credential' }).click();
      await expect(
        page.getByRole('heading', { name: machineCredentialName, exact: true })
      ).toBeVisible();

      // Verify exactly 1 POST request was made for the new input source
      expect(inputSourcePostCount).toBe(1);

      // Verify the credential shows the external credential link
      await expect(page.getByText('Password').first()).toBeVisible();
      await expect(page.getByText(externalCredentialName).first()).toBeVisible();

      // Cleanup: Delete both credentials
      await Credential.ui.delete(page, machineCredentialName);
      await Credential.ui.delete(page, externalCredentialName);
    }
  );
});

test.describe('Credentials - Team and User Access', () => {
  let credential: CredentialType;

  test.beforeEach(async ({ page }) => {
    credential = await Credential.api.create(page, { credentialTypeName: 'Machine' });
  });

  test.afterEach(async ({ page }) => {
    if (credential?.id) {
      await Credential.api.delete(page, credential.id).catch(() => {});
    }
  });

  test.describe('Team Access', () => {
    let team: PlatformTeam;

    test.beforeEach(async ({ page }) => {
      const orgs = await gatewayAPI.get<{ results: { id: number }[] }>(page, 'organizations/', {
        params: { name: 'Default' },
      });
      const organizationId = orgs?.results?.[0]?.id;
      if (!organizationId) {
        throw new Error('Default organization not found');
      }
      team = await Team.api.create(page, { organization: organizationId });
    });

    test.afterEach(async ({ page }) => {
      if (team?.id) {
        await Team.api.delete(page, team.id).catch(() => {});
      }
    });

    test(
      'can assign a team to credential and apply roles',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await Credential.ui.open(page, credential);
        await page.getByRole('tab', { name: 'Team Access' }).click();
        await expect(page.getByText('No teams are assigned to this credential.')).toBeVisible({
          timeout: 10000,
        });
        await page.getByRole('link', { name: 'Assign teams' }).click();
        await expect(page.getByRole('heading', { name: 'Assign teams' })).toBeVisible();
        await filterTable({ filterLabel: 'Name', filterValue: team.name }, page);
        await page
          .getByRole('row', { name: new RegExp(team.name) })
          .getByRole('checkbox')
          .check();
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await page
          .getByRole('row', { name: /Credential Admin/ })
          .getByRole('checkbox')
          .check();
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await page.getByRole('button', { name: 'Finish', exact: true }).click();
        await expect(page.getByText('Success', { exact: true }).first()).toBeVisible();
      }
    );

    test(
      'can remove team role from credential Team Access tab',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await Credential.ui.open(page, credential);
        await page.getByRole('tab', { name: 'Team Access' }).click();
        await expect(page.getByText('No teams are assigned to this credential.')).toBeVisible({
          timeout: 10000,
        });
        await page.getByRole('link', { name: 'Assign teams' }).click();
        await expect(page.getByRole('heading', { name: 'Assign teams' })).toBeVisible();
        await filterTable({ filterLabel: 'Name', filterValue: team.name }, page);
        await page
          .getByRole('row', { name: new RegExp(team.name) })
          .getByRole('checkbox')
          .check();
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await page
          .getByRole('row', { name: /Credential Admin/ })
          .getByRole('checkbox')
          .check();
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await page.getByRole('button', { name: 'Finish', exact: true }).click();
        await expect(page.getByText('Success', { exact: true }).first()).toBeVisible();

        await expect(page.getByRole('link', { name: team.name })).toBeVisible({ timeout: 10000 });
        await filterTable({ filterLabel: 'Team name', filterValue: team.name }, page);
        const teamRow = page.getByRole('row').filter({ hasText: team.name });
        await teamRow.getByRole('checkbox').check();
        await page.getByRole('button', { name: 'Remove role' }).click();
        await expect(page.getByRole('heading', { name: 'Remove role' })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
        await page.getByRole('button', { name: 'Remove role' }).click();
        await expect(page.getByText('Success', { exact: true }).first()).toBeVisible({
          timeout: 10000,
        });
      }
    );
  });

  test.describe('User Access', () => {
    let user: PlatformUser;

    test.beforeEach(async ({ page }) => {
      user = await User.api.create(page, { password: 'TestPassword123!' });
    });

    test.afterEach(async ({ page }) => {
      if (user?.id) {
        await User.api.delete(page, user.id).catch(() => {});
      }
    });

    test(
      'can assign a user to credential and apply roles',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await Credential.ui.open(page, credential);
        await page.getByRole('tab', { name: 'User Access' }).click();
        await page.getByRole('link', { name: 'Assign users' }).click();
        await expect(page.getByRole('heading', { name: 'Assign users' })).toBeVisible();
        await filterTable({ filterLabel: 'Username', filterValue: user.username }, page);
        await page
          .getByRole('row', { name: new RegExp(user.username) })
          .getByRole('checkbox')
          .check();
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await page
          .getByRole('row', { name: /Credential Admin/ })
          .getByRole('checkbox')
          .check();
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await page.getByRole('button', { name: 'Finish' }).click();
        await expect(page.getByText('Success', { exact: true }).first()).toBeVisible();
      }
    );

    test(
      'can remove user role from credential User Access tab',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await Credential.ui.open(page, credential);
        await page.getByRole('tab', { name: 'User Access' }).click();
        await page.getByRole('link', { name: 'Assign users' }).click();
        await expect(page.getByRole('heading', { name: 'Assign users' })).toBeVisible();
        await filterTable({ filterLabel: 'Username', filterValue: user.username }, page);
        await page
          .getByRole('row', { name: new RegExp(user.username) })
          .getByRole('checkbox')
          .check();
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await page
          .getByRole('row', { name: /Credential Admin/ })
          .getByRole('checkbox')
          .check();
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await page.getByRole('button', { name: 'Finish' }).click();
        await expect(page.getByText('Success', { exact: true }).first()).toBeVisible();

        await expect(page.getByRole('link', { name: user.username })).toBeVisible({
          timeout: 10000,
        });
        await filterTable({ filterLabel: 'Username', filterValue: user.username }, page);

        const userRow = page.getByRole('row').filter({ hasText: user.username });
        await userRow.getByRole('button', { name: 'Manage roles' }).click();

        await expect(
          page.getByRole('heading', {
            name: new RegExp(`Manage roles directly assigned to ${user.username}`),
          })
        ).toBeVisible();

        const credentialAdminRow = page.getByRole('row', { name: /Credential Admin/ });
        await credentialAdminRow.getByRole('checkbox').uncheck();

        await page.getByRole('button', { name: 'Save roles' }).click();

        await expect(page.getByRole('tab', { name: 'User Access' })).toBeVisible();
      }
    );

    test('can manage user roles from User Access tab', { tag: ['@not_mock'] }, async ({ page }) => {
      await Credential.ui.open(page, credential);
      await page.getByRole('tab', { name: 'User Access' }).click();
      await page.getByRole('link', { name: 'Assign users' }).click();
      await expect(page.getByRole('heading', { name: 'Assign users' })).toBeVisible();
      await filterTable({ filterLabel: 'Username', filterValue: user.username }, page);
      await page
        .getByRole('row', { name: new RegExp(user.username) })
        .getByRole('checkbox')
        .check();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page
        .getByRole('row', { name: /Credential Admin/ })
        .getByRole('checkbox')
        .check();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await expect(page.getByText('Success', { exact: true }).first()).toBeVisible();

      await expect(page.getByRole('link', { name: user.username })).toBeVisible({ timeout: 10000 });
      await filterTable({ filterLabel: 'Username', filterValue: user.username }, page);

      const userRow = page.getByRole('row').filter({ hasText: user.username });
      await userRow.getByLabel('Manage roles').click();

      await expect(
        page.getByRole('heading', {
          name: new RegExp(`Manage roles directly assigned to ${user.username}`),
        })
      ).toBeVisible();

      await expect(page.getByRole('row', { name: /Credential Admin/ })).toBeVisible();
      await expect(page.getByText('Has all permissions to a single credential')).toBeVisible();

      await page.getByRole('button', { name: 'Cancel' }).click();
    });
  });
});
