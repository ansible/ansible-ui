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
 * Delay (ms) between the new tab's `load` event and the print dialog firing.
 * Gives fonts, inline SVG charts, and styles time to fully render before the
 * browser captures the page for printing.
 */
export const PRINT_DELAY_MS = 2000;

/**
 * Returns a stable callback that opens the dashboard HTML export in a new tab
 * and automatically triggers the browser's print dialog after a short delay
 * to allow the page to fully render. PDF generation is handled natively by
 * the browser — no extra libraries needed.
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
        setTimeout(() => {
          newWindow.print();
        }, PRINT_DELAY_MS);
      });
    }
  }, [toolbarFilters, filterState, queryParams]);
}
