import { IAutomationDashboardCollectionStatus } from '../types';
import { useMemo } from 'react';
import { usePlatformActiveUser } from '../../../../../platform/main/PlatformActiveUserProvider';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { useFetcher } from '../../../../common/crud/Data';
import useSWR from 'swr';

const DEFAULT_STATUS: IAutomationDashboardCollectionStatus = {
  enabled: null,
  next_run: null,
  initial_collection_status: null,
};

export function useAutomationDashboardCollectionStatus(): {
  collectionStatus: IAutomationDashboardCollectionStatus;
  isLoading: boolean;
} {
  const { activePlatformUser } = usePlatformActiveUser();
  const isSuperuserOrAuditor =
    activePlatformUser?.is_superuser || activePlatformUser?.is_platform_auditor;

  const url = metricsAPI`/dashboard_reports/collection_status/`;
  const fetcher = useFetcher();
  const {
    data,
    error,
    isLoading: isSwrLoading,
  } = useSWR<IAutomationDashboardCollectionStatus, Error>(
    isSuperuserOrAuditor ? url : null,
    fetcher,
    {
      // Disable deduplication so each refreshInterval poll fetches fresh data
      dedupingInterval: 0,
      refreshInterval: 10 * 1000,
    }
  );

  // Use only useMemo - no useState/useEffect to avoid multiple re-renders
  return useMemo(() => {
    // If user is not superuser or auditor, we don't fetch
    if (!isSuperuserOrAuditor) {
      return {
        collectionStatus: DEFAULT_STATUS,
        isLoading: false,
      };
    }

    // Return values directly from SWR
    const collectionStatus = error || !data ? DEFAULT_STATUS : data;
    return {
      collectionStatus,
      isLoading: isSwrLoading,
    };
  }, [data, error, isSwrLoading, isSuperuserOrAuditor]);
}
