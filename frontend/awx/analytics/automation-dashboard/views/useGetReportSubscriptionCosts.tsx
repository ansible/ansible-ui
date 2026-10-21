import { useGet } from '../../../../common/crud/useGet';
import { ISubscriptionCosts } from '../types';
import { metricsAPI } from '../../../common/api/metrics-utils';

interface IGetReportSubscriptionCosts {
  subscriptionCosts: ISubscriptionCosts[] | undefined;
  refresh: () => void;
  isLoading: boolean;
  error: Error | undefined;
}

export const SUBSCRIPTION_COSTS_URL = metricsAPI`/dashboard_reports/subscription_costs/`;

export function useGetReportSubscriptionCosts(): IGetReportSubscriptionCosts {
  const {
    data: subscriptionCosts,
    refresh,
    isLoading,
    error,
  } = useGet<ISubscriptionCosts[]>(SUBSCRIPTION_COSTS_URL);

  return { subscriptionCosts, refresh, isLoading, error };
}
