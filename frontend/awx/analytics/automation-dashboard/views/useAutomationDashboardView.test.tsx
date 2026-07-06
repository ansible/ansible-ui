/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';
import { QUERY_PARAMS, useAutomationDashboardView } from './useAutomationDashboardView';
import { useAutomationDashboardBaseView } from '../common/useAutomationDashboardBaseView';
import type { IAutomationDashboardBaseView } from '../common/useAutomationDashboardBaseView';

// ─── Hoisted mocks (run before vi.mock factories) ─────────────────────────────

const { mockSetFilterState, mockBaseViewRefresh, mockRefreshDetails, mockExportCsvBase } =
  vi.hoisted(() => ({
    mockSetFilterState: vi.fn(),
    mockBaseViewRefresh: vi.fn(),
    mockRefreshDetails: vi.fn(),
    mockExportCsvBase: vi.fn(),
  }));

// ─── Dependency mocks ─────────────────────────────────────────────────────────

// Calculate default dates to match the source code's DEFAULT_FILTERS
const DEFAULT_END_DATE = new Date(Date.now());
const DEFAULT_START_DATE = new Date(DEFAULT_END_DATE.getTime() - 7 * 24 * 60 * 60 * 1000);

vi.mock('../common/useAutomationDashboardBaseView', () => ({
  useAutomationDashboardBaseView: vi.fn(() => ({
    page: 1,
    setPage: vi.fn(),
    perPage: 10,
    setPerPage: vi.fn(),
    sort: 'template_name',
    setSort: vi.fn(),
    sortDirection: 'asc',
    setSortDirection: vi.fn(),
    filterState: {
      period: [
        AutomationDashboardDateRangeFilterPresets.last_7_days,
        DEFAULT_START_DATE.toISOString().split('T')[0],
        DEFAULT_END_DATE.toISOString().split('T')[0],
      ],
    },
    setFilterState: mockSetFilterState,
    clearAllFilters: vi.fn(),
    itemCount: 0,
    pageItems: [],
    refresh: mockBaseViewRefresh,
    limitFiltersToOneOrOperation: true,
    updateItem: vi.fn(),
  })),
}));

vi.mock('./useGetReportDetails', () => ({
  useGetReportDetails: vi.fn(() => ({
    reportDetails: undefined,
    refreshDetails: mockRefreshDetails,
    isLoading: false,
    error: undefined,
  })),
}));

vi.mock('./useSubscriptionCostState', () => ({
  useSubscriptionCostState: vi.fn(() => ({
    costState: undefined,
    setCostState: vi.fn(),
  })),
}));

vi.mock('./useExportCsv', () => ({
  useExportCsv: vi.fn(() => mockExportCsvBase),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAutomationDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBaseViewRefresh.mockResolvedValue(undefined);
    mockExportCsvBase.mockResolvedValue(undefined);
  });

  // --- QUERY_PARAMS ---

  test('should include the local timezone in QUERY_PARAMS', () => {
    expect(QUERY_PARAMS.tz).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });

  // --- Return value structure ---

  test('should return all expected properties', () => {
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));
    const view = result.current;

    expect(view.mainTableView).toBeDefined();
    expect(view.details).toBeUndefined();
    expect(view.detailsError).toBeUndefined();
    expect(view.detailsLoading).toBe(false);
    expect(view.costState).toBeUndefined();
    expect(view.loading).toBe(false);
    expect(view.refresh).toBeTypeOf('function');
    expect(view.setCostState).toBeTypeOf('function');
    expect(view.isFilterStateDefault).toBe(true);
    expect(view.registerClearCallback).toBeTypeOf('function');
  });

  // --- clearAllFilters override ---

  test('should override clearAllFilters to retain only the period filter', () => {
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));
    act(() => {
      result.current.mainTableView.clearAllFilters();
    });
    // Note: clearAllFilters only resets to the preset, not including dates
    // The dates are calculated in DEFAULT_FILTERS on module load
    expect(mockSetFilterState).toHaveBeenCalledWith({
      period: [AutomationDashboardDateRangeFilterPresets.last_7_days],
    });
  });

  // --- isFilterStateDefault ---

  test('should return true for isFilterStateDefault when filter state is default', () => {
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));
    expect(result.current.isFilterStateDefault).toBe(true);
  });

  test('should return true for isFilterStateDefault when filter state is undefined', () => {
    vi.mocked(useAutomationDashboardBaseView).mockReturnValueOnce({
      page: 1,
      setPage: vi.fn(),
      perPage: 10,
      setPerPage: vi.fn(),
      sort: 'template_name',
      setSort: vi.fn(),
      sortDirection: 'asc',
      setSortDirection: vi.fn(),
      filterState: undefined,
      setFilterState: mockSetFilterState,
      clearAllFilters: vi.fn(),
      itemCount: 0,
      pageItems: [],
      refresh: mockBaseViewRefresh,
      limitFiltersToOneOrOperation: true,
      updateItem: vi.fn(),
      error: undefined,
    } as unknown as IAutomationDashboardBaseView<{ id: number }>);

    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

    expect(result.current.isFilterStateDefault).toBe(true);
  });

  // --- registerClearCallback ---

  test('should call registered callback when clearAllFilters is invoked', () => {
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));
    const mockCallback = vi.fn();

    act(() => {
      result.current.registerClearCallback(mockCallback);
    });

    act(() => {
      result.current.mainTableView.clearAllFilters();
    });

    expect(mockCallback).toHaveBeenCalled();
    expect(mockSetFilterState).toHaveBeenCalledWith({
      period: [AutomationDashboardDateRangeFilterPresets.last_7_days],
    });
  });

  // --- refresh ---

  test('should call refreshDetails and mainTableView.refresh and set loading on refresh', async () => {
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRefreshDetails).toHaveBeenCalled();
    expect(mockBaseViewRefresh).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  test('should set loading to false after refresh even when mainTableView.refresh throws', async () => {
    mockBaseViewRefresh.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

    await act(async () => {
      try {
        await result.current.refresh();
      } catch {
        // expected
      }
    });

    expect(result.current.loading).toBe(false);
  });

  // --- exportCsv ---

  test('should call exportCsvBase with reportType and manage loading on exportCsv', async () => {
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

    await act(async () => {
      await result.current.exportCsv('summary');
    });

    expect(mockExportCsvBase).toHaveBeenCalledWith('summary');
    expect(result.current.loading).toBe(false);
  });

  test('should set loading to false after exportCsv even when exportCsvBase throws', async () => {
    mockExportCsvBase.mockRejectedValue(new Error('CSV error'));
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

    await act(async () => {
      try {
        await result.current.exportCsv('summary');
      } catch {
        // expected
      }
    });

    expect(result.current.loading).toBe(false);
  });
});
