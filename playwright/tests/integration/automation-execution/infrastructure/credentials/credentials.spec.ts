import { test, expect } from '@playwright/test';
import { setupBefore, setupAfter } from '../../../../../commands/setup';
import { navigateTo } from '../../../../../commands/navigateTo';
import { clickTableRow } from '../../../../../commands/clickTableRow';
import { clickPageAction } from '../../../../../commands/clickPageAction';
import { createE2EName } from '../../../../../commands/createE2EName';
import { createAwxCredential, deleteAwxCredential } from './credential-utils';
import { filterTable } from '../../../../../commands/filterTable';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/credentials' }));
test.afterEach(setupAfter);

test.describe('Credentials - List View', () => {
  test(
    'can edit machine credential from the list row action',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);

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
      const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await deleteAwxCredential(credentialName, page);
    }
  );

  test(
    'can delete machine credential from the list toolbar',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);

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
    const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);

    await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
    await filterTable({ filterLabel: 'Name', filterValue: credentialName }, page);
    await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });

    // Click the duplicate credential button
    const row = page.getByRole('row').filter({ hasText: credentialName });
    await row.getByRole('button', { name: 'Duplicate credential' }).click();

    // Wait for duplication to complete
    await page.waitForTimeout(2000);

    // Delete the original credential
    await deleteAwxCredential(credentialName, page);

    // Filter for the copied credential (which has a name like "credentialName @ HH:MM:SS")
    await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
    await filterTable({ filterLabel: 'Name', filterValue: `${credentialName} @` }, page);
    await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });

    // Verify exactly one credential is found (the copy)
    const copiedRow = page.getByRole('row').filter({ hasText: `${credentialName} @` });
    await expect(copiedRow).toHaveCount(1);

    // Delete the copied credential using the toolbar action
    await copiedRow.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'toolbar actions' }).click();
    await page.getByRole('menuitem', { name: 'Delete credentials' }).click();
    await page.locator('#confirm').click();
    await page.getByRole('button', { name: 'Delete credential' }).click();
    await expect(page.getByRole('heading', { name: 'Credentials' })).toBeVisible();
  });
});

test.describe('Credentials - Details View', () => {
  test('details page should render boolean field', { tag: ['@not_mock'] }, async ({ page }) => {
    const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);

    await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
    await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
    await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
    await expect(page.getByText('Machine')).toBeVisible();
    await expect(page.getByText('Username').first()).toBeVisible();
    await expect(page.getByText('Encrypted').first()).toBeVisible();
    await deleteAwxCredential(credentialName, page);
  });

  test(
    'can edit machine credential from the details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await page.getByRole('button', { name: 'Edit credential' }).click();
      await expect(page.getByRole('heading', { name: `Edit ${credentialName}` })).toBeVisible();
      const editedName = `${credentialName}-edited`;

      await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(editedName);
      await page.getByRole('button', { name: 'Save credential' }).click();
      await expect(page.getByRole('heading', { name: editedName })).toBeVisible();
      await deleteAwxCredential(editedName, page);
    }
  );

  test(
    'can delete a machine credential from the details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);

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
      const credentialName = await createAwxCredential(
        {
          credentialType: 'Machine',
        },
        page
      );

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await page.getByRole('button', { name: 'Edit credential' }).click();
      await expect(page.getByRole('heading', { name: `Edit ${credentialName}` })).toBeVisible();
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
      await deleteAwxCredential(credentialName, page);
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
      await deleteAwxCredential(modifiedCredentialName, page);
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
      const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await page.getByRole('tab', { name: 'Job Templates' }).click();
      await expect(page.getByRole('tab', { name: 'Job Templates' })).toBeVisible();
      await deleteAwxCredential(credentialName, page);
    }
  );
});

