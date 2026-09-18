import { gatewayAPI } from '@ansible/playwright/commands/apiClient';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  assertInvalidInputShowsPatternDescription,
  assertValidInputNoPatternError,
  findValueFailingPattern,
  requireOptionsFieldPattern,
  waitForAwxOptionsResponse,
} from '@ansible/playwright/utils/optionsDrivenValidation';
import { Organization } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';

test.beforeEach(setupBefore({ path: '/access/teams' }));
test.afterEach(setupAfter);

/**
 * Platform team create form; same OPTIONS-driven validation plumbing as AWX forms,
 * fetched via gatewayAPI against the gateway teams endpoint.
 */
test.describe('Platform team OPTIONS-driven validation (create form)', () => {
  test(
    'shows OPTIONS-driven validation error on blur for name field',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const nameField = await requireOptionsFieldPattern(
        page,
        '/teams/',
        'name',
        testInfo,
        gatewayAPI
      );

      const optionsResponse = waitForAwxOptionsResponse(page, '/teams/');
      await navigateTo(page, 'Access Management', 'Teams');
      await page.getByText('Create team', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create team' })).toBeVisible();
      await optionsResponse;

      const nameInput = page.getByPlaceholder('Enter team name');
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
        '/teams/',
        'name',
        testInfo,
        gatewayAPI
      );

      await navigateTo(page, 'Access Management', 'Teams');
      await page.getByText('Create team', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create team' })).toBeVisible();

      const nameInput = page.getByPlaceholder('Enter team name');
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
    'server rejects submit with invalid pattern and returns 400',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }, testInfo) => {
      const descriptionField = await requireOptionsFieldPattern(
        page,
        '/teams/',
        'description',
        testInfo,
        gatewayAPI
      );
      const invalidValue = findValueFailingPattern(
        descriptionField.pattern!,
        descriptionField.flags
      );
      testInfo.skip(
        !invalidValue,
        'Could not derive a sample value that fails the OPTIONS pattern'
      );

      const organization = await Organization.api.create(page);

      try {
        await navigateTo(page, 'Access Management', 'Teams');
        await page.getByText('Create team', { exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Create team' })).toBeVisible();

        // Enter team name
        const teamName = createE2EName('team');
        await page.getByLabel('Name').fill(teamName);

        // Select organization
        await singleSelectByLabel('Organization', organization.name, page);

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
            response.url().includes('/teams/') &&
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const responseBody = (await response.json()) as Record<string, unknown>;

          // Extract error message from description field
          let serverError: string | undefined;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const descriptionError = responseBody.description;
          if (typeof descriptionError === 'string') {
            serverError = descriptionError;
          } else if (Array.isArray(descriptionError) && descriptionError.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const firstError = descriptionError[0];
            if (typeof firstError === 'string') {
              serverError = firstError;
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
      } finally {
        await Organization.api.delete(page, organization.id).catch(() => {});
      }
    }
  );
});
