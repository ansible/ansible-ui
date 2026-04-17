import { IAutomationDashboardCollectionStatus } from '../types';
import { useEffect, useMemo, useState } from 'react';
import { usePlatformActiveUser } from '../../../../../platform/main/PlatformActiveUserProvider';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { useFetcher } from '../../../../common/crud/Data';
import useSWR from 'swr';

const DEFAULT_STATUS: IAutomationDashboardCollectionStatus = {
  enabled: null,
  next_run: null,
  initial_collection_status: null,
};

export function useAutomationDashboardCollectionStatus(): IAutomationDashboardCollectionStatus {
  const { activePlatformUser } = usePlatformActiveUser();
  const isSuperuserOrAuditor =
    activePlatformUser?.is_superuser || activePlatformUser?.is_platform_auditor;

  const url = metricsAPI`/dashboard_reports/collection_status/`;
  const fetcher = useFetcher();
  const { data, error } = useSWR<IAutomationDashboardCollectionStatus, Error>(
    isSuperuserOrAuditor ? url : null,
    fetcher,
    { dedupingInterval: 0, refreshInterval: 10 * 1000 }
  );

  const [collectionStatus, setCollectionStatus] =
    useState<IAutomationDashboardCollectionStatus>(DEFAULT_STATUS);

  useEffect(() => {
    setCollectionStatus(() => {
      if (error) {
        return DEFAULT_STATUS;
      }

      if (data) {
        return data;
      }

      return DEFAULT_STATUS;
    });
  }, [data, error]);

  return useMemo<IAutomationDashboardCollectionStatus>(() => collectionStatus, [collectionStatus]);
}
