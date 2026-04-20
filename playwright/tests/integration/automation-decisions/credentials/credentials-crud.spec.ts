import { edaAPI } from '@ansible/playwright/commands/apiClient';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { isSaaS } from '@ansible/playwright/commands/getTopologyType';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';
import { EdaCredential } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

// Skip all tests if running on SaaS deployment
test.beforeAll(() => {
  if (isSaaS()) {
    test.skip(true, 'EDA credentials not available on SaaS deployments');
  }
});

test.beforeEach(setupBefore({ path: '/decisions/infrastructure/credentials' }));
test.afterEach(setupAfter);

test.describe('EDA Credentials - CRUD Operations', () => {
  test(
    'should create a container registry credential and assert details',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const name = createE2EName('container-credential');
      let credentialCreated = false;

      try {
        await test.step('Navigate and start creation', async () => {
          await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
          await expect(
            page.getByRole('heading', { name: 'Credentials', exact: true })
          ).toBeVisible();
          await page.getByText('Create credential').click();
        });

        await test.step('Fill credential form', async () => {
          await page.getByPlaceholder('Enter credential name').fill(name);
          await page
            .getByPlaceholder('Enter description')
            .fill('This is a container registry credential.');
          await singleSelectByLabel('Organization', 'Default', page);
        });

        await test.step('Select Container Registry type', async () => {
          await page.getByRole('button', { name: 'Credential type' }).click();
          await page.getByRole('textbox', { name: 'Search input' }).fill('Container Registry');
          await page.getByRole('option', { name: 'Container Registry' }).click();
        });

        await test.step('Fill credential inputs', async () => {
          await page.getByRole('textbox', { name: 'Username' }).fill('admin');
          await page.getByRole('textbox', { name: 'Password' }).fill('testtoken');
        });

        await test.step('Submit and verify', async () => {
          await page.getByRole('button', { name: 'Create credential' }).click();
          await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
          credentialCreated = true;

          await expect(page.locator('#name')).toContainText(name);
          await expect(page.locator('#description')).toContainText(
            'This is a container registry credential.'
          );
          await expect(page.getByTestId('credential-type')).toContainText('Container Registry');
          await expect(page.getByTestId('username')).toContainText('admin');
        });
      } finally {
        if (credentialCreated) {
          await EdaCredential.ui.delete(page, name);
        }
      }
    }
  );

  test(
    'should create a GitHub token credential and assert details',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const name = createE2EName('github-credential');
      let credentialCreated = false;

      try {
        await test.step('Navigate and start creation', async () => {
          await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
          await expect(
            page.getByRole('heading', { name: 'Credentials', exact: true })
          ).toBeVisible();
          await page.getByText('Create credential').click();
        });

        await test.step('Fill credential form', async () => {
          await page.getByPlaceholder('Enter credential name').fill(name);
          await page.getByPlaceholder('Enter description').fill('This is a GitHub Credential.');
          await singleSelectByLabel('Organization', 'Default', page);
        });

        await test.step('Select Source Control type', async () => {
          await page.getByRole('button', { name: 'Credential type' }).click();
          await page.getByRole('textbox', { name: 'Search input' }).fill('Source Control');
          await page.getByRole('option', { name: 'Source Control' }).click();
        });

        await test.step('Fill credential inputs', async () => {
          await page.getByRole('textbox', { name: 'Password' }).fill('testtoken');
          await page.getByRole('textbox', { name: 'Username' }).fill('admin');
        });

        await test.step('Submit and verify', async () => {
          await page.getByRole('button', { name: 'Create credential' }).click();
          await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
          credentialCreated = true;

          await expect(page.locator('#name')).toContainText(name);
          await expect(page.locator('#description')).toContainText('This is a GitHub Credential.');
          await expect(page.getByTestId('credential-type')).toContainText('Source Control');
          await expect(page.getByTestId('username')).toContainText('admin');
        });
      } finally {
        if (credentialCreated) {
          await EdaCredential.ui.delete(page, name);
        }
      }
    }
  );

  test('should edit a credential', { tag: ['@not_mock'] }, async ({ page }) => {
    const originalName = createE2EName('credential');

    await test.step('Create credential via UI', async () => {
      await EdaCredential.ui.create(page, { credentialName: originalName });
    });

    try {
      await test.step('Navigate to credentials list', async () => {
        await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
        await expect(page.getByRole('heading', { name: 'Credentials', exact: true })).toBeVisible();
      });

      await test.step('Open credential and edit', async () => {
        await clickTableRow(
          {
            text: originalName,
            pageTitle: 'Credentials',
            filterLabel: 'Name',
            filterValue: originalName,
            clearFilters: true,
          },
          page
        );
        await expect(page.getByRole('heading', { name: originalName, exact: true })).toBeVisible();
        await clickPageAction('Edit credential', page);
        await expect(page.getByRole('heading', { name: `Edit ${originalName}` })).toBeVisible();
      });

      await test.step('Modify credential fields', async () => {
        await page.getByPlaceholder('Enter credential name').clear();
        await page.getByPlaceholder('Enter credential name').fill(originalName + 'lalala');
        await page.getByPlaceholder('Enter description').clear();
        await page
          .getByPlaceholder('Enter description')
          .fill('this credential type has been changed');
      });

      await test.step('Save and verify changes', async () => {
        await page.getByRole('button', { name: 'Save credential' }).click();
        await expect(page.locator('#name')).toContainText(originalName + 'lalala');
        await expect(page.locator('#description')).toContainText(
          'this credential type has been changed'
        );
      });
    } finally {
      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
      await EdaCredential.ui.delete(page, originalName + 'lalala');
    }
  });

  test('should delete a credential', { tag: ['@not_mock'] }, async ({ page }) => {
    const credentialName = createE2EName('credential');

    await test.step('Create credential via UI', async () => {
      await EdaCredential.ui.create(page, { credentialName });
    });

    await test.step('Navigate to credentials list', async () => {
      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
      await expect(page.getByRole('heading', { name: 'Credentials', exact: true })).toBeVisible();
    });

    await test.step('Open credential details', async () => {
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
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
    });

    await test.step('Delete credential and verify', async () => {
      const deleteResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/eda-credentials/') &&
          response.request().method() === 'DELETE' &&
          response.status() === 204
      );

      await clickPageAction('Delete credential', page);
      await confirmAndAssertDeletion(page);

      const deleteResponse = await deleteResponsePromise;
      expect(deleteResponse.status()).toBe(204);
      await expect(page.getByTestId('page-title')).toHaveText('Credentials');
    });
  });

  test(
    'should show warning when deleting credential in use by project',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('credential');
      const projectName = createE2EName('project');
      let credentialId: number | undefined;
      let projectId: number | undefined;

      try {
        await test.step('Create credential via API', async () => {
          const credential = await EdaCredential.api.create(page, {
            name: credentialName,
            credentialTypeName: 'Source Control',
            description: 'This is a Credential with Source Control type',
            inputs: {
              username: 'username',
              password: 'password',
            },
          });
          credentialId = credential.id;
        });

        await test.step('Create project using the credential', async () => {
          const project = (await edaAPI.post(page, '/projects/', {
            name: projectName,
            organization_id: 1,
            url: 'https://github.com/ansible/ansible-ui',
            eda_credential_id: credentialId,
          })) as { id: number };
          projectId = project.id;
        });

        await test.step('Navigate to credential details', async () => {
          await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
          await expect(
            page.getByRole('heading', { name: 'Credentials', exact: true })
          ).toBeVisible();

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
          await expect(
            page.getByRole('heading', { name: credentialName, exact: true })
          ).toBeVisible();
        });

        await test.step('Attempt delete and verify warning', async () => {
          const deleteResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/eda-credentials/') &&
              response.url().includes('?force=true') &&
              response.request().method() === 'DELETE'
          );

          await clickPageAction('Delete credential', page);

          // Verify warning message appears
          await expect(
            page.getByText(`The following credentials are in use: ${credentialName}`)
          ).toBeVisible();

          await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
          await page.getByRole('button', { name: 'Delete credentials' }).click();

          const deleteResponse = await deleteResponsePromise;
          expect(deleteResponse.status()).toBe(204);
          await expect(page.getByTestId('page-title')).toHaveText('Credentials');
        });
      } finally {
        // Cleanup project first (credential was force deleted)
        if (projectId) {
          try {
            await edaAPI.delete(page, `/projects/${projectId}/`, { expectStatus: 204 });
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );

  test(
    'should show error when deleting credential in use by event stream',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const credentialName = createE2EName('event-stream-credential');
      const eventStreamName = createE2EName('event-stream');
      let credentialId: number | undefined;
      let eventStreamId: number | undefined;

      try {
        await test.step('Create Basic Event Stream credential', async () => {
          const credential = await EdaCredential.api.create(page, {
            name: credentialName,
            credentialTypeName: 'Basic Event Stream',
            description: 'Credential for event stream',
            inputs: {
              username: 'testuser',
              password: 'testpass',
            },
          });
          credentialId = credential.id;
        });

        await test.step('Create event stream using the credential', async () => {
          const eventStream = (await edaAPI.post(page, '/event-streams/', {
            name: eventStreamName,
            event_stream_type: 'basic',
            eda_credential_id: credentialId,
            organization_id: 1,
          })) as { id: number };
          eventStreamId = eventStream.id;
        });

        await test.step('Navigate to credential details', async () => {
          await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
          await expect(
            page.getByRole('heading', { name: 'Credentials', exact: true })
          ).toBeVisible();

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
          await expect(
            page.getByRole('heading', { name: credentialName, exact: true })
          ).toBeVisible();
        });

        await test.step('Attempt delete and verify error', async () => {
          const deleteResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/eda-credentials/') &&
              response.url().includes('?force=true') &&
              response.request().method() === 'DELETE' &&
              response.status() === 409
          );

          await clickPageAction('Delete credential', page);
          await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
          await page.getByRole('button', { name: 'Delete credentials' }).click();

          // Verify error message
          await expect(
            page.getByText(
              new RegExp(
                `Credential ${credentialName} is being referenced by some event streams and cannot be deleted`
              )
            )
          ).toBeVisible();

          const deleteResponse = await deleteResponsePromise;
          expect(deleteResponse.status()).toBe(409);

          await page
            .getByRole('dialog')
            .getByRole('contentinfo')
            .getByRole('button', { name: 'Close' })
            .click();
        });
      } finally {
        // Cleanup in reverse order
        if (eventStreamId) {
          try {
            await edaAPI.delete(page, `/event-streams/${eventStreamId}/`, { expectStatus: 204 });
          } catch {
            // Ignore cleanup errors
          }
        }
        if (credentialId) {
          try {
            await edaAPI.delete(page, `/eda-credentials/${credentialId}/`, {
              expectStatus: 204,
            });
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );
});
