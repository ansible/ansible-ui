import { expect, test } from '@playwright/test';
import { gatewayAPI } from '@ansible/playwright/commands/apiClient';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { OAuthApplication, Organization } from '@ansible/playwright/utils';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { Application } from '@ansible/awx-ui/interfaces/Application';

test.describe('OAuth Applications', () => {
  let organization: PlatformOrganization;

  test.beforeEach(async ({ page }) => {
    await setupBefore({ path: '/' })({ page });
    organization = await Organization.api.create(page, { name: createE2EName('OAuth Org') });
  });

  test.afterEach(async ({ page }) => {
    await Organization.api.delete(page, organization.id).catch(() => {});
    await setupAfter({ page });
  });

  test.describe('Create OAuth Application', () => {
    test(
      'should create an OAuth application with all fields',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const appName = createE2EName('OAuth App');

        await navigateTo(page, 'Access Management', 'OAuth Applications');
        await page.getByText('Create OAuth application', { exact: true }).click();

        await expect(page.getByRole('heading', { name: 'Create OAuth application' })).toBeVisible();

        // Fill required fields
        await page.getByPlaceholder('Enter OAuth application name').fill(appName);
        await page.getByPlaceholder('Enter description').fill('E2E test application');
        await page.getByPlaceholder('Enter redirect URIs').fill('https://example.com/callback');

        // Select organization
        const orgSelectButton = page.getByRole('button', { name: 'Organization' });
        await orgSelectButton.click();
        await page.getByText(organization.name).click();

        // Verify algorithm dropdown has options from the API
        const algorithmSelect = page.getByText('No OIDC support');
        await expect(algorithmSelect).toBeVisible();
        await algorithmSelect.click();
        await expect(page.getByText('RSA with SHA-2 256')).toBeVisible();
        await expect(page.getByText('HMAC with SHA-2 256')).toBeVisible();

        // Select RS256 algorithm
        await page.getByText('RSA with SHA-2 256').click();

        // Verify skip authorization switch is present
        await expect(page.getByText('Skip Authorization')).toBeVisible();

        // Submit
        await page.getByRole('button', { name: /create oauth application/i }).click();

        // Should show the secret modal after creation
        await expect(page.getByText('OAuth Application Secrets')).toBeVisible({
          timeout: 10000,
        });

        // Close the secret modal
        await page.getByRole('button', { name: 'Close' }).click();

        // Verify we're on the details page
        await expect(page.getByTestId('page-title')).toHaveText(appName);

        // Verify algorithm is displayed on the details page
        await expect(page.getByText('RSA with SHA-2 256')).toBeVisible();

        // Cleanup: delete the application via API
        const appsData = await gatewayAPI.get<{ results: Application[] }>(page, `applications/`, {
          params: { name: appName },
        });
        if (appsData?.results[0]) {
          await OAuthApplication.api.delete(page, appsData.results[0].id);
        }
      }
    );
  });

  test.describe('Details Page', () => {
    let application: Application;

    test.beforeEach(async ({ page }) => {
      application = await OAuthApplication.api.create(page, {
        organization: organization.id,
        algorithm: 'RS256',
        skip_authorization: true,
      });
    });

    test.afterEach(async ({ page }) => {
      await OAuthApplication.api.delete(page, application.id).catch(() => {});
    });

    test(
      'should display application details with algorithm and skip authorization',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateTo(page, 'Access Management', 'OAuth Applications');
        await clickTableRow({ filterLabel: 'Name', text: application.name }, page);

        // Verify details fields
        await expect(page.getByTestId('page-title')).toHaveText(application.name);
        await expect(page.getByText('RSA with SHA-2 256')).toBeVisible();
        await expect(page.getByTestId('skip-authorization')).toContainText('Yes');
      }
    );
  });

  test.describe('Edit OAuth Application', () => {
    let application: Application;

    test.beforeEach(async ({ page }) => {
      application = await OAuthApplication.api.create(page, {
        organization: organization.id,
        algorithm: '',
        skip_authorization: false,
        redirect_uris: 'https://example.com/callback',
        authorization_grant_type: 'password',
      });
    });

    test.afterEach(async ({ page }) => {
      await OAuthApplication.api.delete(page, application.id).catch(() => {});
    });

    test(
      'should edit algorithm and skip authorization fields',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateTo(page, 'Access Management', 'OAuth Applications');
        await clickTableRow({ filterLabel: 'Name', text: application.name }, page);

        // Click edit
        await page.getByRole('button', { name: 'Edit OAuth application', exact: true }).click();
        await expect(page.getByRole('heading', { name: `Edit ${application.name}` })).toBeVisible();

        // Change algorithm to HS256
        const algorithmSelect = page.getByText('No OIDC support');
        await algorithmSelect.click();
        await page.getByText('HMAC with SHA-2 256').click();

        // Save
        await page.getByRole('button', { name: /save oauth application/i }).click();

        // Verify the details page shows updated values
        await expect(page.getByText('HMAC with SHA-2 256')).toBeVisible();
      }
    );
  });

  test.describe('Delete OAuth Application', () => {
    let application: Application;

    test.beforeEach(async ({ page }) => {
      application = await OAuthApplication.api.create(page, {
        organization: organization.id,
      });
    });

    test(
      'should delete an OAuth application from details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await navigateTo(page, 'Access Management', 'OAuth Applications');
        await clickTableRow({ filterLabel: 'Name', text: application.name }, page);

        // Open kebab menu and delete
        await page.getByLabel('kebab dropdown toggle').click();
        await page.getByText('Delete OAuth application').click();

        // Confirm deletion
        await page.getByRole('checkbox').click();
        await page.getByRole('button', { name: 'Delete OAuth application', exact: true }).click();

        // Should be redirected to the list page
        await expect(
          page.getByRole('heading', { name: 'OAuth Applications' }).first()
        ).toBeVisible();
      }
    );
  });
});
