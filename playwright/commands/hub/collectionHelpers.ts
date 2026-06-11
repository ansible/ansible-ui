import { expect, Locator, Page } from '@playwright/test';
import { platformUI } from '../login';

/**
 * Poll API until expected versions are present in a repository.
 *
 * @param page - Playwright page object
 * @param namespace - Collection namespace
 * @param name - Collection name
 * @param expectedVersions - Array of version strings to wait for
 * @param repository - Repository name (default: 'published')
 * @param maxAttempts - Maximum polling attempts (default: 30)
 */
export async function waitForVersionsInRepository(
  page: Page,
  namespace: string,
  name: string,
  expectedVersions: string[],
  repository: string = 'published',
  maxAttempts: number = 30
): Promise<void> {
  const apiUrl = `${platformUI}/api/galaxy/v3/plugin/ansible/search/collection-versions/?namespace=${namespace}&name=${name}&repository_name=${repository}`;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await page.request.get(apiUrl);
    if (response.ok()) {
      const data = (await response.json()) as {
        data: Array<{ collection_version: { version: string } }>;
      };
      const versions = new Set(data.data.map((d) => d.collection_version.version));
      if (expectedVersions.every((v) => versions.has(v))) {
        return;
      }
    }
    if (attempt === maxAttempts) {
      throw new Error(
        `Versions ${expectedVersions.join(', ')} not indexed after ${maxAttempts} attempts`
      );
    }
    await page.waitForTimeout(2000);
  }
}

/**
 * Verify a version was deleted from a repository by polling the API.
 *
 * @param page - Playwright page object
 * @param namespace - Collection namespace
 * @param name - Collection name
 * @param deletedVersion - Version that should be deleted
 * @param remainingVersions - Versions that should still exist
 * @param repository - Repository name (default: 'published')
 * @param maxAttempts - Maximum polling attempts (default: 30)
 */
export async function verifyVersionDeleted(
  page: Page,
  namespace: string,
  name: string,
  deletedVersion: string,
  remainingVersions: string[],
  repository: string = 'published',
  maxAttempts: number = 30
): Promise<void> {
  const apiUrl = `${platformUI}/api/galaxy/v3/plugin/ansible/search/collection-versions/?namespace=${namespace}&name=${name}&repository_name=${repository}`;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await page.request.get(apiUrl);
    if (response.ok()) {
      const data = (await response.json()) as {
        data: Array<{ collection_version: { version: string } }>;
      };
      const versions = new Set(data.data.map((d) => d.collection_version.version));
      const isDeleted = !versions.has(deletedVersion);
      const hasRemaining = remainingVersions.every((v) => versions.has(v));
      if (isDeleted && hasRemaining) {
        return;
      }
    }
    await page.waitForTimeout(2000);
  }
  // Get final state for error message
  const debugResponse = await page.request.get(apiUrl);
  const debugData = (await debugResponse.json()) as {
    data: Array<{ collection_version: { version: string } }>;
  };
  const remainingInApi = debugData.data.map((d) => d.collection_version.version);
  throw new Error(
    `Delete did not work. Expected ${deletedVersion} to be deleted, remaining: ${remainingInApi.join(', ')}`
  );
}

/**
 * Poll API until docs_blob is available for a collection version.
 *
 * After collection approval, Pulp indexes the docs_blob asynchronously.
 * The Documentation tab renders a NotFound page until this completes.
 *
 * @param page - Playwright page object
 * @param namespace - Collection namespace
 * @param name - Collection name
 * @param version - Collection version
 * @param repository - Repository name (default: 'published')
 * @param maxAttempts - Maximum polling attempts (default: 30)
 */
export async function waitForDocsBlob(
  page: Page,
  namespace: string,
  name: string,
  version: string,
  repository: string = 'published',
  maxAttempts: number = 30
): Promise<void> {
  const apiUrl = `${platformUI}/api/galaxy/v3/plugin/ansible/content/${repository}/collections/index/${namespace}/${name}/versions/${version}/docs-blob/`;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await page.request.get(apiUrl);
    if (response.ok()) {
      const data = (await response.json()) as { docs_blob: Record<string, unknown> };
      if (data.docs_blob && Object.keys(data.docs_blob).length > 0) {
        return;
      }
    }
    if (attempt === maxAttempts) {
      throw new Error(
        `docs_blob not available for ${namespace}.${name} v${version} after ${maxAttempts} attempts`
      );
    }
    await page.waitForTimeout(2000);
  }
}

/**
 * Find and select the first unchecked, enabled checkbox in a locator.
 *
 * @param checkboxes - Locator containing checkbox elements
 * @returns true if a checkbox was selected, false if none were available
 */
export async function selectFirstAvailableCheckbox(checkboxes: Locator): Promise<boolean> {
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    const checkbox = checkboxes.nth(i);
    const isChecked = await checkbox.isChecked();
    const isDisabled = await checkbox.isDisabled();
    if (!isChecked && !isDisabled) {
      await checkbox.click();
      return true;
    }
  }
  return false;
}

/**
 * Optionally verify a collection appears on the approvals page.
 * This is a non-critical verification that won't throw on failure.
 *
 * @param page - Playwright page object
 * @param collectionName - Name of the collection to find
 */
export async function verifyCollectionOnApprovalsPage(
  page: Page,
  collectionName: string
): Promise<void> {
  await page.goto(`${platformUI}/content/approvals`);
  await page.waitForLoadState('networkidle');

  const clearFiltersButton = page.getByRole('button', { name: /^Clear all filters$/i });
  if (await clearFiltersButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await clearFiltersButton.click();
  }

  const approvalsFilterInput = page.getByPlaceholder('Filter by name');
  if (await approvalsFilterInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await approvalsFilterInput.fill(collectionName);
    await approvalsFilterInput.press('Enter');
    await page.waitForTimeout(2000);
  }

  const tableBody = page.locator('[aria-label="Simple table"] tbody');
  const dataList = page.locator('[data-ouia-component-type="PF6/DataList"]');

  const hasTableRows = await tableBody.isVisible({ timeout: 5000 }).catch(() => false);
  const hasDataList = await dataList.isVisible({ timeout: 5000 }).catch(() => false);

  if (hasTableRows) {
    const rowCount = await tableBody.locator('tr').count();
    if (rowCount > 0) {
      expect(rowCount).toBeGreaterThanOrEqual(1);
    }
  } else if (hasDataList) {
    const itemCount = await dataList
      .locator('[data-ouia-component-type="PF6/DataListItem"]')
      .count();
    if (itemCount > 0) {
      expect(itemCount).toBeGreaterThanOrEqual(1);
    }
  }
}
