import { expect, test } from '@playwright/test';
import { filterTableByText } from '@ansible/playwright/commands/filterTableByText';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { HubExecutionEnvironment, RemoteRegistry } from '@ansible/playwright/utils';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Execution Environment - Details Page', () => {
  test('should add README with markdown editor', { tag: ['@not_mock'] }, async ({ page }) => {
    const remoteRegistryName = createE2EName('remote-registry');
    const remoteRegistry = await RemoteRegistry.api.create(page, { name: remoteRegistryName });
    const executionEnvironment = await HubExecutionEnvironment.api.create(page, {
      registry: remoteRegistry.id,
    });

    await test.step('Navigate to execution environment details', async () => {
      await navigateTo(page, 'Automation Content', 'Execution Environments');
      await expect(page.getByTestId('page-title')).toHaveText('Execution Environments');

      await filterTableByText({ filterValue: executionEnvironment.name }, page);
      await page.getByRole('link', { name: executionEnvironment.name, exact: true }).click();
    });

    await test.step('Open README editor and add markdown content', async () => {
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByText('README')).toBeVisible();

      const readmeContainer = page.getByTestId('readme');
      await expect(readmeContainer.getByText('Raw Markdown')).toBeVisible();
      await expect(readmeContainer.getByText('Preview')).toBeVisible();

      await readmeContainer.getByTestId('raw-markdown').fill('# Heading 1');
    });

    await test.step('Preview markdown and save', async () => {
      const readmeContainer = page.getByTestId('readme');
      await readmeContainer.getByText('Preview').click();

      // Verify preview shows rendered markdown
      await expect(readmeContainer.locator('h1')).toContainText('Heading 1');

      await expect(readmeContainer.getByRole('button', { name: 'Cancel' })).toBeVisible();

      const putResponsePromise = page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              `/v3/plugin/execution-environments/repositories/${executionEnvironment.name}/_content/readme/`
            ) &&
          response.request().method() === 'PUT' &&
          response.status() === 200
      );

      const getResponsePromise = page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              `/v3/plugin/execution-environments/repositories/${executionEnvironment.name}/_content/readme/`
            ) &&
          response.request().method() === 'GET' &&
          response.status() === 200
      );

      await readmeContainer.getByRole('button', { name: 'Save' }).click();

      await putResponsePromise;
      await getResponsePromise;
    });

    await test.step('Verify README is displayed', async () => {
      const readmeContainer = page.getByTestId('readme');
      await expect(readmeContainer.locator('h1')).toContainText('Heading 1');
    });

    await test.step('Delete remote registry and execution environment', async () => {
      await RemoteRegistry.api.delete(page, remoteRegistry.id);
      await HubExecutionEnvironment.api.delete(page, executionEnvironment.name);
    });
  });

  test('should update README content when edited', { tag: ['@not_mock'] }, async ({ page }) => {
    const remoteRegistryName = createE2EName('remote-registry');
    const remoteRegistry = await RemoteRegistry.api.create(page, { name: remoteRegistryName });
    const executionEnvironment = await HubExecutionEnvironment.api.create(page, {
      registry: remoteRegistry.id,
    });

    await test.step('Navigate to execution environment details', async () => {
      await navigateTo(page, 'Automation Content', 'Execution Environments');
      await expect(page.getByTestId('page-title')).toHaveText('Execution Environments');

      await filterTableByText({ filterValue: executionEnvironment.name }, page);
      await page.getByRole('link', { name: executionEnvironment.name, exact: true }).click();
    });

    await test.step('Create initial README', async () => {
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByText('README')).toBeVisible();

      const readmeContainer = page.getByTestId('readme');
      await readmeContainer.getByTestId('raw-markdown').fill('# Heading 1');
      await readmeContainer.getByText('Preview').click();

      // Verify preview shows initial content
      await expect(readmeContainer.locator('h1')).toContainText('Heading 1');

      const putResponsePromise = page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              `/v3/plugin/execution-environments/repositories/${executionEnvironment.name}/_content/readme/`
            ) &&
          response.request().method() === 'PUT' &&
          response.status() === 200
      );

      const getResponsePromise = page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              `/v3/plugin/execution-environments/repositories/${executionEnvironment.name}/_content/readme/`
            ) &&
          response.request().method() === 'GET' &&
          response.status() === 200
      );

      await readmeContainer.getByRole('button', { name: 'Save' }).click();

      await putResponsePromise;
      await getResponsePromise;

      // Wait for the saved README to be visible
      await expect(readmeContainer.locator('h1')).toContainText('Heading 1');
    });

    await test.step('Edit existing README', async () => {
      const readmeContainer = page.getByTestId('readme');

      await readmeContainer.getByRole('button', { name: 'Edit' }).click();
      await readmeContainer.getByTestId('raw-markdown').fill('# Edited Heading 1');
      await readmeContainer.getByTestId('raw-markdown').pressSequentially('\n**bold text**');
    });

    await test.step('Preview updated content and save', async () => {
      const readmeContainer = page.getByTestId('readme');
      await readmeContainer.getByText('Preview').click();

      // Verify preview shows updated content
      await expect(readmeContainer.locator('h1')).toContainText('Edited Heading 1');
      await expect(readmeContainer.locator('strong')).toContainText('bold text');

      const putResponsePromise = page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              `/v3/plugin/execution-environments/repositories/${executionEnvironment.name}/_content/readme/`
            ) &&
          response.request().method() === 'PUT' &&
          response.status() === 200
      );

      const getResponsePromise = page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              `/v3/plugin/execution-environments/repositories/${executionEnvironment.name}/_content/readme/`
            ) &&
          response.request().method() === 'GET' &&
          response.status() === 200
      );

      await readmeContainer.getByRole('button', { name: 'Save' }).click();

      await putResponsePromise;
      await getResponsePromise;
    });

    await test.step('Verify README shows updated content', async () => {
      const readmeContainer = page.getByTestId('readme');
      await expect(readmeContainer.locator('h1')).toContainText('Edited Heading 1');
      await expect(readmeContainer.locator('strong')).toContainText('bold text');
    });

    await test.step('Delete remote registry and execution environment', async () => {
      await RemoteRegistry.api.delete(page, remoteRegistry.id);
      await HubExecutionEnvironment.api.delete(page, executionEnvironment.name);
    });
  });
});
