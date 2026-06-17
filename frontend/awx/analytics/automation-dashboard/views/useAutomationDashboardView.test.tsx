/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';
import { QUERY_PARAMS, useAutomationDashboardView } from './useAutomationDashboardView';

// ─── Hoisted mocks (run before vi.mock factories) ─────────────────────────────

const {
  mockSetFilterState,
  mockAwxViewRefresh,
  mockRefreshDetails,
  mockExportCsvBase,
  mockExportPdfBase,
} = vi.hoisted(() => ({
  mockSetFilterState: vi.fn(),
  mockAwxViewRefresh: vi.fn(),
  mockRefreshDetails: vi.fn(),
  mockExportCsvBase: vi.fn(),
  mockExportPdfBase: vi.fn(),
}));

// ─── Dependency mocks ─────────────────────────────────────────────────────────

vi.mock('../../../common/useAwxView', () => ({
  useAwxView: vi.fn(() => ({
    page: 1,
    setPage: vi.fn(),
    perPage: 10,
    setPerPage: vi.fn(),
    sort: 'template_name',
    setSort: vi.fn(),
    sortDirection: 'asc',
    setSortDirection: vi.fn(),
    filterState: { period: [AutomationDashboardDateRangeFilterPresets.last_7_days] },
    setFilterState: mockSetFilterState,
    clearAllFilters: vi.fn(),
    itemCount: 0,
    pageItems: [],
    refresh: mockAwxViewRefresh,
    selectItem: vi.fn(),
    selectItems: vi.fn(),
    unselectItem: vi.fn(),
    unselectItems: vi.fn(),
    isSelected: vi.fn(() => false),
    selectAll: vi.fn(),
    unselectAll: vi.fn(),
    allSelected: false,
    selectedItems: [],
    keyFn: vi.fn(),
    selectItemsAndRefresh: vi.fn(),
    unselectItemsAndRefresh: vi.fn(),
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

vi.mock('./useExportPdf', () => ({
  useExportPdf: vi.fn(() => mockExportPdfBase),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAutomationDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAwxViewRefresh.mockResolvedValue(undefined);
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
    expect(view.exportPdf).toBeTypeOf('function');
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
    expect(mockSetFilterState).toHaveBeenCalledWith({
      period: [AutomationDashboardDateRangeFilterPresets.last_7_days],
    });
  });

  // --- isFilterStateDefault ---

  test('should return true for isFilterStateDefault when filter state is default', () => {
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
    expect(mockAwxViewRefresh).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  test('should set loading to false after refresh even when mainTableView.refresh throws', async () => {
    mockAwxViewRefresh.mockRejectedValue(new Error('Network error'));
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

  test('should call exportCsvBase and manage loading on exportCsv', async () => {
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

    await act(async () => {
      await result.current.exportCsv();
    });

    expect(mockExportCsvBase).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  test('should set loading to false after exportCsv even when exportCsvBase throws', async () => {
    mockExportCsvBase.mockRejectedValue(new Error('CSV error'));
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

    await act(async () => {
      try {
        await result.current.exportCsv();
      } catch {
        // expected
      }
    });

    expect(result.current.loading).toBe(false);
  });

  // --- exportPdf ---

  test('should call exportPdfBase when exportPdf is invoked', () => {
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));
    act(() => {
      result.current.exportPdf();
    });
    expect(mockExportPdfBase).toHaveBeenCalled();
  });
});
