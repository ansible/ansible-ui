import { useFetcher } from '@ansible/common-ui/crud/Data';
import useSWR, { SWRConfiguration } from 'swr';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { IAutomationDashboardCollectionStatus } from '../types';
import { useMemo } from 'react';

/** Fetches collection_status; the shared source for the settings pages and the dashboard/nav visibility. */
export function useCollectionStatus(
  options?: Pick<SWRConfiguration, 'refreshInterval' | 'shouldRetryOnError'>
) {
  const fetcher = useFetcher();
  const fetchUrl = metricsAPI`/dashboard_reports/collection_status/`;
  const response = useSWR<IAutomationDashboardCollectionStatus, Error>(fetchUrl, fetcher, {
    keepPreviousData: true,
    ...options,
  });
  const { data, error, isLoading, mutate } = response;
  return useMemo(() => ({ data, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
