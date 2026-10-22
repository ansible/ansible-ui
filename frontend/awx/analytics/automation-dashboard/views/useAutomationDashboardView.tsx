import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IFilterState, IToolbarFilter } from '../../../../../framework';
import { readPersistedFilterState, writePersistedFilterState } from '../utils/persistedFilterState';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';
import { IAutomationDashboardView, IJobTemplate, ReportType } from '../types';
import { useGetReportDetails } from './useGetReportDetails';
import { useSubscriptionCostState } from './useSubscriptionCostState';
import { useExportCsv } from './useExportCsv';
import { isRequestTooLargeError } from '../utils/requestTooLarge';
import {
  IAutomationDashboardBaseView,
  useAutomationDashboardBaseView,
} from '../common/useAutomationDashboardBaseView';

// Resolved once at module load — the user's time zone does not change during a session.
export const QUERY_PARAMS = { tz: Intl.DateTimeFormat().resolvedOptions().timeZone };

// The `last_7_days` preset carries no explicit dates: the backend resolves the window, and
// `getPeriodFilterParam` only forwards `values[0]` for non-custom presets. Storing concrete
// dates here would also make a persisted default stop matching `DEFAULT_FILTERS` after a UTC
// day rollover. Keep this in sync with `DEFAULT_FILTER_STATE` in `DashboardToolbar` and the
// `clearAllFilters` reset below.
const DEFAULT_FILTERS: Record<string, string[]> = {
  period: [AutomationDashboardDateRangeFilterPresets.last_7_days],
};

/** Returns true when filterState is empty or equals the default (period = last 7 days only). */
function isDefaultFilterState(filterState: IFilterState | undefined): boolean {
  if (!filterState) return true;

  // Remove empty entries from filterState
  const activeFilterState = Object.fromEntries(
    Object.entries(filterState).filter(([, v]) => v && v.length > 0)
  );

  if (Object.keys(activeFilterState).length === 0) return true;

  // Compare with DEFAULT_FILTERS
  return JSON.stringify(activeFilterState) === JSON.stringify(DEFAULT_FILTERS);
}

/**
 * Whether a request was rejected as too large, and whether all, some or none of the dashboard's
 * data (the table, the cards) is still the data of the previous request. A request that was not
 * rejected shows the data of the current filters (e.g. the shorter cards request may pass while
 * the table request is too large). Each request is `[isTooLarge, isShowingPreviousData]`.
 */
function getFiltersTooLarge(
  ...requests: [isTooLarge: boolean, isShowingPreviousData: boolean][]
): IAutomationDashboardView['filtersTooLarge'] {
  if (!requests.some(([isTooLarge]) => isTooLarge)) return undefined;
  const showingCount = requests.filter(([, isShowing]) => isShowing).length;
  if (showingCount === requests.length) return { previousData: 'all' };
  return { previousData: showingCount > 0 ? 'some' : 'none' };
}

