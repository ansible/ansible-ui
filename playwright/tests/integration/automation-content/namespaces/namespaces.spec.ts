import { expect, test } from '@playwright/test';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Namespace } from '@ansible/playwright/utils';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Namespaces', () => {
  test(
    'should create, search and delete a namespace',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Content', 'Namespaces');
      await expect(page.getByRole('heading', { name: 'Namespaces' })).toBeVisible();

      const namespaceName = createE2EName('namespace').toLowerCase().replace(/\s+/g, '_');
      await page.getByText('Create namespace', { exact: true }).click();

      await expect(page).toHaveURL(/\/namespaces\/create/);
      await page.getByTestId('name').fill(namespaceName);
      await page.getByTestId('company').fill('test company');
      await page.locator('.view-lines').click();
      await page.keyboard.type('name: example_namespace');
      await page.getByText('Preview', { exact: true }).click();
      await expect(page.getByTestId('resources-form-group')).toContainText(
        'name: example_namespace'
      );
      await page.getByText('Markdown', { exact: true }).click();
      await page.getByTestId('link-text-0').fill('test link');
      await page.getByTestId('link-url-0').fill('https://test.com');
      await page.getByTestId('Submit').click();

      await expect(page).toHaveURL(new RegExp(`/namespaces/${namespaceName}/details`));
      await expect(page.getByText('Resources', { exact: true })).toBeVisible();
      await expect(page.getByText('name: example_namespace')).toBeVisible();

      await page.getByTestId('actions-dropdown').click();
      await page.getByTestId('delete-namespace').click();
      await page.locator('[data-ouia-component-id="confirm"]').click();
      await page.getByRole('button', { name: 'Delete namespaces', exact: true }).click();

      await expect(page).toHaveURL(/\/namespaces/);
      await expect(page).not.toHaveURL(new RegExp(`/namespaces/${namespaceName}/details`));
    }
  );

  test(
    'should show the correct URL when clicking on the CLI configuration tab',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Content', 'Namespaces');
      await expect(page.getByTestId('page-title')).toBeVisible();

      const namespaceName = createE2EName('namespace').toLowerCase().replace(/\s+/g, '_');
      await page.getByText('Create namespace', { exact: true }).click();

      await expect(page).toHaveURL(/\/namespaces\/create/);
      await page.getByTestId('name').fill(namespaceName);
      await page.getByTestId('company').fill('test company');
      await page.getByTestId('Submit').click();

      await expect(page).toHaveURL(new RegExp(`/namespaces/${namespaceName}/details`));
      await expect(page.getByTestId('namespace-cli-tab')).toContainText('CLI Configuration');
      await page.getByTestId('namespace-cli-tab').click();

      const apiPrefix = process.env.HUB_API_PREFIX || '/api/galaxy';
      await expect(page.locator('.pf-v6-c-truncate__start')).toContainText(apiPrefix);

      await page.getByTestId('actions-dropdown').click();
      await page.getByTestId('delete-namespace').click();
      await page.locator('[data-ouia-component-id="confirm"]').click();
      await page.getByRole('button', { name: 'Delete namespaces', exact: true }).click();
    }
  );
});

test.describe('Hub - Namespaces - Use Existing Namespaces', () => {
  let namespaceName: string;

  test.beforeEach(async ({ page }) => {
    const namespace = await Namespace.api.create(page, {
      description: 'test description',
      company: 'test company',
      links: [{ name: 'test link', url: 'https://test.com' }],
    });
    namespaceName = namespace.name;
  });

  test.afterEach(async ({ page }) => {
    await Namespace.api.delete(page, namespaceName);
  });

  test('should show collections tab', { tag: ['@not_mock', '@tier1'] }, async ({ page }) => {
    await navigateTo(page, 'Automation Content', 'Namespaces');
    await page.locator('[data-cy="table-view"] button').click();
    await clickTableRow({ text: namespaceName }, page);

    await expect(page).toHaveURL(new RegExp(`/namespaces/${namespaceName}/details`));
    await expect(page.getByTestId('collections-tab')).toContainText('Collections');
    await page.getByTestId('collections-tab').click();
    await expect(page.getByText('No collections yet')).toBeVisible();
    await expect(page.getByText('Upload collection')).toBeVisible();

    await page.getByTestId('actions-dropdown').click();
    await page.getByTestId('imports').click();

    await expect(page).toHaveURL(/\/my-imports/);
    await expect(page).toHaveURL(new RegExp(namespaceName));
    await expect(page.getByRole('heading', { name: 'My Imports' })).toBeVisible();
    await expect(page.locator('#namespace-selector')).toContainText(namespaceName);
  });

  test('should edit a namespace', { tag: ['@not_mock', '@tier1'] }, async ({ page }) => {
    await navigateTo(page, 'Automation Content', 'Namespaces');
    await page.locator('[data-cy="table-view"] button').click();
    await clickTableRow({ text: namespaceName }, page);

    await expect(page).toHaveURL(new RegExp(`/namespaces/${namespaceName}/details`));
    await page.getByTestId('edit-namespace').click();
    await expect(page.getByRole('heading', { name: `Edit ${namespaceName}` })).toBeVisible();

    await expect(page.getByTestId('company-form-group').locator('input')).toBeVisible();
    await expect(page.getByTestId('description-form-group').locator('textarea')).toBeVisible();

    await page.getByTestId('company').clear();
    await page.getByTestId('company').fill('new company');
    await page.getByTestId('description').clear();
    await page.getByTestId('description').fill('new description');
    await page.getByTestId('Submit').click();

    await expect(page.getByTestId('company')).toHaveText('new company');
    await expect(page.getByTestId('description')).toHaveText('new description');
  });
});

test.describe('Hub - Namespaces - Bulk Delete', () => {
  test('should bulk delete namespaces', { tag: ['@not_mock', '@tier1'] }, async ({ page }) => {
    const namespace1 = await Namespace.api.create(page);
    const namespace2 = await Namespace.api.create(page);

    await navigateTo(page, 'Automation Content', 'Namespaces');
    await expect(page.getByRole('heading', { name: 'Namespaces' })).toBeVisible();

    await page.locator('[data-cy="table-view"] button').click();
    await selectTableRow(
      {
        filterLabel: 'Name',
        filterValue: namespace1.name,
      },
      page
    );

    await selectTableRow(
      {
        filterLabel: 'Name',
        filterValue: namespace2.name,
      },
      page
    );

    await page.getByTestId('page-toolbar').getByTestId('actions-dropdown').click();
    await page.getByTestId('delete-namespaces').click();

    await page.locator('[data-ouia-component-id="confirm"]').click();
    await page.getByRole('button', { name: 'Delete namespaces' }).click();

    await expect(page).toHaveURL(/\/namespaces/);
    await expect(page.getByRole('heading', { name: 'Namespaces' })).toBeVisible();
  });
});
