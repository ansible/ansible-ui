import { IAutomationDashboardCollectionStatus } from '../types';
import { useEffect, useMemo, useState } from 'react';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { awxAPI } from '../../../common/api/awx-utils';
import { useFetcher } from '../../../../common/crud/Data';
import { isRequestError } from '../../../../common/crud/RequestError';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import useSWR, { mutate } from 'swr';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';

function hasStatusCode(error: unknown, statusCode: number): boolean {
  return isRequestError(error) && error.statusCode === statusCode;
}

const REFRESH_INTERVAL_MS = 10 * 1000;
const UNAVAILABLE_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const DEFAULT_STATUS: IAutomationDashboardCollectionStatus = {
  enabled: null,
  min_collection_timestamp: null,
  show_dashboard: null,
  show_gamification: null,
};

export function useAutomationDashboardCollectionStatus(): {
  collectionStatus: IAutomationDashboardCollectionStatus;
  isLoading: boolean;
  /** Superuser or system auditor, and show_dashboard is true. */
  canSeeDashboard: boolean;
  canSeeLeaderboard: boolean;
  /** Fetch error when there is no data to fall back on; a 404 (no metrics service) is not an error. */
  error: Error | undefined;
} {
  const url = metricsAPI`/dashboard_reports/collection_status/`;
  const fetcher = useFetcher();
  // useAwxActiveUser (not usePlatformActiveUser) so this hook works in both the Platform
  // build and the standalone AWX build - only the former mounts PlatformActiveUserProvider.
  const { activeAwxUser } = useAwxActiveUser();
  // A 404 means no metrics service (e.g. standalone AWX): poll rarely until it answers again
  const [isUnavailable, setIsUnavailable] = useState(false);
  const {
    data,
    error,
    isLoading: isSwrLoading,
  } = useSWR<IAutomationDashboardCollectionStatus, Error>(url, fetcher, {
    // No dedupingInterval override: the global default lets concurrent callers share one request
    refreshInterval: isUnavailable ? UNAVAILABLE_REFRESH_INTERVAL_MS : REFRESH_INTERVAL_MS,
    shouldRetryOnError: !isUnavailable,
  });

  useEffect(() => {
    // 401 = session expired: revalidate both /me/ queries so the login screen shows immediately;
    // the key for the provider that isn't mounted in this build is a no-op
    if (hasStatusCode(error, 401)) {
      void mutate(gatewayAPI`/me/`);
      void mutate(awxAPI`/me/`);
    }
    setIsUnavailable(hasStatusCode(error, 404));
  }, [error]);

  return useMemo(() => {
    // A failed poll keeps the last good data (SWR retains it), so one blip doesn't unmount the
    // dashboard or flip the nav; the error only surfaces when there is no data at all
    const isNotFound = hasStatusCode(error, 404);
    const collectionStatus = isNotFound ? DEFAULT_STATUS : (data ?? DEFAULT_STATUS);
    const canSeeDashboard =
      !!(activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor) &&
      !!collectionStatus.show_dashboard;
    const canSeeLeaderboard = !!collectionStatus.show_gamification;
    return {
      collectionStatus,
      isLoading: isSwrLoading,
      canSeeDashboard,
      canSeeLeaderboard,
      error: data || isNotFound ? undefined : error,
    };
  }, [data, error, isSwrLoading, activeAwxUser]);
}
