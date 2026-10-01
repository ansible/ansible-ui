import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../../../commands/setup';

/**
 * E2E tests for JSON sub-key validation on the AWX Credential form.
 *
 * These tests verify that when a credential type schema includes
 * `pattern` and `pattern_description` fields, the UI applies inline
 * validation to the corresponding form inputs. The backend toggle
 * controls whether patterns appear in the API response; these tests
 * mock the credential type API to inject patterns.
 *
 * AC covered: #1 (CredentialForm reads pattern), #6 (isDirty gating),
 * #7 (toggle off = no validation)
 */

const CREDENTIAL_TYPE_WITH_PATTERN = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 100,
      type: 'credential_type',
      name: 'Custom Cloud',
      description: 'A custom cloud credential type with pattern validation',
      kind: 'cloud',
      namespace: 'custom_cloud',
      managed: false,
      inputs: {
        fields: [
          {
            id: 'api_endpoint',
            type: 'string',
            label: 'API Endpoint',
            help_text: 'The API endpoint URL',
            secret: false,
            pattern: '^https://',
            pattern_description: 'API endpoint must start with https://',
          },
          {
            id: 'api_key',
            type: 'string',
            label: 'API Key',
            help_text: 'The API key',
            secret: true,
          },
          {
            id: 'region',
            type: 'string',
            label: 'Region',
            help_text: 'The cloud region',
            secret: false,
            pattern: '^[a-z]{2}-[a-z]+-\\d+$',
            pattern_description: 'Region must be in format like us-east-1',
          },
        ],
        required: ['api_endpoint'],
      },
      injectors: {},
      summary_fields: { user_capabilities: { edit: true, delete: true } },
      related: { credentials: '', activity_stream: '' },
    },
  ],
};

const CREDENTIAL_TYPE_WITHOUT_PATTERN = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 100,
      type: 'credential_type',
      name: 'Custom Cloud',
      description: 'A custom cloud credential type without pattern validation',
      kind: 'cloud',
      namespace: 'custom_cloud',
      managed: false,
      inputs: {
        fields: [
          {
            id: 'api_endpoint',
            type: 'string',
            label: 'API Endpoint',
            help_text: 'The API endpoint URL',
            secret: false,
          },
          {
            id: 'region',
            type: 'string',
            label: 'Region',
            help_text: 'The cloud region',
            secret: false,
          },
        ],
        required: ['api_endpoint'],
      },
      injectors: {},
      summary_fields: { user_capabilities: { edit: true, delete: true } },
      related: { credentials: '', activity_stream: '' },
    },
  ],
};

test.afterEach(setupAfter);

test.describe('Credentials - JSON Sub-Key Pattern Validation', () => {
  test('should show validation error when input violates pattern', async ({ page }) => {
    // Mock credential types API to return type with pattern fields
    // Register mock BEFORE navigation so it intercepts the initial fetch
    await page.route('**/api/controller/v2/credential_types/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CREDENTIAL_TYPE_WITH_PATTERN),
      });
    });

    await setupBefore({ path: '/execution/infrastructure/credentials/create' })({ page });

    // Fill in required top-level fields
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Test Credential');

    // Select the credential type
    await page.getByTestId('credential-type').click();
    await page.getByRole('option', { name: 'Custom Cloud' }).click();

    // Wait for sub-form to render
    await expect(page.getByRole('textbox', { name: 'API Endpoint' })).toBeVisible({
      timeout: 5000,
    });

    // Type an invalid value (doesn't start with https://)
    await page.getByRole('textbox', { name: 'API Endpoint' }).fill('http://example.com');

    // Blur the field to trigger validation
    await page.getByRole('textbox', { name: 'Region' }).click();

    // Wait for validation error to appear
    await expect(page.getByText('API endpoint must start with https://')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should not show validation error when input matches pattern', async ({ page }) => {
    // Register mock BEFORE navigation so it intercepts the initial fetch
    await page.route('**/api/controller/v2/credential_types/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CREDENTIAL_TYPE_WITH_PATTERN),
      });
    });

    await setupBefore({ path: '/execution/infrastructure/credentials/create' })({ page });

    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Test Credential');
    await page.getByTestId('credential-type').click();
    await page.getByRole('option', { name: 'Custom Cloud' }).click();

    await expect(page.getByRole('textbox', { name: 'API Endpoint' })).toBeVisible({
      timeout: 5000,
    });

    // Type a valid value (starts with https://)
    await page.getByRole('textbox', { name: 'API Endpoint' }).fill('https://api.example.com');

    // Blur the field
    await page.getByRole('textbox', { name: 'Region' }).click();

    // Ensure no validation error appears
    await expect(page.getByText('API endpoint must start with https://')).not.toBeVisible({
      timeout: 2000,
    });
  });

  test('should not apply validation when toggle is off (no patterns in response)', async ({
    page,
  }) => {
    // Mock credential types API WITHOUT pattern fields (toggle off)
    // Register mock BEFORE navigation so it intercepts the initial fetch
    await page.route('**/api/controller/v2/credential_types/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CREDENTIAL_TYPE_WITHOUT_PATTERN),
      });
    });

    await setupBefore({ path: '/execution/infrastructure/credentials/create' })({ page });

    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Test Credential');
    await page.getByTestId('credential-type').click();
    await page.getByRole('option', { name: 'Custom Cloud' }).click();

    await expect(page.getByRole('textbox', { name: 'API Endpoint' })).toBeVisible({
      timeout: 5000,
    });

    // Type any value — with no pattern, nothing should be validated
    await page.getByRole('textbox', { name: 'API Endpoint' }).fill('http://anything-goes');

    // Blur the field
    await page.getByRole('textbox', { name: 'Region' }).click();

    // No pattern error should appear
    await expect(page.getByText('API endpoint must start with https://')).not.toBeVisible({
      timeout: 2000,
    });
  });
});
