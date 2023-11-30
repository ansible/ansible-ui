// A react context that contains the serveices of the platform
// Path: platform/PlatformProvider.tsx

import { Page } from '@patternfly/react-core';
import { createContext, useContext, useMemo } from 'react';
import { PageLayout } from '../framework';
import { LoadingState } from '../framework/components/LoadingState';
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
  if (!servicesResponse.data) {
    return (
      <Page>
        <PageLayout>
          <LoadingState />
        </PageLayout>
      </Page>
    );
  }
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
