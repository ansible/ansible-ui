// A react context that contains the serveices of the platform
// Path: platform/PlatformProvider.tsx

import { createContext, useContext, useMemo } from 'react';
import { useGet } from '../frontend/common/crud/useGet';
import { gatewayAPI } from './api/gateway-api-utils';
import { Service } from './interfaces/Service';

interface IPlatformContext {
  services: Service[];
}

const PlatformContext = createContext<IPlatformContext>({ services: [] });

export const usePlatformContext = () => useContext(PlatformContext);

export function PlatformProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const servicesResponse = useGet<{ results: Service[] }>(gatewayAPI`/v1/services`);
  return (
    <PlatformContext.Provider value={{ services: servicesResponse.data?.results ?? [] }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function useHasController() {
  const platformContext = usePlatformContext();
  return useMemo(() => {
    return platformContext.services.some(
      (service) => service.summary_fields.service_cluster?.service_type === 'controller'
    );
  }, [platformContext.services]);
}

export function useHasEda() {
  const platformContext = usePlatformContext();
  return useMemo(() => {
    return platformContext.services.some(
      (service) => service.summary_fields.service_cluster?.service_type === 'eda'
    );
  }, [platformContext.services]);
}

export function useHasHub() {
  const platformContext = usePlatformContext();
  return useMemo(() => {
    return platformContext.services.some(
      (service) => service.summary_fields.service_cluster?.service_type === 'hub'
    );
  }, [platformContext.services]);
}
