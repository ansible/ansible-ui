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
      setFilterState(persisted);
    } else if (!isFirstSeed) {
      // A different user with nothing saved — reset rather than keep the
      // previous user's filters.
      setFilterState({ ...DEFAULT_FILTERS });
    }
  }, [userId, seededUserId, initialSearch, toolbarFilters, setFilterState]);

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
    setFilterState({ period: [AutomationDashboardDateRangeFilterPresets.last_7_days] });

    // Call toolbar callback to reset dropdown
    onClearFiltersCallback.current?.();
  }, [setFilterState]);

  // Function to register callback from toolbar
  const registerClearCallback = useCallback((callback: () => void) => {
    onClearFiltersCallback.current = callback;
  }, []);

  const mainTableView: IAutomationDashboardBaseView<IJobTemplate> = useMemo(
    () => ({ ...mainTableViewBase, clearAllFilters }),
    [mainTableViewBase, clearAllFilters]
  );

  const detailsResponse = useGetReportDetails(toolbarFilters, filterState, QUERY_PARAMS);
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
      detailsError: detailsResponse.error,
      detailsLoading: detailsResponse.isLoading,
      costState,
      setCostState,
      loading,
      refresh,
      exportCsv,
      isFilterStateDefault: isFilterStateDefaultValue,
      registerClearCallback,
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
    ]
  );
}
