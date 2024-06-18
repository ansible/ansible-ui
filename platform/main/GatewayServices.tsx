import { Page } from '@patternfly/react-core';
import { ReactNode, createContext, useContext, useLayoutEffect, useState } from 'react';
import useSWR from 'swr';
import { LoadingState } from '../../framework/components/LoadingState';
import { setAwxApiPath } from '../../frontend/awx/common/api/awx-utils';
import { requestGet } from '../../frontend/common/crud/Data';
import { setEdaApiPath } from '../../frontend/eda/common/eda-utils';
import { setHubApiPath } from '../../frontend/hub/common/api/formatPath';

interface GatewayServices {
  gateway?: string;
  controller?: string;
  eda?: string;
  galaxy?: string;
}

export const GatewayServicesContext = createContext<GatewayServices | undefined>({});

export function useGatewayServices() {
  return useContext(GatewayServicesContext);
}

export function GatewayServicesProvider(props: { children: ReactNode }) {
  const [gatewayServices, setGatewayServices] = useState<GatewayServices>();
  const result = useSWR<{
    apis: {
      gateway?: string;
      controller?: string;
      eda?: string;
      galaxy?: string;
    };
  }>(`/api/`, requestGet);
  useLayoutEffect(() => {
    if (!result.data) {
      setGatewayServices({});
    } else {
      if (result.data.apis.controller) {
        let awxApiPath = result.data.apis.controller;
        if (awxApiPath.endsWith('/')) awxApiPath = awxApiPath.slice(0, -1);
        awxApiPath = awxApiPath + '/v2';
        setAwxApiPath(awxApiPath);
      }

      if (result.data.apis.eda) {
        let edaApiPath = result.data.apis.eda;
        if (edaApiPath.endsWith('/')) edaApiPath = edaApiPath.slice(0, -1);
        edaApiPath = edaApiPath + '/v1';
        setEdaApiPath(edaApiPath);
      }

      if (result.data.apis.galaxy) {
        let hubApiPath = result.data.apis.galaxy;
        if (hubApiPath.endsWith('/')) hubApiPath = hubApiPath.slice(0, -1);
        setHubApiPath(hubApiPath);
      }
      setGatewayServices(result.data.apis);
    }
  }, [result.data, setGatewayServices]);

  if (!gatewayServices) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  return (
    <GatewayServicesContext.Provider value={gatewayServices}>
      {props.children}
    </GatewayServicesContext.Provider>
  );
}

export function useGatewayService(serviceType?: 'gateway' | 'controller' | 'eda' | 'hub') {
  const services = useGatewayServices();
  if (!services) return undefined;
  switch (serviceType) {
    case 'controller':
      return services.controller;
    case 'eda':
      return services.eda;
    case 'hub':
      return services.galaxy;
    case 'gateway':
      return services.gateway;
    default:
      return undefined;
  }
}

export function useHasAwxService() {
  const gateway = useGatewayService('gateway');
  const awxService = useGatewayService('controller');
  if (gateway === undefined) return undefined;
  return awxService !== undefined;
}

export function useHasEdaService() {
  const gateway = useGatewayService('gateway');
  const edaService = useGatewayService('eda');
  if (gateway === undefined) return undefined;
  return edaService !== undefined;
}

export function useHasHubService() {
  const gateway = useGatewayService('gateway');
  const hubService = useGatewayService('hub');
  if (gateway === undefined) return undefined;
  return hubService !== undefined;
}
