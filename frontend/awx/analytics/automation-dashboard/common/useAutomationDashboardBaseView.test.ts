/* eslint-disable i18next/no-literal-string */
import {
  act,
  renderHook as rtlRenderHook,
  waitFor,
  type RenderHookOptions,
  type RenderHookResult,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createElement, type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import {
  IToolbarDateRangeFilter,
  IToolbarSingleSelectFilter,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { useAutomationDashboardBaseView } from './useAutomationDashboardBaseView';

function SwrWrapper({ children }: Readonly<{ children: ReactNode }>) {
  return createElement(
    SWRConfig,
    { value: { provider: () => new Map(), shouldRetryOnError: false } },
    children
  );
}

function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  options?: RenderHookOptions<Props>
): RenderHookResult<Result, Props> {
  return rtlRenderHook(render, { ...options, wrapper: SwrWrapper });
}
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';

// ─── Test Data ────────────────────────────────────────────────────────────────

interface TestItem {
  id: number;
  name: string;
}

const mockItems: TestItem[] = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
];

const mockResponse: AwxItemsResponse<TestItem> = {
  count: 3,
  results: mockItems,
};

// ─── MSW Server ───────────────────────────────────────────────────────────────

const server = setupServer(http.get(metricsAPI`/test/`, () => HttpResponse.json(mockResponse)));

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAutomationDashboardBaseView', () => {
  // --- Default behavior ---

  test('should return view with default values', async () => {
    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    expect(result.current.sort).toBe('template_name');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.page).toBe(1);
    expect(result.current.perPage).toBe(10);
    expect(result.current.limitFiltersToOneOrOperation).toBe(true);
  });

  test('should fetch and return items', async () => {
    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    expect(result.current.pageItems).toHaveLength(3);
    expect(result.current.itemCount).toBe(3);
    expect(result.current.pageItems).toEqual(mockItems);
  });

  // --- Default filters ---

  test('should apply default filters on initialization', async () => {
    const defaultFilters = { period: ['last_7_days'] };
    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
        defaultFilters,
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    expect(result.current.filterState).toEqual(defaultFilters);
  });

  // --- Required filters validation ---

  test('should not fetch when required filter is missing', async () => {
    const requiredFilter = {
      type: ToolbarFilterType.SingleSelect,
      key: 'status',
      label: 'Status',
      query: 'status',
      options: [{ label: 'Active', value: 'active' }],
      placeholder: 'Filter by status',
      isRequired: true,
    };

    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
        toolbarFilters: [requiredFilter] as IToolbarSingleSelectFilter[],
      })
    );

    // Wait a bit to ensure no fetch happens
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.pageItems).toBeUndefined();
    expect(result.current.itemCount).toBeUndefined();
  });

  test('should fetch when required filter has value', async () => {
    const requiredFilter = {
      type: ToolbarFilterType.SingleSelect,
      key: 'status',
      label: 'Status',
      query: 'status',
      options: [{ label: 'Active', value: 'active' }],
      placeholder: 'Filter by status',
      isRequired: true,
    };

    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
        toolbarFilters: [requiredFilter] as IToolbarSingleSelectFilter[],
        defaultFilters: { status: ['active'] },
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    expect(result.current.pageItems).toHaveLength(3);
  });

  test('should validate DateRange filter with custom value requires 3 values', async () => {
    const dateRangeFilter = {
      type: ToolbarFilterType.DateRange,
      key: 'period',
      label: 'Period',
      query: 'period',
      options: [
        { label: 'Last 7 days', value: 'last_7_days' },
        { label: 'Custom', value: 'custom', isCustom: true },
      ],
      placeholder: 'Filter by period',
      isRequired: true,
    };

    // With only custom value (invalid - needs dates)
    const { result: invalidResult } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
        toolbarFilters: [dateRangeFilter] as IToolbarDateRangeFilter[],
        defaultFilters: { period: ['custom'] }, // Missing start and end dates
      })
    );

    // Wait for hook to process and reset invalid filter
    await waitFor(() => {
      // Hook resets invalid required filter to first option (last_7_days)
      expect(invalidResult.current.filterState.period).toEqual(['last_7_days']);
    });
  });

  test('should fetch when DateRange filter has custom value with dates', async () => {
    const dateRangeFilter: IToolbarDateRangeFilter = {
      type: ToolbarFilterType.DateRange,
      key: 'period',
      label: 'Period',
      query: 'period',
      options: [
        { label: 'Last 7 days', value: 'last_7_days' },
        { label: 'Custom', value: 'custom', isCustom: true },
      ],
      placeholder: 'Filter by period',
      isRequired: true,
    };

    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
        toolbarFilters: [dateRangeFilter] as IToolbarDateRangeFilter[],
        defaultFilters: { period: ['custom', '2024-01-01', '2024-01-31'] },
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    expect(result.current.pageItems).toHaveLength(3);
  });

  test('should fetch when DateRange filter has custom value with only a start date', async () => {
    const dateRangeFilter: IToolbarDateRangeFilter = {
      type: ToolbarFilterType.DateRange,
      key: 'period',
      label: 'Period',
      query: 'period',
      options: [
        { label: 'Last 7 days', value: 'last_7_days' },
        { label: 'Custom', value: 'custom', isCustom: true },
      ],
      placeholder: 'Filter by period',
      isRequired: true,
    };

    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
        toolbarFilters: [dateRangeFilter] as IToolbarDateRangeFilter[],
        defaultFilters: { period: ['custom', '2024-01-01'] },
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    expect(result.current.pageItems).toHaveLength(3);
  });

  // --- Refresh functionality ---

  test('should refresh data when refresh is called', async () => {
    let callCount = 0;
    server.use(
      http.get(metricsAPI`/test/`, () => {
        callCount++;
        return HttpResponse.json({
          count: 1,
          results: [{ id: callCount, name: `Item ${callCount}` }],
        });
      })
    );

    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());
    expect(result.current.pageItems?.[0]?.id).toBe(1);

    await result.current.refresh();

    await waitFor(() => expect(result.current.pageItems?.[0]?.id).toBe(2));
    expect(callCount).toBe(2);
  });

  // --- Error handling ---

  test('should handle 404 error and reset to page 1', async () => {
    server.use(http.get(metricsAPI`/test/`, () => HttpResponse.json({}, { status: 404 })));

    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );

    await waitFor(() => {
      expect(result.current.page).toBe(1);
    });
  });

  test('should handle 400 error and reset to page 1', async () => {
    server.use(http.get(metricsAPI`/test/`, () => HttpResponse.json({}, { status: 400 })));

    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );

    await waitFor(() => {
      expect(result.current.page).toBe(1);
    });
  });

  test('should reset page to 1 and clear the error when a 404 occurs while on a page greater than 1', async () => {
    server.use(
      http.get(metricsAPI`/test/`, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page');
        if (page === '2') return HttpResponse.json({}, { status: 404 });
        return HttpResponse.json(mockResponse);
      })
    );

    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );
    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    act(() => result.current.setPage(2));

    await waitFor(() => {
      expect(result.current.page).toBe(1);
      expect(result.current.error).toBeUndefined();
    });
  });

  test('should reset page to 1 and clear the error when a 400 occurs while on a page greater than 1', async () => {
    server.use(
      http.get(metricsAPI`/test/`, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page');
        if (page === '2') return HttpResponse.json({}, { status: 400 });
        return HttpResponse.json(mockResponse);
      })
    );

    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );
    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    act(() => result.current.setPage(2));

    await waitFor(() => {
      expect(result.current.page).toBe(1);
      expect(result.current.error).toBeUndefined();
    });
  });

  test('should keep the error and stay on the same page when a 500 occurs on a page greater than 1', async () => {
    server.use(
      http.get(metricsAPI`/test/`, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page');
        if (page === '2') return HttpResponse.json({}, { status: 500 });
        return HttpResponse.json(mockResponse);
      })
    );

    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );
    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    act(() => result.current.setPage(2));

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.page).toBe(2);
  });

  // --- updateItem functionality ---

  test('should update an item in the list', async () => {
    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    const updatedItem = { id: 2, name: 'Updated Item 2' };
    result.current.updateItem(updatedItem);

    await waitFor(() => {
      const item = result.current.pageItems?.find((i) => i.id === 2);
      expect(item?.name).toBe('Updated Item 2');
    });
  });

  test('should handle updateItem without throwing errors', async () => {
    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    // Should not throw when updating with a non-existent ID
    const nonExistentItem = { id: 999, name: 'Non-existent' };
    expect(() => result.current.updateItem(nonExistentItem)).not.toThrow();

    // Should not throw when items is undefined (by calling before data loads)
    const earlyResult = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test-early/`,
      })
    ).result;
    expect(() => earlyResult.current.updateItem({ id: 1, name: 'Test' })).not.toThrow();
  });

  // --- Query parameters ---

  test('should include query parameters in the request', async () => {
    let capturedUrl = '';
    server.use(
      http.get(metricsAPI`/test/`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(mockResponse);
      })
    );

    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
        queryParams: { tz: 'UTC', custom: 'value' },
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    expect(capturedUrl).toContain('tz=UTC');
    expect(capturedUrl).toContain('custom=value');
  });

  // --- View state management ---

  test('should expose view state setters', async () => {
    const { result } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());

    expect(result.current.setPage).toBeTypeOf('function');
    expect(result.current.setPerPage).toBeTypeOf('function');
    expect(result.current.setSort).toBeTypeOf('function');
    expect(result.current.setSortDirection).toBeTypeOf('function');
    expect(result.current.setFilterState).toBeTypeOf('function');
    expect(result.current.clearAllFilters).toBeTypeOf('function');
  });

  // --- Item count persistence ---

  test('should persist item count after data is undefined', async () => {
    let shouldReturnData = true;
    server.use(
      http.get(metricsAPI`/test/`, () => {
        if (shouldReturnData) {
          return HttpResponse.json(mockResponse);
        }
        return HttpResponse.json({ count: undefined, results: undefined });
      })
    );

    const { result, rerender } = renderHook(() =>
      useAutomationDashboardBaseView<TestItem>({
        url: metricsAPI`/test/`,
      })
    );

    await waitFor(() => expect(result.current.pageItems).toBeDefined());
    expect(result.current.itemCount).toBe(3);

    shouldReturnData = false;
    rerender();

    await waitFor(() => {
      // Item count should persist even when new data doesn't have count
      expect(result.current.itemCount).toBe(3);
    });
  });
});
