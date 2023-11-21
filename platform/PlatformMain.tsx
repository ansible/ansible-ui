import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { PageApp } from '../framework/PageNavigation/PageApp';
import { AwxConfigProvider } from '../frontend/awx/common/useAwxConfig';
import { WebSocketProvider } from '../frontend/awx/common/useAwxWebSocket';
import { ActiveEdaUserProvider, ActiveUserProvider } from '../frontend/common/useActiveUser';
import { HubContextProvider } from '../frontend/hub/useHubContext';
import { PlatformLogin } from './PlatformLogin';
import { PlatformMasthead } from './PlatformMasthead';
import { ActivePlatformUserProvider } from './hooks/useActivePlatformUser';
import { usePlatformNavigation } from './usePlatformNavigation';
import type { Service } from './interfaces/Service';
import { requestCommon } from '../frontend/common/crud/requestCommon';
import { useAbortController } from '../frontend/common/crud/useAbortController';
import useSWR from 'swr';
import { createRequestError } from '../frontend/common/crud/RequestError';
import '../frontend/common/i18n';
import { gatewayAPI } from './api/gateway-api-utils';

export default function PlatformMain() {
  const { data: services } = useServices();
  const navigation = usePlatformNavigation(services || []);

  return (
    <PageApp
      login={<PlatformLogin />}
      root={
        <WebSocketProvider>
          <ActivePlatformUserProvider>
            <ActiveUserProvider>
              <AwxConfigProvider>
                <HubContextProvider>
                  <ActiveEdaUserProvider>
                    <Outlet />
                  </ActiveEdaUserProvider>
                </HubContextProvider>
              </AwxConfigProvider>
            </ActiveUserProvider>
          </ActivePlatformUserProvider>
        </WebSocketProvider>
      }
      masthead={<PlatformMasthead />}
      navigation={navigation}
    />
  );
}

type ServicesResponse = {
  results: Service[];
};

function useServices() {
  const abortController = useAbortController();
  const getServices = async (
    url: string,
    query?: Record<string, string | number | boolean>,
    signal?: AbortSignal
  ) => {
    const response = await requestCommon({
      url,
      method: 'GET',
      signal: signal ?? abortController.signal,
    });
    if (!response.ok) {
      throw await createRequestError(response);
    }
    return (await response.json()) as ServicesResponse;
  };

  const response = useSWR<ServicesResponse>(gatewayAPI`/v1/services`, getServices, {
    dedupingInterval: 0,
  });

  return useMemo(() => {
    let error = response.error as Error;
    if (error && !(error instanceof Error)) {
      error = new Error('Unknown error');
    }
    return {
      data: response.data?.results || [],
      error: response.isLoading ? undefined : error,
      refresh: () => void response.mutate(),
      isLoading: response.isLoading,
    };
  }, [response]);
}
