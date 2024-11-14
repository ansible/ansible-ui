import { requestGet } from '@ansible/common-ui/crud/Data';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { ReactNode, createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { Config } from '../interfaces/Config';
import { awxAPI } from './api/awx-utils';

const AwxConfigContext = createContext<{
  awxConfig?: Config | null | undefined;
  awxConfigError?: Error;
  serviceDown?: boolean;
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
  if (
    response.error instanceof RequestError &&
    response.error.statusCode >= 400 &&
    response.error.statusCode < 500
  ) {
    serviceDown = true;
  }
  const value = useMemo(
    () => ({
      awxConfig: response.data,
      awxConfigError: response.error as Error,
      serviceDown,
      refreshAwxConfig: () => response.mutate(undefined),
    }),
    [response, serviceDown]
  );
  return <AwxConfigContext.Provider value={value}>{props.children}</AwxConfigContext.Provider>;
}
