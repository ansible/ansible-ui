import { expect, type Page, type TestInfo } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';
import { navigateTo } from '../commands/navigateTo';

/** Minimal OPTIONS shape used by Playwright validation helpers (no UI framework import). */
export type FieldMetadata = {
  pattern?: string;
  pattern_description?: string;
  flags?: string;
};

export type PageFormOptionsData = {
  actions?: {
    POST?: Record<string, unknown>;
    PUT?: Record<string, unknown>;
    PATCH?: Record<string, unknown>;
    GET?: Record<string, unknown>;
  };
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Sample strings that typically satisfy Tier 1 / Tier 2 CleanText frontend patterns. */
const VALID_PATTERN_CANDIDATES = [
  'inventory_e2e_valid',
  'Valid-Resource-01',
  'my_resource_name',
  'E2E_test_resource',
];

/** Sample strings that typically fail Tier 1 / Tier 2 CleanText frontend patterns. */
const INVALID_PATTERN_CANDIDATES = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  'javascript:alert(1)',
  '{{ ansible_managed }}',
  '\u0000',
];

/**
 * Returns a value that does not satisfy the given OPTIONS regex, or undefined if none found.
 */
export function findValueFailingPattern(pattern: string, flags?: string): string | undefined {
  try {
    const re = new RegExp(pattern, flags ?? 'i');
    return INVALID_PATTERN_CANDIDATES.find((candidate) => !re.test(candidate));
  } catch {
    return undefined;
  }
}

export function findValuePassingPattern(pattern: string, flags?: string): string | undefined {
  try {
    const re = new RegExp(pattern, flags ?? 'i');
    return VALID_PATTERN_CANDIDATES.find((candidate) => re.test(candidate));
  } catch {
    return undefined;
  }
}

/** Wait for a successful OPTIONS response whose URL contains ``pathFragment``. */
export function waitForAwxOptionsResponse(page: Page, pathFragment: string) {
  return page.waitForResponse(
    (response) =>
      response.request().method() === 'OPTIONS' &&
      response.url().includes(pathFragment) &&
      response.ok()
  );
}

export function readOptionsFieldMetadata(field: unknown): FieldMetadata | undefined {
  if (!isRecord(field)) {
    return undefined;
  }
  const pattern = typeof field.pattern === 'string' ? field.pattern : undefined;
  let patternDescription: string | undefined;
  if (typeof field.pattern_description === 'string') {
    patternDescription = field.pattern_description;
  } else if (typeof field.patternDescription === 'string') {
    patternDescription = field.patternDescription;
  }
  const flags = typeof field.flags === 'string' ? field.flags : undefined;
  if (!pattern && !patternDescription) {
    return undefined;
  }
  return { pattern, pattern_description: patternDescription, flags };
}

/**
 * Prefer write actions (POST/PUT/PATCH); fall back to GET for endpoints such as
 * ``create_approval_template`` that advertise writable patterns under GET.
 */
export function getOptionsFieldMetadata(
  optionsData: PageFormOptionsData | undefined,
  fieldName: string
): FieldMetadata | undefined {
  const actions = optionsData?.actions;
  if (!actions) {
    return undefined;
  }
  for (const method of ['POST', 'PUT', 'PATCH', 'GET'] as const) {
    const action = (actions as Record<string, Record<string, unknown> | undefined>)[method];
    const metadata = readOptionsFieldMetadata(action?.[fieldName]);
    if (metadata?.pattern) {
      return metadata;
    }
  }
  return undefined;
}

export async function fetchAwxOptions(page: Page, path: string): Promise<PageFormOptionsData> {
  const response = await awxAPI.options<PageFormOptionsData>(page, path);
  return response ?? {};
}

/**
 * Fetch OPTIONS for ``path`` and skip when ``fieldName`` has no ``pattern`` /
 * ``pattern_description`` (enhanced validation off or backend without injection).
 */
export async function requireOptionsFieldPattern(
  page: Page,
  path: string,
  fieldName: string,
  testInfo: TestInfo
): Promise<FieldMetadata> {
  const options = await fetchAwxOptions(page, path);
  const field = getOptionsFieldMetadata(options, fieldName);

  if (!field?.pattern || !field.pattern_description) {
    testInfo.skip(true, `OPTIONS ${path} does not advertise pattern metadata for "${fieldName}"`);
  }

  return field!;
}

/**
 * Locator for OPTIONS ``pattern_description`` helper text. Avoid ``exact: true`` — PatternFly
 * splits visible copy from the “: error status;” screen-reader suffix across nodes.
 */
export function locatorForPatternDescription(page: Page, patternDescription: string) {
  const snippet = patternDescription.trim().slice(0, 64);
  return page.getByText(snippet, { exact: false });
}

export async function expectPatternDescriptionVisible(
  page: Page,
  patternDescription: string
): Promise<void> {
  await expect(locatorForPatternDescription(page, patternDescription)).toBeVisible();
}

export async function expectPatternDescriptionHidden(
  page: Page,
  patternDescription: string
): Promise<void> {
  await expect(locatorForPatternDescription(page, patternDescription)).not.toBeVisible();
}

/**
 * Fill a text control with a value that fails the OPTIONS pattern and assert
 * ``pattern_description`` is shown after blur.
 */
export async function assertInvalidInputShowsPatternDescription(
  page: Page,
  testInfo: TestInfo,
  field: FieldMetadata,
  input: { fill: (value: string) => Promise<void>; blur: () => Promise<void> }
): Promise<void> {
  const invalidValue = findValueFailingPattern(field.pattern!, field.flags);
  testInfo.skip(!invalidValue, 'Could not derive a sample value that fails the OPTIONS pattern');

  await input.fill(invalidValue!);
  await input.blur();
  await expectPatternDescriptionVisible(page, field.pattern_description!);
}

export async function assertValidInputNoPatternError(
  page: Page,
  testInfo: TestInfo,
  field: FieldMetadata,
  input: { fill: (value: string) => Promise<void>; blur: () => Promise<void> }
): Promise<void> {
  const validValue = findValuePassingPattern(field.pattern!, field.flags);
  testInfo.skip(!validValue, 'Could not derive a sample value that satisfies the OPTIONS pattern');

  await input.fill(validValue!);
  await input.blur();
  await expectPatternDescriptionHidden(page, field.pattern_description!);
}

/**
 * Open the inventory create form. Call ``waitForAwxOptionsResponse(page, '/inventories/')``
 * before this helper when the test must observe the OPTIONS request.
 */
export async function openInventoryCreateForm(page: Page): Promise<void> {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await page.getByLabel('dropdown toggle', { exact: true }).click();
  await page.getByRole('menuitem', { name: 'Create inventory' }).click();
  await expect(page.getByRole('heading', { name: 'Create inventory' })).toBeVisible();
}
