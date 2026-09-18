import { hubAPI } from '@ansible/playwright/commands/apiClient';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  assertInvalidInputShowsPatternDescription,
  assertValidInputNoPatternError,
  findValueFailingPattern,
  requireOptionsFieldPattern,
  waitForAwxOptionsResponse,
} from '@ansible/playwright/utils/optionsDrivenValidation';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/content/namespaces' }));
test.afterEach(setupAfter);

/**
 * Hub namespace create form; same OPTIONS-driven validation plumbing as AWX forms,
 * fetched via hubAPI against the galaxy namespaces endpoint.
 */
test.describe('Hub namespace OPTIONS-driven validation (create form)', () => {
  test(
    'shows OPTIONS-driven validation error on blur for name field',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireOptionsFieldPattern(
        page,
        '/_ui/v1/namespaces/',
        'name',
        testInfo,
        hubAPI
      );

      const optionsResponse = waitForAwxOptionsResponse(page, '/_ui/v1/namespaces/');
      await navigateTo(page, 'Automation Content', 'Namespaces');
      await page.getByText('Create namespace', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create namespace' })).toBeVisible();
      await optionsResponse;

      const nameInput = page.getByPlaceholder('Enter namespace name');
      await assertInvalidInputShowsPatternDescription(page, testInfo, nameField, {
        fill: async (value) => {
          await nameInput.fill(value);
        },
        blur: async () => {
          await nameInput.blur();
        },
      });
    }
  );

  test(
    'accepts valid input without validation error on blur',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireOptionsFieldPattern(
        page,
        '/_ui/v1/namespaces/',
        'name',
        testInfo,
        hubAPI
      );

      await navigateTo(page, 'Automation Content', 'Namespaces');
      await page.getByText('Create namespace', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create namespace' })).toBeVisible();

      const nameInput = page.getByPlaceholder('Enter namespace name');
      await assertValidInputNoPatternError(page, testInfo, nameField, {
        fill: async (value) => {
          await nameInput.fill(value);
        },
        blur: async () => {
          await nameInput.blur();
        },
      });
    }
  );

  test(
    'shows validation error when submitting with invalid pattern',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const descriptionField = await requireOptionsFieldPattern(
        page,
        '/_ui/v1/namespaces/',
        'description',
        testInfo,
        hubAPI
      );
      const invalidValue = findValueFailingPattern(
        descriptionField.pattern!,
        descriptionField.flags
      );
      testInfo.skip(
        !invalidValue,
        'Could not derive a sample value that fails the OPTIONS pattern'
      );

      await navigateTo(page, 'Automation Content', 'Namespaces');
      await page.getByText('Create namespace', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create namespace' })).toBeVisible();

      const nameInput = page.getByPlaceholder('Enter namespace name');
      await nameInput.fill(createE2EName('namespace').toLowerCase().replace(/\s+/g, '_'));

      // Fill description with invalid value
      // OPTIONS pattern only matches literal <tag> syntax; it can't detect HTML-entity-encoded
      // markup like &lt;script&gt;, which the server decodes before validating.
      await page
        .getByPlaceholder('Enter description')
        .fill(`&lt;script&gt;alert(1)&lt;/script&gt;`);

      // Set up listener BEFORE submitting to avoid race condition
      const postResponsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          response.url().includes('/_ui/v1/namespaces/') &&
          (response.status() === 400 || response.status() === 201)
      );

      // Submit form via JavaScript to bypass client-side validation
      // (button may be disabled due to form validation errors)
      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      });

      const response = await postResponsePromise;

      if (response.status() === 400) {
        // Get the error message from server response and verify it appears on UI
        // Hub API returns errors in format: { errors: [{ detail: "message" }] }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const responseBody = (await response.json()) as Record<string, unknown>;

        // Extract error message from errors array (Hub API format)
        let serverError: string | undefined;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        const errors = responseBody.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          const errorDetail = errors[0]?.detail;
          if (typeof errorDetail === 'string') {
            serverError = errorDetail;
          }
        }

        // Verify the error message appears on UI
        if (serverError) {
          // Look for the error message anywhere on the page
          await expect(page.getByText(serverError, { exact: false })).toBeVisible();
        } else {
          // Fallback: verify error element is visible on the description field
          const descriptionInput = page.getByPlaceholder('Enter description');
          const fieldContainer = descriptionInput.locator('..');
          await expect(
            fieldContainer.locator('[role="alert"], [class*="error"], [class*="invalid"]')
          ).toBeVisible();
        }
      } else if (response.status() === 201) {
        // Unexpected success - the server should have rejected the invalid value
        const responseBody = (await response.json()) as Record<string, unknown>;
        throw new Error(
          `Expected 400 validation error but got 201: ${JSON.stringify(responseBody)}`
        );
      } else {
        throw new Error(`Unexpected response status: ${response.status()}`);
      }
    }
  );
});
