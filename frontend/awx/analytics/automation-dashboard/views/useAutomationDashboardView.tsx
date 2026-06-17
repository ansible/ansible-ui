import { useCallback, useMemo, useRef, useState } from 'react';
import { IFilterState, IToolbarFilter } from '../../../../../framework';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { IAwxView, useAwxView } from '../../../common/useAwxView';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';
import { IAutomationDashboardView, IJobTemplate } from '../types';
import { useGetReportDetails } from './useGetReportDetails';
import { useSubscriptionCostState } from './useSubscriptionCostState';
import { useExportCsv } from './useExportCsv';
import { useExportPdf } from './useExportPdf';

// Resolved once at module load — the user's time zone does not change during a session.
export const QUERY_PARAMS = { tz: Intl.DateTimeFormat().resolvedOptions().timeZone };

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

  // Compare with DEFAULT_FILTERS
  return JSON.stringify(activeFilterState) === JSON.stringify(DEFAULT_FILTERS);
}

export function useAutomationDashboardView(options: {
  toolbarFilters: IToolbarFilter[];
}): IAutomationDashboardView {
  const { toolbarFilters } = options;
  const mainTableViewBase = useAwxView<IJobTemplate>({
    url: metricsAPI`/dashboard_reports/report/`,
    defaultSort: 'template_name',
    defaultFilters: DEFAULT_FILTERS,
    toolbarFilters,
    queryParams: QUERY_PARAMS,
  });

  const { filterState, setFilterState } = mainTableViewBase;

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

  const mainTableView: IAwxView<IJobTemplate> = useMemo(
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
  const exportPdfBase = useExportPdf(toolbarFilters, filterState, QUERY_PARAMS);

  const exportCsv = useCallback(async () => {
    setLoading(true);
    try {
      await exportCsvBase();
    } finally {
      setLoading(false);
    }
  }, [exportCsvBase]);

  const exportPdf = useCallback(async () => {
    setLoading(true);
    try {
      await exportPdfBase();
    } finally {
      setLoading(false);
    }
  }, [exportPdfBase]);

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
      exportPdf,
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
      exportPdf,
      isFilterStateDefaultValue,
      registerClearCallback,
    ]
  );
}
