import { useCallback } from 'react';
import {
  filtersToSearchObj,
  IFilterState,
  IToolbarFilter,
  paramsToSearchObj,
  QueryParams,
  useGetPageUrl,
} from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';

/**
 * Returns a stable callback that opens the dashboard print preview in a new tab.
 * The print preview fetches fresh data using the current filter state, then
 * auto-triggers window.print() so the user can save the report as PDF.
 */
export function useExportPdf(
  toolbarFilters: IToolbarFilter[],
  filterState: IFilterState,
  queryParams: QueryParams
): () => Promise<void> {
  const getPageUrl = useGetPageUrl();

  return useCallback(() => {
    const params = new URLSearchParams([
      ...paramsToSearchObj(queryParams),
      ...filtersToSearchObj(toolbarFilters, filterState),
    ]);
    const printPath = getPageUrl(AwxRoute.AutomationDashboardPrint);
    window.open(`${printPath}?${params.toString()}`, '_blank');
    return Promise.resolve();
  }, [toolbarFilters, filterState, queryParams, getPageUrl]);
}
