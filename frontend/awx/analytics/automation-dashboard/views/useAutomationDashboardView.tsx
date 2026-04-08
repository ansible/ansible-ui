import { useCallback, useMemo, useState } from 'react';
import { IToolbarFilter } from '../../../../../framework';
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

  // Override clearAllFilters to retain the required 'period' filter instead of clearing it.
  const clearAllFilters = useCallback(() => {
    setFilterState({ period: [AutomationDashboardDateRangeFilterPresets.last_7_days] });
  }, [setFilterState]);

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
    ]
  );
}
