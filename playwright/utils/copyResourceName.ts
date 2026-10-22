import { expect, type Page, type Response } from '@playwright/test';

/**
 * Copy/duplicate naming for E2E assertions. Keep in sync with
 * `frontend/common/utils/copyResourceName.ts` (no cross-package import).
 */

/** Current ` @ HH-MM-SS` suffix, or the legacy ` @ HH:MM:SS` suffix. */
const COPY_NAME_SUFFIX_RE = / @ (?:[01]\d|2[0-3])[-:][0-5]\d[-:][0-5]\d$/;

/** New hyphenated timestamp suffix (no colons — CleanTextMixin Tier 1 safe). */
const HYPHENATED_COPY_NAME_SUFFIX_RE = / @ (?:[01]\d|2[0-3])-[0-5]\d-[0-5]\d$/;

export function getCopySourceName(name: string): string {
  return name.replace(COPY_NAME_SUFFIX_RE, '');
}

export function hasHyphenatedCopyNamePattern(name: string): boolean {
  return HYPHENATED_COPY_NAME_SUFFIX_RE.test(name);
}

/**
 * Asserts the UI submitted and API returned a hyphenated copy name for `sourceName`.
 */
export function assertCopyResourceName(sourceName: string, copiedName: string): void {
  expect(getCopySourceName(copiedName)).toBe(sourceName);
  expect(hasHyphenatedCopyNamePattern(copiedName)).toBe(true);
  expect(copiedName).not.toContain(':');
}

/**
 * Validates copy response status and hyphenated naming; returns the copied name.
 */
export async function assertCopyApiResponse(
  sourceName: string,
  response: Response
): Promise<string> {
  expect(response.status()).toBe(201);

  const data = (await response.json()) as { name: string };
  assertCopyResourceName(sourceName, data.name);

  return data.name;
}

export type WaitForResourceCopyOptions = {
  /** Narrow the copy endpoint (e.g. `'/credentials/'`, `'/job_templates/'`). */
  urlIncludes?: string;
};

/**
 * Waits for any `/copy/` response, then asserts 201 and hyphenated naming.
 * Unlike filtering on status 201 in `waitForResponse`, non-201 responses fail fast
 * instead of hanging until the test timeout (e.g. when copy name validation rejects `:`).
 */
export async function waitForResourceCopyResponse(
  page: Page,
  sourceName: string,
  options: WaitForResourceCopyOptions = {}
): Promise<string> {
  const { urlIncludes } = options;
  const response = await page.waitForResponse((candidate) => {
    if (!candidate.url().includes('/copy/')) {
      return false;
    }
    if (urlIncludes && !candidate.url().includes(urlIncludes)) {
      return false;
    }
    return true;
  });
  return assertCopyApiResponse(sourceName, response);
}
