import { expect, test } from '@playwright/test';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Signature Keys', () => {
  test(
    'should display name and public key in the list page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/galaxy/pulp/api/v3/signing-services/') &&
          response.status() === 200
      );

      await navigateTo(page, 'Automation Content', 'Signature Keys');
      await expect(page.getByTestId('page-title')).toHaveText('Signature Keys');

      const response = await responsePromise;
      const responseData = (await response.json()) as {
        results: Array<{ public_key: string; name: string }>;
      };

      // Skip test if no signature keys exist in the environment.
      // TODO: Remove this skip once CI environment includes seeded signature keys.
      // Infrastructure team should configure at least one signing service during
      // AAP installation. See AAP documentation for signing service setup.
      if (responseData.results.length === 0) {
        test.skip();
        return;
      }

      const firstResult = responseData.results[0];

      // Verify public key is displayed
      const publicKeyCell = page.getByTestId('public-key-column-cell').first();
      await expect(publicKeyCell).toBeVisible();
      await expect(publicKeyCell.locator('.pf-v6-c-truncate__start')).toContainText(
        firstResult.public_key
      );

      // Verify name is displayed
      const nameCell = page.getByTestId('name-column-cell').first();
      await expect(nameCell).toBeVisible();
      await expect(nameCell).toContainText(firstResult.name);
    }
  );

  test('should display fingerprint in the list page', { tag: ['@not_mock'] }, async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/galaxy/pulp/api/v3/signing-services/') &&
        response.status() === 200
    );

    await navigateTo(page, 'Automation Content', 'Signature Keys');
    await expect(page.getByTestId('page-title')).toHaveText('Signature Keys');

    const response = await responsePromise;
    const responseData = (await response.json()) as {
      results: Array<{ pubkey_fingerprint: string }>;
    };

    // Skip test if no signature keys exist in the environment.
    // TODO: Remove this skip once CI environment includes seeded signature keys.
    // Infrastructure team should configure at least one signing service during
    // AAP installation. See AAP documentation for signing service setup.
    if (responseData.results.length === 0) {
      test.skip();
      return;
    }

    const firstResult = responseData.results[0];

    // Verify fingerprint is displayed
    const fingerprintCell = page.getByTestId('fingerprint-column-cell').first();
    await expect(fingerprintCell).toBeVisible();
    await expect(fingerprintCell.locator('.pf-v6-c-truncate__start')).toContainText(
      firstResult.pubkey_fingerprint
    );
  });

  test('should contain correct table headers', { tag: ['@not_mock'] }, async ({ page }) => {
    await navigateTo(page, 'Automation Content', 'Signature Keys');
    await expect(page.getByTestId('page-title')).toHaveText('Signature Keys');

    // Wait for API response to ensure table is loaded
    const response = await page.waitForResponse(
      (response) =>
        response.url().includes('/api/galaxy/pulp/api/v3/signing-services/') &&
        response.status() === 200
    );

    const responseData = (await response.json()) as { results: Array<unknown> };

    // Skip test if no signature keys exist (empty state shown instead of table).
    // TODO: Remove this skip once CI environment includes seeded signature keys.
    // Infrastructure team should configure at least one signing service during
    // AAP installation. See AAP documentation for signing service setup.
    if (responseData.results.length === 0) {
      test.skip();
      return;
    }

    // Verify all table headers are present
    await expect(page.getByTestId('name-column-header')).toBeVisible();
    await expect(page.getByTestId('fingerprint-column-header')).toBeVisible();
    await expect(page.getByTestId('public-key-column-header')).toBeVisible();
    await expect(page.getByTestId('created-column-header')).toBeVisible();
  });

  test(
    'should contain table with row that contains two CopyCells and download button',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Content', 'Signature Keys');
      await expect(page.getByTestId('page-title')).toHaveText('Signature Keys');

      // Wait for API response to ensure table is loaded
      const response = await page.waitForResponse(
        (response) =>
          response.url().includes('/api/galaxy/pulp/api/v3/signing-services/') &&
          response.status() === 200
      );

      const responseData = (await response.json()) as { results: Array<unknown> };

      // Skip test if no signature keys exist in the environment.
      // TODO: Remove this skip once CI environment includes seeded signature keys.
      // Infrastructure team should configure at least one signing service during
      // AAP installation. See AAP documentation for signing service setup.
      if (responseData.results.length === 0) {
        test.skip();
        return;
      }

      // Verify first row contains expected elements
      const firstRow = page.getByTestId('row-0');
      await expect(firstRow).toBeVisible();

      await expect(firstRow.getByTestId('fingerprint-column-cell')).toBeVisible();
      await expect(firstRow.getByTestId('public-key-column-cell')).toBeVisible();
      await expect(firstRow.getByTestId('download-key')).toBeVisible();
    }
  );
});