test.describe('Credentials - Team and User Access', () => {
  test(
    'can assign a team to credential and apply roles',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(120000);
      const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);
      const teamName = createE2EName('team');

      await navigateTo(page, 'Access Management', 'Teams');
      await page.getByText('Create team', { exact: true }).click();
      await page.getByPlaceholder('Enter team name').fill(teamName);
      await page.getByLabel('Organization').click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Default');
      await page.getByRole('option', { name: 'Default' }).click();
      await page.getByRole('button', { name: 'Create team' }).click();
      await expect(page.getByRole('heading', { name: teamName, exact: true })).toBeVisible();
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await page.getByRole('tab', { name: 'Team Access' }).click();
      await expect(page.getByText('No teams assigned to credential')).toBeVisible({
        timeout: 10000,
      });
      await page.getByRole('link', { name: 'Assign teams' }).click();
      await expect(page.getByRole('heading', { name: 'Assign teams' })).toBeVisible();
      await filterTable({ filterLabel: 'Name', filterValue: teamName }, page);
      await page
        .getByRole('row', { name: new RegExp(teamName) })
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
      await navigateTo(page, 'Access Management', 'Teams');
      await clickTableRow({ filterLabel: 'Name', text: teamName }, page);
      await clickPageAction('Delete team', page);
      await page.locator('#confirm').click();
      await page.getByRole('button', { name: 'Delete team' }).click();
      await expect(page.getByTestId('page-title')).toHaveText('Teams');
      await deleteAwxCredential(credentialName, page);
    }
  );

  test(
    'can assign a user to credential and apply roles',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(120000);
      const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);
      const userName = `E2E-user-${createE2EName('').replace(/\s+/g, '')}`;

      await navigateTo(page, 'Access', 'Users');
      await page.getByText('Create user', { exact: true }).click();
      await page.getByRole('textbox', { name: 'Username' }).fill(userName);
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('TestPassword123!');
      await page
        .getByRole('textbox', { name: 'Confirm password', exact: true })
        .fill('TestPassword123!');
      await page.getByRole('button', { name: 'Create user' }).click();
      await expect(page.getByRole('heading', { name: userName, exact: true })).toBeVisible();
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await page.getByRole('tab', { name: 'User Access' }).click();
      await page.getByRole('link', { name: 'Assign users' }).click();
      await expect(page.getByRole('heading', { name: 'Assign users' })).toBeVisible();
      await filterTable({ filterLabel: 'Username', filterValue: userName }, page);
      await page
        .getByRole('row', { name: new RegExp(userName) })
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
      await navigateTo(page, 'Access', 'Users');
      await clickTableRow({ filterLabel: 'Username', text: userName }, page);
      await clickPageAction('Delete user', page);
      await page.locator('#confirm').click();
      await page.getByRole('button', { name: 'Delete user' }).click();
      await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
      await deleteAwxCredential(credentialName, page);
    }
  );

  test(
    'can remove team role from credential Team Access tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(120000);
      const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);
      const teamName = createE2EName('team');

      await navigateTo(page, 'Access Management', 'Teams');
      await page.getByText('Create team', { exact: true }).click();
      await page.getByPlaceholder('Enter team name').fill(teamName);
      await page.getByLabel('Organization').click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Default');
      await page.getByRole('option', { name: 'Default' }).click();
      await page.getByRole('button', { name: 'Create team' }).click();
      await expect(page.getByRole('heading', { name: teamName, exact: true })).toBeVisible();
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await page.getByRole('tab', { name: 'Team Access' }).click();
      await expect(page.getByText('No teams assigned to credential')).toBeVisible({
        timeout: 10000,
      });
      await page.getByRole('link', { name: 'Assign teams' }).click();
      await expect(page.getByRole('heading', { name: 'Assign teams' })).toBeVisible();
      await filterTable({ filterLabel: 'Name', filterValue: teamName }, page);
      await page
        .getByRole('row', { name: new RegExp(teamName) })
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

      await expect(page.getByRole('link', { name: teamName })).toBeVisible({ timeout: 10000 });
      await filterTable({ filterLabel: 'Team name', filterValue: teamName }, page);
      const teamRow = page.getByRole('row').filter({ hasText: teamName });
      await teamRow.getByRole('checkbox').check();
      await page.getByRole('button', { name: 'Remove role' }).click();
      await expect(page.getByRole('heading', { name: 'Remove role' })).toBeVisible();
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
      await page.getByRole('button', { name: 'Remove role' }).click();
      await expect(page.getByText('Success', { exact: true }).first()).toBeVisible({
        timeout: 10000,
      });
      await navigateTo(page, 'Access Management', 'Teams');
      await clickTableRow({ filterLabel: 'Name', text: teamName }, page);
      await clickPageAction('Delete team', page);
      await page.locator('#confirm').click();
      await page.getByRole('button', { name: 'Delete team' }).click();
      await expect(page.getByTestId('page-title')).toHaveText('Teams');
      await deleteAwxCredential(credentialName, page);
    }
  );

  test(
    'can remove user role from credential User Access tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);
      const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);
      const userName = `E2E-user-${createE2EName('').replace(/\s+/g, '')}`;

      await navigateTo(page, 'Access', 'Users');
      await page.getByText('Create user', { exact: true }).click();
      await page.getByRole('textbox', { name: 'Username' }).fill(userName);
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('TestPassword123!');
      await page
        .getByRole('textbox', { name: 'Confirm password', exact: true })
        .fill('TestPassword123!');
      await page.getByRole('button', { name: 'Create user' }).click();
      await expect(page.getByRole('heading', { name: userName, exact: true })).toBeVisible();

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await page.getByRole('tab', { name: 'User Access' }).click();
      await page.getByRole('link', { name: 'Assign users' }).click();
      await expect(page.getByRole('heading', { name: 'Assign users' })).toBeVisible();
      await filterTable({ filterLabel: 'Username', filterValue: userName }, page);
      await page
        .getByRole('row', { name: new RegExp(userName) })
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

      // Wait for user to appear in the list
      await expect(page.getByRole('link', { name: userName })).toBeVisible({ timeout: 10000 });

      // Filter for the user
      await filterTable({ filterLabel: 'Username', filterValue: userName }, page);

      // Click the "Manage roles" button
      const userRow = page.getByRole('row').filter({ hasText: userName });
      await userRow.getByRole('button', { name: 'Manage roles' }).click();

      // Verify we're on the manage roles page
      await expect(
        page.getByRole('heading', {
          name: new RegExp(`Manage roles directly assigned to ${userName}`),
        })
      ).toBeVisible();

      // Uncheck the Credential Admin role
      const credentialAdminRow = page.getByRole('row', { name: /Credential Admin/ });
      await credentialAdminRow.getByRole('checkbox').uncheck();

      // Save the changes
      await page.getByRole('button', { name: 'Save roles' }).click();

      // Verify we're back on the User Access tab
      await expect(page.getByRole('tab', { name: 'User Access' })).toBeVisible();

      // Verify the role has been removed (user should no longer appear or have no roles)
      await page.waitForTimeout(1000);

      await navigateTo(page, 'Access', 'Users');
      await clickTableRow({ filterLabel: 'Username', text: userName }, page);
      await clickPageAction('Delete user', page);
      await page.locator('#confirm').click();
      await page.getByRole('button', { name: 'Delete user' }).click();
      await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
      await deleteAwxCredential(credentialName, page);
    }
  );

  test('can manage user roles from User Access tab', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(180000);
    const credentialName = await createAwxCredential({ credentialType: 'Machine' }, page);
    const userName = `E2E-user-${createE2EName('').replace(/\s+/g, '')}`;

    await navigateTo(page, 'Access', 'Users');
    await page.getByText('Create user', { exact: true }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(userName);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('TestPassword123!');
    await page
      .getByRole('textbox', { name: 'Confirm password', exact: true })
      .fill('TestPassword123!');
    await page.getByRole('button', { name: 'Create user' }).click();
    await expect(page.getByRole('heading', { name: userName, exact: true })).toBeVisible();

    await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
    await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
    await page.getByRole('tab', { name: 'User Access' }).click();
    await page.getByRole('link', { name: 'Assign users' }).click();
    await expect(page.getByRole('heading', { name: 'Assign users' })).toBeVisible();
    await filterTable({ filterLabel: 'Username', filterValue: userName }, page);
    await page
      .getByRole('row', { name: new RegExp(userName) })
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

    await expect(page.getByRole('link', { name: userName })).toBeVisible({ timeout: 10000 });
    await filterTable({ filterLabel: 'Username', filterValue: userName }, page);

    // Find the user row and click the Manage roles button (pencil icon)
    const userRow = page.getByRole('row').filter({ hasText: userName });

    // Click the Manage roles button (pencil icon) - it's an ARIA button with label
    await userRow.getByLabel('Manage roles').click();

    // Verify we're on the manage roles page with the longer heading format
    await expect(
      page.getByRole('heading', {
        name: new RegExp(`Manage roles directly assigned to ${userName}`),
      })
    ).toBeVisible();

    // Verify the role is displayed in the table
    await expect(page.getByRole('row', { name: /Credential Admin/ })).toBeVisible();
    await expect(page.getByText('Has all permissions to a single credential')).toBeVisible();

    // Click Cancel to go back
    await page.getByRole('button', { name: 'Cancel' }).click();

    await navigateTo(page, 'Access', 'Users');
    await clickTableRow({ filterLabel: 'Username', text: userName }, page);
    await clickPageAction('Delete user', page);
    await page.locator('#confirm').click();
    await page.getByRole('button', { name: 'Delete user' }).click();
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await deleteAwxCredential(credentialName, page);
  });
});
