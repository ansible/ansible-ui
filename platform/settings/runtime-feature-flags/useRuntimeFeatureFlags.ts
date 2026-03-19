import { requestGet } from '@ansible/common-ui/crud/Data';
import { useMemo } from 'react';
import useSWR from 'swr';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { IFeatureFlag } from './IFeatureFlag';

interface FeatureFlagsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IFeatureFlag[];
}

export function useRuntimeFeatureFlags() {
  const response = useSWR<FeatureFlagsResponse>(gatewayAPI`/feature_flags/`, requestGet);

  const flags = useMemo(() => {
    if (!response.data?.results) return [];
    return response.data.results;
  }, [response.data?.results]);

  return {
    flags,
    isLoading: !response.data && !response.error,
    error: response.error as Error | undefined,
    refresh: () => void response.mutate(),
  };
}
