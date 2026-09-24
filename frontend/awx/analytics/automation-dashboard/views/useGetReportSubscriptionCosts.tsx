import { useGet } from '../../../../common/crud/useGet';
import { ISubscriptionCosts } from '../types';
import { metricsAPI } from '../../../common/api/metrics-utils';

interface IGetReportSubscriptionCosts {
  subscriptionCosts: ISubscriptionCosts[] | undefined;
  refresh: () => void;
  isLoading: boolean;
  error: Error | undefined;
}

export function useGetReportSubscriptionCosts(
  organizationId: number | undefined = undefined,
  useGlobalSettings = false
): IGetReportSubscriptionCosts {
  const {
    data: subscriptionCosts,
    refresh,
    isLoading,
    error,
  } = useGet<ISubscriptionCosts[]>(
    useGlobalSettings || organizationId !== undefined
      ? metricsAPI`/dashboard_reports/subscription_costs/`
      : undefined,
    !useGlobalSettings && organizationId !== undefined
      ? { organization: organizationId }
      : undefined
  );

  return { subscriptionCosts, refresh, isLoading, error };
}
