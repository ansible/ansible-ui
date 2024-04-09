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

export function GatewayServicesProvider(props: { children: ReactNode }) {
  const [gatewayServices, setGatewayServices] = useState<GatewayService[]>([]);
  const result = useSWR<{ results: GatewayService[] }>(gatewayAPI`/services/`, requestGet);
  useLayoutEffect(() => {
    if (!result.data) {
      setGatewayServices([]);
    } else {
      const awxService = result.data.results.find(
        (service) => service.summary_fields?.service_cluster?.service_type === 'controller'
      );
      if (awxService) {
        let awxApiPath = awxService.gateway_path;
        if (awxApiPath.endsWith('/')) awxApiPath = awxApiPath.slice(0, -1);
        awxApiPath = awxApiPath + '/v2';
        setAwxApiPath(awxApiPath);
      }

      const edaService = result.data.results.find(
        (service) => service.summary_fields?.service_cluster?.service_type === 'eda'
      );
      if (edaService) {
        let edaApiPath = edaService.gateway_path;
        if (edaApiPath.endsWith('/')) edaApiPath = edaApiPath.slice(0, -1);
        edaApiPath = edaApiPath + '/v1';
        setEdaApiPath(edaApiPath);
      }

      const hubService = result.data.results.find(
        (service) => service.summary_fields?.service_cluster?.service_type === 'hub'
      );
      if (hubService) {
        let hubApiPath = hubService.gateway_path;
        if (hubApiPath.endsWith('/')) hubApiPath = hubApiPath.slice(0, -1);
        setHubApiPath(hubApiPath);
      }

      const services = result.data.results;
      // Debug code to test different service being available/unavailable
      // services = services.filter((service) => {
      //   switch (service.summary_fields?.service_cluster?.service_type) {
      //     case 'controller':
      //       return true;
      //     case 'eda':
      //       return true;
      //     case 'hub':
      //       return true;
      //     default:
      //       return true;
      //   }
      // });
      setGatewayServices(services);
    }
  }, [result.data, setGatewayServices]);

  return (
    <GatewayServicesContext.Provider value={[gatewayServices, setGatewayServices]}>
      {props.children}
    </GatewayServicesContext.Provider>
  );
}

export function GatewayServicesCheck(props: { children: ReactNode }) {
  const [services] = useGatewayServices();
  if (!services.length) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }
  return <>{props.children}</>;
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
