import { requestGet } from '@ansible/common-ui/crud/Data';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { ReactNode, createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { Config } from '@ansible/common-ui/interfaces/Config';
import { awxAPI } from './api/awx-utils';

const AwxConfigContext = createContext<{
  awxConfig?: Config | null | undefined;
  awxConfigError?: Error;
  serviceDown?: boolean;
  serviceDownStatusCode?: number;
  refreshAwxConfig?: () => void;
}>({});

export function useAwxConfig() {
  return useContext(AwxConfigContext).awxConfig;
}

export function useAwxConfigState() {
  return useContext(AwxConfigContext);
}

export function AwxConfigProvider(props: { children: ReactNode; disabled?: boolean }) {
  return props?.disabled ? (
    <AwxConfigContext.Provider
      value={{
        awxConfig: undefined,
        awxConfigError: undefined,
        refreshAwxConfig: undefined,
      }}
    >
      {props.children}
    </AwxConfigContext.Provider>
  ) : (
    <AwxConfigProviderInternal>{props?.children}</AwxConfigProviderInternal>
  );
}

export function AwxConfigProviderInternal(props: { children?: ReactNode }) {
  const response = useSWR<Config>(awxAPI`/config/`, requestGet);
  let serviceDown = false;
  let serviceDownStatusCode: number | undefined;
  if (response.error instanceof RequestError && response.error.statusCode >= 400) {
    serviceDown = true;
    serviceDownStatusCode = response.error.statusCode;
  }
  const value = useMemo(
    () => ({
      awxConfig: response.data,
      awxConfigError: response.error as Error,
      serviceDown,
      serviceDownStatusCode,
      refreshAwxConfig: () => response.mutate(undefined),
    }),
    [response, serviceDown, serviceDownStatusCode]
  );
  return <AwxConfigContext.Provider value={value}>{props.children}</AwxConfigContext.Provider>;
}
