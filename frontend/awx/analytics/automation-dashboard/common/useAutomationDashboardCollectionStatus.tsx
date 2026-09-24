import { IAutomationDashboardCollectionStatus } from '../types';
import { useMemo } from 'react';
import { usePlatformActiveUser } from '../../../../../platform/main/PlatformActiveUserProvider';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { useFetcher } from '../../../../common/crud/Data';
import { useAutomationDashboardAccess } from './useAutomationDashboardAccess';
import useSWR from 'swr';

const DEFAULT_STATUS: IAutomationDashboardCollectionStatus = {
  enabled: null,
  next_run: null,
  initial_collection_status: null,
  show_dashboard: false,
};

export function useAutomationDashboardCollectionStatus(): {
  collectionStatus: IAutomationDashboardCollectionStatus;
  isLoading: boolean;
} {
  const { activePlatformUser } = usePlatformActiveUser();
  const isSuperuserOrAuditor =
    activePlatformUser?.is_superuser || activePlatformUser?.is_platform_auditor;
  const { access, isLoading: isAccessLoading } = useAutomationDashboardAccess();
  const hasDashboardAccess =
    access?.scope === 'global' ||
    (access?.scope === 'organization' && access.organizations.length > 0);

  const url = metricsAPI`/dashboard_reports/collection_status/`;
  const fetcher = useFetcher();
  const {
    data,
    error,
    isLoading: isSwrLoading,
  } = useSWR<IAutomationDashboardCollectionStatus, Error>(
    isSuperuserOrAuditor || hasDashboardAccess ? url : null,
    fetcher,
    {
      // Disable deduplication so each refreshInterval poll fetches fresh data
      dedupingInterval: 0,
      refreshInterval: 10 * 1000,
    }
  );

  // Use only useMemo - no useState/useEffect to avoid multiple re-renders
  return useMemo(() => {
    if (!isSuperuserOrAuditor) {
      const fallbackStatus: IAutomationDashboardCollectionStatus = {
        ...DEFAULT_STATUS,
        enabled: access?.scope === 'organization' ? access.dashboard_enabled : null,
        show_dashboard: false,
      };

      if (!hasDashboardAccess) {
        return {
          collectionStatus: fallbackStatus,
          isLoading: isAccessLoading,
        };
      }

      const collectionStatus =
        error || !data
          ? fallbackStatus
          : {
              ...fallbackStatus,
              enabled: data.enabled,
              show_dashboard: data.show_dashboard === true,
            };

      return {
        collectionStatus,
        isLoading: isAccessLoading || isSwrLoading,
      };
    }

    // Return values directly from SWR
    const collectionStatus = error || !data ? DEFAULT_STATUS : data;
    return {
      collectionStatus,
      isLoading: isSwrLoading,
    };
  }, [
    access,
    data,
    error,
    hasDashboardAccess,
    isSwrLoading,
    isSuperuserOrAuditor,
    isAccessLoading,
  ]);
}
