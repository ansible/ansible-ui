import { Page } from '@patternfly/react-core';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import useSWR from 'swr';
import { LoadingState } from '../../framework/components/LoadingState';
import { setAwxApiPath } from '../../frontend/awx/common/api/awx-utils';
import { requestGet } from '../../frontend/common/crud/Data';
import { setEdaApiPath } from '../../frontend/eda/common/eda-utils';
import { setHubApiPath } from '../../frontend/hub/common/api/formatPath';
import { gatewayAPI } from '../api/gateway-api-utils';
import { GatewayService } from './GatewayService';

const GatewayServicesContext = createContext<
  [GatewayService[], Dispatch<SetStateAction<GatewayService[]>>]
>([
  [],
  () => {
    throw new Error('GatewayServicesProvider not found');
  },
]);

function useGatewayServices() {
  return useContext(GatewayServicesContext);
}

/**
 * The GatewayServicesProvider provides a list of GatewayServices to the application.
 *
 * It sits at the top of the application because it is needed by the navigation.
 * It is then initialized by the GatewayServices component after login, which fetches the list of services from the API.
 */
export function GatewayServicesProvider(props: { children: ReactNode }) {
  const state = useState<GatewayService[]>([]);
  return (
    <GatewayServicesContext.Provider value={state}>
      {props.children}
    </GatewayServicesContext.Provider>
  );
}

/**
 * The GatewayServices component fetches the list of GatewayServices from the API and stores them in the GatewayServicesProvider.
 */
export function GatewayServices(props: { children: ReactNode }) {
  const [_gatewayServices, setGatewayServices] = useGatewayServices();
  const result = useSWR<{ results: GatewayService[] }>(gatewayAPI`/services/`, requestGet);
  useLayoutEffect(() => {
    if (!result.data) {
      setGatewayServices([]);
    } else {
      const awxService = result.data.results.find(
        (service) => service.summary_fields?.service_cluster?.service_type === 'controller'
      );
      if (awxService) {
        setAwxApiPath(awxService.gateway_path + 'v2/');
      }

      const edaService = result.data.results.find(
        (service) => service.summary_fields?.service_cluster?.service_type === 'eda'
      );
      if (edaService) {
        setEdaApiPath(edaService.gateway_path + 'v1/');
      }

      const hubService = result.data.results.find(
        (service) => service.summary_fields?.service_cluster?.service_type === 'hub'
      );
      if (hubService) {
        let hub_path = hubService.gateway_path;
        if (hub_path.endsWith('/')) {
          hub_path = hub_path.slice(0, -1);
        }
        setHubApiPath(hub_path);
      }

      setGatewayServices(result.data.results);
    }
  }, [result.data, setGatewayServices]);
  if (result.isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }
  return props.children;
}

export function useGatewayService(serviceType?: 'controller' | 'eda' | 'hub') {
  const [services] = useGatewayServices();
  return useMemo(() => {
    return services?.find(
      (service) => service.summary_fields?.service_cluster?.service_type === serviceType
    );
  }, [serviceType, services]);
}

export function useAwxService() {
  return useGatewayService('controller');
}

export function useEdaService() {
  return useGatewayService('eda');
}

export function useHubService() {
  return useGatewayService('hub');
}