export function useAutomationDashboardView(options: {
  toolbarFilters: IToolbarFilter[];
}): IAutomationDashboardView {
  const { toolbarFilters } = options;

  // Scope persisted filters to the active user: sessionStorage survives logout,
  // so without this a second user logging in on the same tab would inherit the
  // first user's filters.
  const { activeAwxUser } = useAwxActiveUser();
  const userId = activeAwxUser?.id;

  // Seed the view from filters this user persisted earlier in the session (e.g.
  // before visiting the Leaderboards tab) so returning restores them instead of
  // snapping back to "last 7 days". When the user id isn't known yet at mount,
  // the effect below seeds it once it resolves. The URL query string still wins
  // when present (deep links).
  const [initialFilters] = useState(() =>
    userId !== undefined ? (readPersistedFilterState(userId) ?? DEFAULT_FILTERS) : DEFAULT_FILTERS
  );
  const [initialSearch] = useState(() => window.location.search);

  const mainTableViewBase = useAutomationDashboardBaseView<IJobTemplate>({
    url: metricsAPI`/dashboard_reports/report/`,
    defaultFilters: initialFilters,
    toolbarFilters,
  });

  const { filterState, setFilterState } = mainTableViewBase;

  /**
   * Counts the times the filter state was replaced as a whole (seeded for the user, "Clear all
   * filters", a saved report). A replacement that leaves a filter's selection unchanged (e.g.
   * empty) still cancels the running bulk action of its select. Every replacement goes through
   * `replaceFilterState`, so none of them can miss the count.
   */
  const [filterResetCount, setFilterResetCount] = useState(0);
  const replaceFilterState = useCallback(
    (state: IFilterState) => {
      setFilterState(state);
      setFilterResetCount((count) => count + 1);
    },
    [setFilterState]
  );

  // Which user the current filter state has been seeded for. Set up front when
  // the id was already known at mount (the common case — /me/ is cached).
  const [seededUserId, setSeededUserId] = useState<number | undefined>(userId);

  useEffect(() => {
    if (userId === undefined || seededUserId === userId) return;
    const isFirstSeed = seededUserId === undefined;
    setSeededUserId(userId);

    // On the first seed, a deep link (filter params present in the URL when the
    // view mounted) takes precedence over the persisted state.
    if (isFirstSeed) {
      const params = new URLSearchParams(initialSearch);
      if (toolbarFilters.some((filter) => params.has(filter.key))) return;
    }

    const persisted = readPersistedFilterState(userId);
    if (persisted) {
      replaceFilterState(persisted);
    } else if (!isFirstSeed) {
      // A different user with nothing saved — reset rather than keep the
      // previous user's filters.
      replaceFilterState({ ...DEFAULT_FILTERS });
    }
  }, [userId, seededUserId, initialSearch, toolbarFilters, replaceFilterState]);

  // Persist every filter change for the active user so it can be restored after
  // a tab switch.
  useEffect(() => {
    if (userId === undefined || seededUserId !== userId) return;
    writePersistedFilterState(filterState, userId);
  }, [filterState, userId, seededUserId]);

  // Ref for callback from toolbar (to reset dropdown when filters cleared)
  const onClearFiltersCallback = useRef<(() => void) | undefined>();

  // Override clearAllFilters to retain the required 'period' filter and call toolbar callback
  const clearAllFilters = useCallback(() => {
    replaceFilterState({ period: [AutomationDashboardDateRangeFilterPresets.last_7_days] });

    // Call toolbar callback to reset dropdown
    onClearFiltersCallback.current?.();
  }, [replaceFilterState]);

  // Function to register callback from toolbar
  const registerClearCallback = useCallback((callback: () => void) => {
    onClearFiltersCallback.current = callback;
  }, []);

  // A request rejected as too large (too many filter values in the URL) is shown as one alert
  // below the filters. When there is data of a previous request, it stays and the error state
  // is hidden; without it (e.g. the first request) the error state is shown.
  const isTableRequestTooLarge = isRequestTooLargeError(mainTableViewBase.error);
  const isTableShowingPreviousData =
    isTableRequestTooLarge && mainTableViewBase.pageItems !== undefined;
  const mainTableView: IAutomationDashboardBaseView<IJobTemplate> = useMemo(
    () => ({
      ...mainTableViewBase,
      clearAllFilters,
      error: isTableShowingPreviousData ? undefined : mainTableViewBase.error,
    }),
    [mainTableViewBase, clearAllFilters, isTableShowingPreviousData]
  );

  const detailsResponse = useGetReportDetails(toolbarFilters, filterState, QUERY_PARAMS);
  const isDetailsRequestTooLarge = isRequestTooLargeError(detailsResponse.error);
  const isDetailsShowingPreviousData =
    isDetailsRequestTooLarge && detailsResponse.reportDetails !== undefined;

  const { costState, setCostState } = useSubscriptionCostState();

  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([detailsResponse.refreshDetails(), mainTableView.refresh()]);
    } finally {
      setLoading(false);
    }
  }, [mainTableView, detailsResponse]);

  const exportCsvBase = useExportCsv(toolbarFilters, filterState, QUERY_PARAMS);

  const exportCsv = useCallback(
    async (reportType: ReportType) => {
      setLoading(true);
      try {
        await exportCsvBase(reportType);
      } finally {
        setLoading(false);
      }
    },
    [exportCsvBase]
  );

  // Compute whether filter state is default
  const isFilterStateDefaultValue = useMemo(() => isDefaultFilterState(filterState), [filterState]);

  return useMemo(
    () => ({
      mainTableView,
      details: detailsResponse.reportDetails,
      detailsError: isDetailsShowingPreviousData ? undefined : detailsResponse.error,
      detailsLoading: detailsResponse.isLoading,
      costState,
      setCostState,
      loading,
      refresh,
      exportCsv,
      isFilterStateDefault: isFilterStateDefaultValue,
      registerClearCallback,
      replaceFilterState,
      filterResetCount,
      filtersTooLarge: getFiltersTooLarge(
        [isTableRequestTooLarge, isTableShowingPreviousData],
        [isDetailsRequestTooLarge, isDetailsShowingPreviousData]
      ),
    }),
    [
      mainTableView,
      detailsResponse.reportDetails,
      detailsResponse.error,
      detailsResponse.isLoading,
      costState,
      setCostState,
      loading,
      refresh,
      exportCsv,
      isFilterStateDefaultValue,
      registerClearCallback,
      replaceFilterState,
      filterResetCount,
      isTableRequestTooLarge,
      isTableShowingPreviousData,
      isDetailsRequestTooLarge,
      isDetailsShowingPreviousData,
    ]
  );
}
