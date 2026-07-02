import { useCallback, useMemo } from 'react';
import { IDashboardDetails } from '../types';
import { metricsAPI } from '../../../common/api/metrics-utils';
import {
  paramsToSearchObj,
  IFilterState,
  IToolbarFilter,
  QueryParams,
} from '../../../../../framework';
import { useFetcher } from '../../../../common/crud/Data';
import useSWR from 'swr';
import { filtersToSearchObj, hasValidRequiredFilters } from '../utils/queryString';

const DETAILS_PATH = 'dashboard_reports/report/details/';

// Stable empty fallback to prevent unnecessary useMemo re-runs when queryParams is omitted.
const EMPTY_PARAMS: QueryParams = {};

interface IGetReportDetailsResult {
  reportDetails: IDashboardDetails | undefined;
  refreshDetails: () => Promise<void>;
  isLoading: boolean;
  error: Error | undefined;
}

export function useGetReportDetails(
  toolbarFilters: IToolbarFilter[],
  filterState: IFilterState,
  queryParams: QueryParams = EMPTY_PARAMS
): IGetReportDetailsResult {
  // Check if all required filters are valid
  const filtersValid = useMemo(
    () => hasValidRequiredFilters(toolbarFilters, filterState),
    [toolbarFilters, filterState]
  );

  // Memoize the query string to prevent unnecessary re-fetches on every render.
  const queryString = useMemo(() => {
    const params = new URLSearchParams([
      ...paramsToSearchObj(queryParams),
      ...filtersToSearchObj(toolbarFilters, filterState),
    ]);
    return params.toString();
  }, [toolbarFilters, filterState, queryParams]);

  // Only construct URL if all required filters are valid, otherwise null to prevent fetch
  const url = filtersValid ? metricsAPI`/${DETAILS_PATH}?${queryString}` : null;
  const fetcher = useFetcher();
  const response = useSWR<IDashboardDetails>(url, fetcher, { keepPreviousData: true });
  const { data, mutate, isLoading } = response;

  const refreshDetails = useCallback(async () => {
    await mutate();
  }, [mutate]);
  const reportDetails = data;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const error: Error | undefined = response.error;
  return { reportDetails, refreshDetails, isLoading, error };
}
