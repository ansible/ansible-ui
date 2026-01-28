import { AZURE_URL, checkBuildType, SAAS_URL } from '@ansible/playwright/commands/checkBuildType';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { platformUI } from '@ansible/playwright/commands/login';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Remote, type HubRemote } from '@ansible/playwright/utils/hub';
import { expect, test } from '@playwright/test';
import { promises as fs } from 'node:fs';

test.afterEach(setupAfter);

test.describe('Hub - Remotes', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await setupBefore()({ page });
    const buildType = await checkBuildType(page);
    await page.close();

    if (buildType === SAAS_URL || buildType === AZURE_URL) {
      test.skip(true, 'Remotes not available on SaaS/Azure deployments');
    }
  });

  test.beforeEach(async ({ page }) => {
    await setupBefore()({ page });
    await page.goto(`${platformUI}/content/administration/remotes`);
  });
  test('should bulk delete remotes', { tag: ['@not_mock'] }, async ({ page }) => {
    const remoteNames: string[] = [];
    const testSignature = createE2EName().replace('E2E ', '');

    try {
      await test.step('Create multiple remotes via API', async () => {
        for (let i = 0; i < 5; i++) {
          const remoteName = `${testSignature}-remote-${i}`;
          await Remote.api.create(page, { name: remoteName });
          remoteNames.push(remoteName);
        }
      });

      await test.step('Navigate to remotes and filter by signature', async () => {
        await navigateTo(page, 'Automation Content', 'Remotes');
        await expect(page.getByRole('heading', { name: 'Remotes' })).toBeVisible();
        await clearTableFilters(page);
        await filterTable({ filterLabel: 'Name', filterValue: testSignature }, page);

        // Verify all remotes are visible
        const rows = page.locator('tbody tr');
        await expect(rows).toHaveCount(5, { timeout: 10000 });
      });

      await test.step('Select all and bulk delete', async () => {
        // Select all remotes
        await page.locator('input[name="check-all"]').check();

        // Open toolbar actions and click delete
        const toolbar = page.locator('[data-ouia-component-id="page-toolbar"]');
        await toolbar.getByTestId('actions-dropdown').click();
        await page.getByTestId('delete-remotes').click();

        // Confirm deletion
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.locator('#confirm').check();
        await dialog.getByRole('button', { name: 'Delete remotes', exact: true }).click();

        // Wait for completion
        await expect(dialog).not.toBeVisible({ timeout: 30000 });

        // Clear filters to verify deletion
        await page
          .locator('[data-ouia-component-id="page-toolbar"]')
          .getByRole('button', { name: 'Clear all filters', exact: true })
          .click();
      });

      await test.step('Verify remotes were deleted', async () => {
        await filterTable({ filterLabel: 'Name', filterValue: testSignature }, page);
        await expect(page.locator('.pf-v6-c-empty-state')).toBeVisible();
      });

      // Clear the array since we've deleted them
      remoteNames.length = 0;
    } finally {
      // Cleanup any remaining remotes
      for (const remoteName of remoteNames) {
        try {
          const remote = await Remote.api.get(page, remoteName);
          await Remote.api.delete(page, remote.pulp_href);
        } catch {
          // Ignore errors during cleanup
        }
      }
    }
  });

  test('should create, search and delete a remote', { tag: ['@not_mock'] }, async ({ page }) => {
    const remoteName = createE2EName('remote');
    let remoteCreated = false;

    try {
      await test.step('Navigate to remotes', async () => {
        await navigateTo(page, 'Automation Content', 'Remotes');
        await expect(page.getByRole('heading', { name: 'Remotes' })).toBeVisible();
      });

      await test.step('Create new remote via UI', async () => {
        await page.getByTestId('create-remote').click();
        await expect(page.getByRole('heading', { name: 'Create remote' })).toBeVisible();

        await page.getByTestId('name').fill(remoteName);
        await page.getByTestId('url').fill('https://console.redhat.com/api/automation-hub/');
        await page.getByTestId('Submit').click();

        // Verify redirect to details page
        await expect(page.getByRole('heading', { name: remoteName })).toBeVisible({
          timeout: 15000,
        });
        remoteCreated = true;
      });

      await test.step('Navigate back to list and search', async () => {
        await page.getByLabel('Breadcrumb').getByRole('link', { name: 'Remotes' }).click();
        await expect(page.getByRole('heading', { name: 'Remotes' })).toBeVisible();

        await clearTableFilters(page);
        await filterTable({ filterLabel: 'Name', filterValue: remoteName }, page);
        await expect(page.locator('tbody')).toContainText(remoteName);
      });

      await test.step('Delete remote from kebab menu', async () => {
        // Filter to find the row
        await clearTableFilters(page);
        await filterTable({ filterLabel: 'Name', filterValue: remoteName }, page);

        // Click actions kebab in the row
        const row = page.locator('tbody tr').first();
        await row.getByTestId('actions-column-cell').click();
        await page.getByTestId('delete-remote').click();

        // Confirm deletion
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.locator('#confirm').check();
        await dialog.getByRole('button', { name: 'Delete remotes', exact: true }).click();

        await expect(dialog).not.toBeVisible({ timeout: 30000 });
        remoteCreated = false;
      });

      await test.step('Verify remote was deleted', async () => {
        await clearTableFilters(page);
        await filterTable({ filterLabel: 'Name', filterValue: remoteName }, page);
        await expect(page.locator('.pf-v6-c-empty-state')).toBeVisible();
      });
    } finally {
      if (remoteCreated) {
        try {
          const remote = await Remote.api.get(page, remoteName);
          await Remote.api.delete(page, remote.pulp_href);
        } catch {
          // Ignore errors during cleanup
        }
      }
    }
  });

  test(
    'should display alert for community URL with signed collections',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const remoteName = createE2EName('remote');
      let remoteCreated = false;

      try {
        await test.step('Navigate to create remote form', async () => {
          await navigateTo(page, 'Automation Content', 'Remotes');
          await page.getByTestId('create-remote').click();
          await expect(page.getByRole('heading', { name: 'Create remote' })).toBeVisible();
        });

        await test.step('Enter community URL and check signed only', async () => {
          await page.getByTestId('name').fill(remoteName);
          await page.getByTestId('url').fill('https://galaxy.ansible.com/api/');
          await page.getByTestId('signed_only').check();

          // Verify warning is displayed
          await expect(page.getByTestId('signed-only-warning')).toBeVisible();
          await expect(page.getByTestId('signed-only-warning')).toContainText(
            'Community content will never be synced if this setting is enabled'
          );
        });

        await test.step('Change URL to non-community and verify warning disappears', async () => {
          await page.getByTestId('url').clear();
          await page.getByTestId('url').fill('https://console.redhat.com/api/automation-hub/');

          // Warning should disappear
          await expect(page.getByTestId('signed-only-warning')).not.toBeVisible();
        });

        await test.step('Submit and verify remote created', async () => {
          await page.getByTestId('Submit').click();
          await expect(page.getByRole('heading', { name: remoteName })).toBeVisible({
            timeout: 15000,
          });
          remoteCreated = true;
        });
      } finally {
        if (remoteCreated) {
          try {
            const remote = await Remote.api.get(page, remoteName);
            await Remote.api.delete(page, remote.pulp_href);
          } catch {
            // Ignore errors during cleanup
          }
        }
      }
    }
  );

  test('should edit a remote with advanced options', { tag: ['@not_mock'] }, async ({ page }) => {
    let remote: HubRemote | undefined;

    try {
      await test.step('Create remote with basic config via API', async () => {
        remote = await Remote.api.create(page, {
          signed_only: true,
          sync_dependencies: true,
        });
      });

      if (!remote) throw new Error('Remote not created');

      const remoteName = remote.name;

      await test.step('Navigate to remote and edit', async () => {
        await navigateTo(page, 'Automation Content', 'Remotes');
        await clearTableFilters(page);
        await filterTable({ filterLabel: 'Name', filterValue: remoteName }, page);

        // Click edit button (it's a pinned action, visible directly)
        await page.getByTestId('edit-remote').click();

        await expect(page.getByRole('heading', { name: `Edit ${remoteName}` })).toBeVisible();
      });

      await test.step('Update remote with advanced options', async () => {
        // Update basic fields (not in advanced section)
        await page.getByTestId('url').clear();
        await page.getByTestId('url').fill('https://galaxy.ansible.com/api/');
        await page.getByTestId('username').fill('testuser');
        await page.getByTestId('password').fill('testpassword');
        await page.getByTestId('token').fill('test-token-123');
        await page.getByRole('textbox', { name: 'SSO URL' }).fill('https://sso.example.com/');

        // Expand advanced options section if not already expanded
        const showButton = page.getByText('Show advanced options');
        const hideButton = page.getByText('Hide advanced options');

        if (await showButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await showButton.click();
          // Wait for advanced section to expand
          await hideButton.waitFor({ state: 'visible' });
        }

        // Fill advanced fields (proxy, misc, certificates) - use role selectors for consistency
        await page
          .getByRole('textbox', { name: 'Proxy URL' })
          .fill('https://proxy.example.com:8080');
        await page.getByRole('textbox', { name: 'Proxy username' }).fill('proxyuser');
        await page.getByRole('textbox', { name: 'Proxy password' }).fill('proxypass');
        await page.getByRole('spinbutton', { name: 'Download concurrency' }).fill('10');
        await page.getByRole('spinbutton', { name: 'Rate limit' }).fill('5');
        // TLS validation checkbox doesn't have an accessible name, find it by testid
        await page.getByTestId('tls_validation').uncheck();

        // Update requirements file (using the code editor textbox)
        const requirementsEditor = page.getByRole('textbox', { name: 'Editor content' });
        await requirementsEditor.click({ force: true });
        await requirementsEditor.clear();
        await requirementsEditor.fill('collections:\n  - name: community.general');

        await page.getByRole('button', { name: 'Save remote', exact: true }).click();

        await expect(page.getByRole('heading', { name: remoteName })).toBeVisible({
          timeout: 15000,
        });
      });

      await test.step('Verify all fields were updated', async () => {
        // Verify basic fields on details page (using kebab-case for PageDetail testids)
        await expect(page.getByTestId('server-url')).toContainText(
          'https://galaxy.ansible.com/api/'
        );
        await expect(page.getByTestId('proxy-url')).toContainText('https://proxy.example.com:8080');
        await expect(page.getByTestId('tls-validation')).toContainText('Disabled');
        await expect(page.getByTestId('rate-limit')).toContainText('5');
        await expect(page.getByTestId('download-concurrency')).toContainText('10');
        await expect(page.getByTestId('download-only-signed-collections')).toContainText('True');
        await expect(
          page.getByTestId('include-all-dependencies-when-syncing-a-collection')
        ).toContainText('True');
        await expect(page.getByTestId('code-block-value')).toContainText('community.general');
      });
    } finally {
      if (remote) {
        try {
          await Remote.api.delete(page, remote.pulp_href);
        } catch {
          // Ignore cleanup errors - browser context may be closed
        }
      }
    }
  });

  test(
    'should create remote with empty requirements file',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const remoteName = createE2EName('remote');
      let remoteCreated = false;

      try {
        await test.step('Navigate to create remote form', async () => {
          await navigateTo(page, 'Automation Content', 'Remotes');
          await page.getByTestId('create-remote').click();
          await expect(page.getByRole('heading', { name: 'Create remote' })).toBeVisible();
        });

        await test.step('Create remote with empty requirements', async () => {
          await page.getByTestId('name').fill(remoteName);
          await page.getByTestId('url').fill('https://console.redhat.com/api/automation-hub/');
          await page.getByTestId('signed_only').check();
          await page.getByTestId('sync_dependencies').check();

          // Clear requirements file (using the code editor textbox)
          const requirementsEditor = page.getByRole('textbox', { name: 'Editor content' });
          await requirementsEditor.click({ force: true });
          await requirementsEditor.clear();

          await page.getByTestId('Submit').click();

          await expect(page.getByRole('heading', { name: remoteName })).toBeVisible({
            timeout: 15000,
          });
          remoteCreated = true;
        });

        await test.step('Verify empty requirements section', async () => {
          // Should show "Sync everything" when requirements file is empty
          await expect(page.getByTestId('yaml-requirements')).toContainText('Sync everything');
        });
      } finally {
        if (remoteCreated) {
          try {
            const remote = await Remote.api.get(page, remoteName);
            await Remote.api.delete(page, remote.pulp_href);
          } catch {
            // Ignore errors during cleanup
          }
        }
      }
    }
  );

  test('should edit remote - save without changes', { tag: ['@not_mock'] }, async ({ page }) => {
    let remote: HubRemote | undefined;

    try {
      await test.step('Create remote via API', async () => {
        remote = await Remote.api.create(page);
      });

      if (!remote) throw new Error('Remote not created');

      const remoteName = remote.name;

      await test.step('Navigate to edit form', async () => {
        await navigateTo(page, 'Automation Content', 'Remotes');
        await clearTableFilters(page);
        await filterTable({ filterLabel: 'Name', filterValue: remoteName }, page);

        await page.getByTestId('edit-remote').click();
        await expect(page.getByRole('heading', { name: `Edit ${remoteName}` })).toBeVisible();
      });

      await test.step('Type and clear a field, then save', async () => {
        // Type something in username field
        await page.getByTestId('username').fill('abc');

        // Clear it by backspacing
        await page.getByTestId('username').press('Control+A');
        await page.getByTestId('username').press('Backspace');

        // Save should work without error
        await page.getByRole('button', { name: 'Save remote', exact: true }).click();

        // Should redirect to details page without error
        await expect(page.getByRole('heading', { name: remoteName })).toBeVisible({
          timeout: 15000,
        });
      });
    } finally {
      if (remote) {
        await Remote.api.delete(page, remote.pulp_href);
      }
    }
  });

  test('should verify download buttons work', { tag: ['@not_mock'] }, async ({ page }) => {
    const caCert = `-----BEGIN CERTIFICATE-----
MIIFnzCCA4egAwIBAgIUWlomUBb9ad0KVgZDX05ynPyZfGYwDQYJKoZIhvcNAQEL
BQAweDELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk5DMRAwDgYDVQQHDAdSYWxlaWdo
MQswCQYDVQQKDAJSSDEMMAoGA1UECwwDQUFQMQ4wDAYDVQQDDAVTYXJhaDEfMB0G
CSqGSIb3DQEJARYQc2FrdXNAcmVkaGF0LmNvbTAeFw0yNTA2MDIxOTEwMDFaFw0y
NjA2MDIxOTEwMDFaMHgxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJOQzEQMA4GA1UE
BwwHUmFsZWlnaDELMAkGA1UECgwCUkgxDDAKBgNVBAsMA0FBUDEOMAwGA1UEAwwF
U2FyYWgxHzAdBgkqhkiG9w0BCQEWEHNha3VzQHJlZGhhdC5jb20wggIiMA0GCSqG
SIb3DQEBAQUAA4ICDwAwggIKAoICAQCecCBMHukZydr0oL4PTQntM5klLpkI03eF
9AI9ws3zzRWhatFS0UYFs9CGA+O5yjK5neNJ8sHYmMxdhfFXOkJC1fWITgIerhhl
vHxXzVFu7IzJiOytfF01yYhUIFEIfjPpl4P0hld2UF/RfZeuLitsr5tpmv5S9YQg
t8uOr9fiMNnZltaKOmoYst1OZqF0LF5jKu8WyqyBBu/uh3UwW0kwQs7lPjYGUHy9
vFvcgrai9KPJlmQmxOGyPGmrcCJIKAjKMXOlEpYxSnWNb5aVCQFsxfwr1EKeD0Bk
ENIJU26MqMLmL6kMxtBIzSlX3xbkIV+nvAkonOJKoA1SWw5GAtbm8ai/ESsyJL6/
A4na9Ls7+Ckkfh+DuoGmwnw+XLHZcORCc6KojkKpgUlOlhYkJWAaFyxXzGZAHApA
WkX9k+7z1gPcmww6fRP9Ya23Usyq2qVnQnkhGkq6SJLO6CaifQ7geLFC6YjFeZwD
inNcHnGHHYpgYbNNuyHijUWcGlNkAEXMVvP61rF++spcDLp7zTgVxqSGh1XApphs
7SNyNddorBgPVTAmo52gpK92v/6YHECUDYNUV2Qlj8Pq3tt2LN1SZfXNiB53y3CB
NBh4n4z73JXrAyRbBsbBSGxoanW1l1tnT0ZGXK6yb2vNOjIeLuSZOEmEbHBdRWvH
icYr9hbWUQIDAQABoyEwHzAdBgNVHQ4EFgQUEw2Trbq6Kq/jw3CiFr3VDpzjAZQw
DQYJKoZIhvcNAQELBQADggIBAHEPppPMDSbNWQyrf8jmM2LhFgW/P0IQ0NYdkiLy
eoxYWCcDD8ijzIXKRjxjD4dD1z2dOvYxBLKp3P7NieNY26mS7qtre0D7aZQf0Mme
KLfwfl3hw7Mj7VybkVEMb2bydsBFK/HdAgFZqcbdWp6GP+1PvIydRUxXT+LiXuAo
MuWT13kDZGDqBb7YTWMM1GUSMxWhUQ4oWzW4T+fVl+2zWchx4VihKJFlmMBL6BCV
R17TS5aRHW+PAHcyNg71hauiySHhZaRmO/D93HQ3ack2aXU/wV+kk/8HOkykRWIB
bSwzmuSBHyc5wzBUrp3DBNO/7cx7CY6+ag2GnLKIXOxf1YymRVMG4o1b2fyLZ+1+
QVjjkaIYvaKChcmBWyVUzSIVd+BFnlG4uQNGoLzxS8uCDXBYazFzLSqUP2dqmRDw
uASL/4W4JlKHTvusoR9H8lEgHUb1wRQW+ISwM6rql5bzhgiJQRuQm4rYqFvDh0Tn
pKz7Fnz1TatALJPnHnM8UacjdGaykV1X3HiWLRcMHskkmNlYgI4EoLiRnh5K2WX+
cI3I9fHNSyiL1iGw4EicfTwhJIiEPbR0K/NFm/M4fCit4pWVWh/QBIusUQ8XtXGT
ZctsPsQiuHJzMv/25snuVzBaBTmEN5OxAQc1JS7uYakyvJ6T108Vb4K+7dnQ6GZm
oVRa
-----END CERTIFICATE-----`;

    const clientCert = caCert; // Same for test purposes
    const requirementsFile = 'collections:\n  - testing.ansible_testing_content';

    let remote: HubRemote | undefined;

    try {
      await test.step('Create remote with certificates and requirements via API', async () => {
        remote = await Remote.api.create(page, {
          url: 'https://console.redhat.com/api/automation-hub/',
          ca_cert: caCert,
          client_cert: clientCert,
          requirements_file: requirementsFile,
        });
      });

      if (!remote) throw new Error('Remote not created');

      const remoteName = remote.name;

      await test.step('Navigate to remotes list', async () => {
        await navigateTo(page, 'Automation Content', 'Remotes');
        await clearTableFilters(page);
        await filterTable({ filterLabel: 'Name', filterValue: remoteName }, page);
      });

      await test.step('Download and verify requirement file', async () => {
        const downloadPromise = page.waitForEvent('download');
        const row = page.locator('tbody tr').first();
        await row.getByTestId('actions-column-cell').click();
        await page.getByTestId('download-requirement-file').click();

        const download = await downloadPromise;
        const path = await download.path();
        if (!path) throw new Error('Download path not found');

        const content = await fs.readFile(path, 'utf-8');
        expect(content).toContain('testing.ansible_testing_content');
      });

      await test.step('Download and verify CA certificate', async () => {
        const downloadPromise = page.waitForEvent('download');
        const row = page.locator('tbody tr').first();
        await row.getByTestId('actions-column-cell').click();
        await page.getByTestId('download-ca-certificate').click();

        const download = await downloadPromise;
        const path = await download.path();
        if (!path) throw new Error('Download path not found');

        const content = await fs.readFile(path, 'utf-8');
        expect(content).toContain('-----BEGIN CERTIFICATE-----');
        expect(content).toContain('-----END CERTIFICATE-----');
      });

      await test.step('Download and verify client certificate', async () => {
        const downloadPromise = page.waitForEvent('download');
        const row = page.locator('tbody tr').first();
        await row.getByTestId('actions-column-cell').click();
        await page.getByTestId('download-client-certificate').click();

        const download = await downloadPromise;
        const path = await download.path();
        if (!path) throw new Error('Download path not found');

        const content = await fs.readFile(path, 'utf-8');
        expect(content).toContain('-----BEGIN CERTIFICATE-----');
        expect(content).toContain('-----END CERTIFICATE-----');
      });
    } finally {
      if (remote) {
        await Remote.api.delete(page, remote.pulp_href);
      }
    }
  });
});
