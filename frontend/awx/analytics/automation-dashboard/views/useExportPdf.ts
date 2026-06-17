import { useCallback } from 'react';
import {
  filtersToSearchObj,
  IFilterState,
  IToolbarFilter,
  paramsToSearchObj,
  QueryParams,
} from '../../../../../framework';
import { metricsAPI } from '../../../common/api/metrics-utils';

/**
 * Returns a stable callback that opens the dashboard HTML export in a new tab
 * and automatically triggers the browser's print dialog (Save as PDF).
 * PDF generation is handled natively by the browser — no extra libraries needed.
 */
export function useExportPdf(
  toolbarFilters: IToolbarFilter[],
  filterState: IFilterState,
  queryParams: QueryParams
): () => void {
  return useCallback(() => {
    const params = new URLSearchParams([
      ...paramsToSearchObj(queryParams),
      ...filtersToSearchObj(toolbarFilters, filterState),
      ['export_format', 'html'],
      ['report_type', 'summary'],
    ]);
    const url = metricsAPI`/dashboard_reports/report/export/?${params.toString()}`;
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.addEventListener('load', () => {
        newWindow.print();
      });
    }
  }, [toolbarFilters, filterState, queryParams]);
}
