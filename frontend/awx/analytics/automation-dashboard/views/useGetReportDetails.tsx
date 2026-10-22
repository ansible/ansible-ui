import { useCallback, useMemo } from 'react';
import { IDashboardDetails } from '../types';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { IFilterState, IToolbarFilter, QueryParams } from '../../../../../framework';
import useSWR from 'swr';
import { hasValidRequiredFilters } from '../utils/queryString';
import { getReportQueryBody, postReportQuery } from '../utils/reportQuery';
import { shouldRetryUnlessTooLarge } from '../utils/requestTooLarge';

/** The POST query endpoint of the details: the filters are sent in the JSON body. */
const DETAILS_QUERY_URL = metricsAPI`/dashboard_reports/report/details/query/`;

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

  // A string, so the SWR key changes only when the filters do.
  const body = useMemo(
    () => JSON.stringify(getReportQueryBody(toolbarFilters, filterState, queryParams)),
    [toolbarFilters, filterState, queryParams]
  );

  // Defer fetch until required filters are valid
  const key = filtersValid ? [DETAILS_QUERY_URL, body] : null;
  const response = useSWR<IDashboardDetails, Error>(key, postReportQuery<IDashboardDetails>, {
    keepPreviousData: true,
    shouldRetryOnError: shouldRetryUnlessTooLarge,
  });
  const { data, mutate, isLoading } = response;

  const refreshDetails = useCallback(async () => {
    await mutate();
  }, [mutate]);
  const reportDetails = data;
  const error: Error | undefined = response.error;
  return { reportDetails, refreshDetails, isLoading, error };
}
