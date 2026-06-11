import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { test } from '@ansible/playwright/fixtures/hub/collection.fixture';
import {
  Distribution,
  Remote,
  Repository,
  type HubRemote,
  type HubRepository,
  type HubRepositoryDistribution,
} from '@ansible/playwright/utils/hub';
import { expect } from '@playwright/test';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Repositories', () => {
  test(
    'should create, edit, and delete a repository',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const repositoryName = createE2EName();
      const repositoryDescription = 'Here goes description';
      let remote: HubRemote | undefined;

      await test.step('Navigate to repositories page', async () => {
        await navigateTo(page, 'Automation Content', 'Repositories');
        await expect(page.getByRole('heading', { name: 'Repositories' })).toBeVisible();
      });

      await test.step('Create a new repository', async () => {
        await page.getByTestId('create-repository').click();
        await expect(page.getByRole('heading', { name: 'Create repository' })).toBeVisible();

        await page.getByTestId('name').fill(repositoryName);
        await page.getByTestId('description').fill(repositoryDescription);
        await page.getByTestId('Submit').click();

        await expect(page.getByRole('heading', { name: repositoryName })).toBeVisible();
      });

      await test.step('Verify repository details', async () => {
        await expect(page.getByTestId('description')).toContainText('Here goes description');
        await expect(page.getByTestId('labels')).toContainText('None');
        await expect(page.getByTestId('remote')).toContainText('None');
        await expect(page.getByTestId('retained-version-count')).toContainText('1');
      });

      await test.step('Edit the repository', async () => {
        // Create a remote for the edit test
        remote = await Remote.api.create(page);

        await navigateTo(page, 'Automation Content', 'Repositories');
        await clearTableFilters(page);

        await filterTable({ filterLabel: 'Name', filterValue: repositoryName }, page);
        await expect(page.locator('tbody tr')).toHaveCount(1);

        await page.getByRole('row', { name: repositoryName }).getByLabel('Edit repository').click();
        await expect(page.getByRole('heading', { name: `Edit ${repositoryName}` })).toBeVisible();

        const editDescription = 'repositoryDescription edited';
        const retainedNumber = '10';

        await page.getByTestId('description').clear();
        await page.getByTestId('description').fill(editDescription);

        const retainInput = page
          .getByTestId('retain-repo-versions-form-group')
          .locator('input')
          .last();
        await retainInput.clear();
        await retainInput.fill(retainedNumber);

        await page.getByTestId('pipeline-form-group').last().click();
        await page.getByTestId('approved').click();

        await page.locator('#remote').click();
        await page.getByRole('option', { name: remote.name }).click();

        await page.getByTestId('Submit').click();
        await expect(page.getByRole('heading', { name: repositoryName })).toBeVisible();
      });

      await test.step('Verify edited repository details', async () => {
        await expect(page.getByTestId('name')).toContainText(repositoryName);
        await expect(page.getByTestId('description')).toContainText('repositoryDescription edited');
        await expect(page.getByTestId('retained-version-count')).toContainText('10');
        await expect(page.getByTestId('labels')).toContainText('approved');
        if (remote) {
          await expect(page.getByTestId('remote')).toContainText(remote.name);
        }
      });

      await test.step('Delete the repository', async () => {
        await page.getByTestId('actions-dropdown').click();
        await page.getByTestId('delete-repository').click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.getByTestId('confirm').click();
        await dialog.getByRole('button', { name: 'Delete repositories' }).click();

        await expect(page.getByRole('heading', { name: 'Repositories' })).toBeVisible();
      });

      await test.step('Verify repository was deleted', async () => {
        await filterTable({ filterLabel: 'Name', filterValue: repositoryName }, page);
        await expect(page.locator('.pf-v6-c-empty-state')).toBeVisible();
        await expect(page.getByText('No results found')).toBeVisible();
      });

      // Cleanup
      if (remote) {
        await Remote.api.delete(page, remote.pulp_href);
      }
    }
  );

  test(
    'should return 200 status for repository URL',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      let repository: HubRepository | undefined;
      let distribution: HubRepositoryDistribution | undefined;
      let remote: HubRemote | undefined;

      try {
        await test.step('Create prerequisites via API', async () => {
          remote = await Remote.api.create(page);
          repository = await Repository.api.create(page, {
            remote: remote.pulp_href,
            retain_repo_versions: 2,
          });
          distribution = await Distribution.api.create(page, {
            name: repository.name,
            repository: repository.pulp_href,
          });
        });

        if (!repository) throw new Error('Repository not created');

        await test.step('Navigate to repository details', async () => {
          await navigateTo(page, 'Automation Content', 'Repositories');
          await clearTableFilters(page);
          await filterTable({ filterLabel: 'Name', filterValue: repository!.name }, page);
          await page.getByRole('link', { name: repository!.name }).click();
          await expect(page.getByRole('heading', { name: repository!.name })).toBeVisible();
        });

        await test.step('Click copy CLI configuration and verify URL returns 200', async () => {
          await page.getByTestId('actions-dropdown').click();
          await page.getByTestId('copy-cli-configuration').click();

          // Wait for success toast
          await expect(page.getByTestId('alert-toaster')).toBeVisible();

          // Read clipboard contents
          const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
          expect(clipboardContent).toBeTruthy();

          // Extract the URL from the clipboard content
          const urlMatch = clipboardContent.match(/url=(.+)/);
          expect(urlMatch).toBeTruthy();

          const repoUrl = urlMatch![1];

          // Make a request to verify the URL is accessible
          const response = await page.request.get(repoUrl);
          expect(response.status()).toBe(200);
        });

        await test.step('Close the alert toaster', async () => {
          await page.getByTestId('alert-toaster').getByRole('button').click();
        });
      } finally {
        if (distribution) {
          await Distribution.api.delete(page, distribution.pulp_href);
        }
        if (repository) {
          await Repository.api.delete(page, repository.pulp_href);
        }
        if (remote) {
          await Remote.api.delete(page, remote.pulp_href);
        }
      }
    }
  );

  test('should sync repository', { tag: ['@not_mock', '@tier1'] }, async ({ page }) => {
    let repository: HubRepository | undefined;
    let distribution: HubRepositoryDistribution | undefined;
    let remote: HubRemote | undefined;

    try {
      await test.step('Create prerequisites via API', async () => {
        remote = await Remote.api.create(page);
        repository = await Repository.api.create(page, {
          remote: remote.pulp_href,
          retain_repo_versions: 2,
        });
        distribution = await Distribution.api.create(page, {
          name: repository.name,
          repository: repository.pulp_href,
        });
      });

      if (!repository) throw new Error('Repository not created');

      await test.step('Navigate to repositories and sync', async () => {
        await navigateTo(page, 'Automation Content', 'Repositories');
        await clearTableFilters(page);
        await filterTable({ filterLabel: 'Name', filterValue: repository!.name }, page);

        const row = page.getByRole('row', { name: repository!.name });
        await row.getByLabel('kebab dropdown toggle').click();
        await page.getByRole('menuitem', { name: 'Sync repository' }).click();

        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();
        await modal.getByRole('button', { name: 'Sync' }).click();
      });

      await test.step('Verify sync started toast', async () => {
        await expect(page.getByTestId('alert-toaster')).toBeVisible();
        await expect(page.getByTestId('alert-toaster')).toContainText(
          `Sync started for repository "${repository!.name}".`
        );
        await page.getByTestId('alert-toaster').getByRole('button').click();
      });
    } finally {
      if (distribution) {
        await Distribution.api.delete(page, distribution.pulp_href);
      }
      if (repository) {
        await Repository.api.delete(page, repository.pulp_href);
      }
      if (remote) {
        await Remote.api.delete(page, remote.pulp_href);
      }
    }
  });

  test(
    'should add and remove collection versions',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page, collection }) => {
      let remote: HubRemote | undefined;
      let repository: HubRepository | undefined;
      let distribution: HubRepositoryDistribution | undefined;

      try {
        await test.step('Create prerequisites via API', async () => {
          const namespace = 'e2erepo';
          const collectionName = createE2EName('collection').toLowerCase().replace(/\s/g, '_');

          await collection.createNamespace({ name: namespace });
          await collection.uploadVersion({
            namespace,
            name: collectionName,
            version: '1.0.0',
            repository: 'staging',
          });
          await collection.approveCollection({
            namespace,
            name: collectionName,
            version: '1.0.0',
          });

          remote = await Remote.api.create(page);
          repository = await Repository.api.create(page, {
            remote: remote.pulp_href,
            retain_repo_versions: 2,
          });
          distribution = await Distribution.api.create(page, {
            repository: repository.pulp_href,
          });
        });

        if (!repository) throw new Error('Repository not created');

        await test.step('Navigate to repository Collection Versions tab', async () => {
          await navigateTo(page, 'Automation Content', 'Repositories');
          await clearTableFilters(page);
          await filterTable({ filterLabel: 'Name', filterValue: repository!.name }, page);
          await page.getByRole('link', { name: repository!.name }).click();
          await expect(page.getByRole('heading', { name: repository!.name })).toBeVisible();
          await page.getByRole('tab', { name: 'Collection Versions', exact: true }).click();
        });

        const namespace = 'e2erepo';
        const collectionName = collection.getUploadedCollections()[0]?.name;
        if (!collectionName) throw new Error('Collection not found');

        await test.step('Add collection to repository', async () => {
          await page.getByTestId('add-collections').click();

          // Select collection in modal
          await expect(page.getByRole('dialog')).toBeVisible();
          await filterTable({ filterLabel: 'Namespace', filterValue: namespace }, page);
          await page
            .getByRole('row', { name: new RegExp(collectionName) })
            .getByRole('checkbox', { name: 'Select row' })
            .check();
          await page.getByRole('button', { name: 'Select', exact: true }).click();
          await expect(page.getByRole('dialog')).toBeHidden();
        });

        await test.step('Verify collection was added', async () => {
          // Switch to table view if needed
          const tableViewButton = page.getByRole('button', { name: 'Table view' });
          if (await tableViewButton.isVisible().catch(() => false)) {
            await tableViewButton.click();
          }

          await expect(page.locator('tbody')).toContainText(collectionName);
        });

        await test.step('Test remove collection (cancel first)', async () => {
          // Try to remove via row action, then cancel
          await page
            .getByRole('row', { name: new RegExp(collectionName) })
            .getByTestId('remove')
            .click();

          await expect(page.getByRole('dialog')).toBeVisible();
          await expect(
            page.getByRole('button', { name: 'Delete collections versions' })
          ).toBeVisible();
          await page.getByRole('button', { name: 'Cancel' }).click();
          await expect(page.getByRole('dialog')).toBeHidden();

          // Collection should still be visible
          await expect(page.locator('tbody')).toContainText(collectionName);
        });

        await test.step('Remove collection from repository', async () => {
          // Select and remove via toolbar
          await page
            .getByRole('row', { name: new RegExp(collectionName) })
            .getByRole('checkbox', { name: 'Select row' })
            .check();
          await page.getByRole('button', { name: /Remove collections/i }).click();

          await expect(page.getByRole('dialog')).toBeVisible();
          // Check both confirmation boxes if present
          const confirmCheckbox = page.locator('#confirm');
          if (await confirmCheckbox.isVisible().catch(() => false)) {
            await confirmCheckbox.check();
          }
          const iUnderstandCheckbox = page.getByRole('checkbox', {
            name: /I understand that this action cannot be undone/i,
          });
          if (await iUnderstandCheckbox.isVisible().catch(() => false)) {
            await iUnderstandCheckbox.check();
          }
          await page.locator('#submit').click();
          await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
        });

        await test.step('Verify collection was removed', async () => {
          await expect(page.getByRole('row', { name: new RegExp(collectionName) })).toBeHidden();
        });
      } finally {
        if (distribution) {
          await Distribution.api.delete(page, distribution.pulp_href);
        }
        if (repository) {
          await Repository.api.delete(page, repository.pulp_href);
        }
        if (remote) {
          await Remote.api.delete(page, remote.pulp_href);
        }
      }
    }
  );
});
