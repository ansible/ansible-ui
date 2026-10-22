/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';
import { QUERY_PARAMS, useAutomationDashboardView } from './useAutomationDashboardView';
import { useAutomationDashboardBaseView } from '../common/useAutomationDashboardBaseView';
import { writePersistedFilterState } from '../utils/persistedFilterState';
import type { IAutomationDashboardBaseView } from '../common/useAutomationDashboardBaseView';
import { RequestError } from '../../../../common/crud/RequestError';
import { useGetReportDetails } from './useGetReportDetails';

// ─── Hoisted mocks (run before vi.mock factories) ─────────────────────────────

const {
  mockSetFilterState,
  mockBaseViewRefresh,
  mockRefreshDetails,
  mockExportCsvBase,
  mockUseAwxActiveUser,
} = vi.hoisted(() => ({
  mockSetFilterState: vi.fn(),
  mockBaseViewRefresh: vi.fn(),
  mockRefreshDetails: vi.fn(),
  mockExportCsvBase: vi.fn(),
  mockUseAwxActiveUser: vi.fn((): { activeAwxUser?: { id: number } } => ({
    activeAwxUser: { id: 42 },
  })),
}));

// ─── Dependency mocks ─────────────────────────────────────────────────────────

vi.mock('../../../common/useAwxActiveUser', () => ({
  useAwxActiveUser: mockUseAwxActiveUser,
}));

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
      period: [AutomationDashboardDateRangeFilterPresets.last_7_days],
    },
    setFilterState: mockSetFilterState,
    clearAllFilters: vi.fn(),
    itemCount: 0,
    pageItems: [],
    refresh: mockBaseViewRefresh,
    limitFiltersToOneOrOperation: true,
    updateItem: vi.fn(),
    upsertItem: vi.fn(),
    listUrl: '',
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

/** Runs `test` with the base view returning `overrides`, then restores its mock. */
function withBaseView(overrides: Record<string, unknown>, test: () => void) {
  const baseView = vi.mocked(useAutomationDashboardBaseView).getMockImplementation()!;
  vi.mocked(useAutomationDashboardBaseView).mockImplementation(
    (options) => ({ ...baseView(options), ...overrides }) as ReturnType<typeof baseView>
  );
  try {
    test();
  } finally {
    vi.mocked(useAutomationDashboardBaseView).mockImplementation(baseView);
  }
}

/** Runs `test` with the details returning `overrides`, then restores their mock. */
function withDetails(overrides: Record<string, unknown>, test: () => void) {
  const details = vi.mocked(useGetReportDetails).getMockImplementation()!;
  vi.mocked(useGetReportDetails).mockImplementation((...args) => ({
    ...details(...args),
    ...overrides,
  }));
  try {
    test();
  } finally {
    vi.mocked(useGetReportDetails).mockImplementation(details);
  }
}

describe('useAutomationDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { id: 42 } });
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
    expect(view.replaceFilterState).toBeTypeOf('function');
    expect(view.filterResetCount).toBe(0);
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

  test('should count clearAllFilters and replaceFilterState as filter resets', () => {
    const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

    act(() => result.current.mainTableView.clearAllFilters());
    expect(result.current.filterResetCount).toBe(1);

    act(() => result.current.replaceFilterState({ period: ['last_30_days'] }));
    expect(mockSetFilterState).toHaveBeenLastCalledWith({ period: ['last_30_days'] });
    expect(result.current.filterResetCount).toBe(2);
  });

  test('should count seeding the filters for a user resolved after mount as a filter reset', () => {
    writePersistedFilterState({ period: ['last_30_days'] }, 7);
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: undefined });
    const { result, rerender } = renderHook(() =>
      useAutomationDashboardView({ toolbarFilters: [] })
    );
    expect(result.current.filterResetCount).toBe(0);

    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { id: 7 } });
    rerender();

    expect(mockSetFilterState).toHaveBeenCalledWith({ period: ['last_30_days'] });
    expect(result.current.filterResetCount).toBe(1);
  });

  // --- Requests ---

  const tooLarge = new RequestError('Too large', undefined, 431, undefined, undefined);

  test('should show requests rejected as too large with previous data as filtersTooLarge only', () => {
    withDetails({ error: tooLarge, reportDetails: {} }, () => {
      withBaseView({ error: tooLarge, pageItems: [] }, () => {
        const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

        expect(result.current.filtersTooLarge).toEqual({ previousData: 'all' });
        expect(result.current.detailsError).toBeUndefined();
        expect(result.current.mainTableView.error).toBeUndefined();
      });
    });
  });

  test('should keep the error of a request rejected as too large without previous data', () => {
    withDetails({ error: tooLarge, reportDetails: undefined }, () => {
      withBaseView({ error: tooLarge, pageItems: undefined }, () => {
        const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

        expect(result.current.filtersTooLarge).toEqual({ previousData: 'none' });
        // Neither has previous data: their error states are shown.
        expect(result.current.detailsError).toBe(tooLarge);
        expect(result.current.mainTableView.error).toBe(tooLarge);
      });
    });
  });

  test('should tell that some previous data is shown when only the details show it', () => {
    withDetails({ error: tooLarge, reportDetails: {} }, () => {
      // The table has no rows for its page: its error state is shown.
      withBaseView({ error: tooLarge, pageItems: undefined }, () => {
        const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

        expect(result.current.filtersTooLarge).toEqual({ previousData: 'some' });
        expect(result.current.detailsError).toBeUndefined();
        expect(result.current.mainTableView.error).toBe(tooLarge);
      });
    });
  });

  test('should tell that some previous data is shown when only the table is too large', () => {
    // The cards request (shorter) passes: the cards show the current filters.
    withBaseView({ error: tooLarge, pageItems: [] }, () => {
      const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

      expect(result.current.filtersTooLarge).toEqual({ previousData: 'some' });
      expect(result.current.mainTableView.error).toBeUndefined();
    });
  });

  test('should keep other request errors', () => {
    const serverError = new RequestError('Failed', undefined, 500, undefined, undefined);
    withBaseView({ error: serverError }, () => {
      const { result } = renderHook(() => useAutomationDashboardView({ toolbarFilters: [] }));

      expect(result.current.filtersTooLarge).toBeUndefined();
      expect(result.current.mainTableView.error).toBe(serverError);
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
