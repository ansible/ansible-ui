import type { PageAsyncSelectQueryResult } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import type { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { vi } from 'vitest';
import type { AutomationDashboardAsyncQueryOptions } from '../common/useAutomationDashboardAsyncOptions';

/** Page size of the fake API, as in the dashboard filters. */
export const TEST_PAGE_SIZE = 10;

/** Label of the options matched by `TEST_SEARCH`. */
export const TEST_MATCH_LABEL = 'Test job';
export const TEST_SEARCH = 'Test';

/** Values of the options labelled `TEST_MATCH_LABEL <value>`. */
export const TEST_MATCH_VALUES = ['3', '7', '12'];

/**
 * 14 options (two pages) with values '1'–'14'. Values 3, 7 and 12 are labelled
 * "Test job <value>", the others "Option <value>" (zero padded, so the label order is the value
 * order).
 */
export const testOptions: PageSelectOption<string>[] = Array.from({ length: 14 }, (_, index) => {
  const value = String(index + 1);
  const label = TEST_MATCH_VALUES.includes(value)
    ? `${TEST_MATCH_LABEL} ${value}`
    : `Option ${value.padStart(2, '0')}`;
  return { label, value };
});

export const allTestValues = testOptions.map((option) => option.value);

/** Values in numeric order, for comparing selections regardless of the selection order. */
export function sortValues(values: string[] | undefined) {
  return [...(values ?? [])].sort((a, b) => Number(a) - Number(b));
}

/**
 * A fake paged `queryOptions` over `testOptions`: filters by label (case-sensitive), pages by
 * `pageSize` (`TEST_PAGE_SIZE` by default) and resolves after `delay` ms. The mock records every
 * query.
 */
export function createTestQueryOptions(delay = 0) {
  return vi.fn(
    async ({
      next,
      search,
      pageSize = TEST_PAGE_SIZE,
    }: AutomationDashboardAsyncQueryOptions): Promise<PageAsyncSelectQueryResult<string>> => {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      const matching = testOptions.filter((option) => !search || option.label.includes(search));
      const page = Number(next ?? 1);
      const end = page * pageSize;
      return {
        options: matching.slice(end - pageSize, end),
        remaining: Math.max(0, matching.length - end),
        next: page + 1,
      };
    }
  );
}
