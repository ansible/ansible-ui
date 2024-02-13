// A react context that contains the serveices of the platform
// Path: platform/PlatformProvider.tsx

import { useMemo } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../frontend/common/crud/Data';
import { gatewayAPI } from '../api/gateway-api-utils';
import { Service } from '../interfaces/Service';

export function useHasService(serviceName: string) {
  const { data } = useSWR<{ results: Service[] }>(gatewayAPI`/services/`, requestGet, {
    refreshInterval: 30 * 1000,
    dedupingInterval: 30 * 1000,
  });
  const hasService = useMemo(() => {
    const services = data?.results ?? [];
    return services.some(
      (service) => service.summary_fields.service_cluster?.service_type === serviceName
    );
  }, [data?.results, serviceName]);
  if (!data) return true;
  return hasService;
}

export function useHasAwx() {
  return useHasService('controller');
}

export function useHasEda() {
  return useHasService('eda');
}

export function useHasHub() {
  return useHasService('hub');
}
