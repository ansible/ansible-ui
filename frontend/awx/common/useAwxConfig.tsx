import { ReactNode, createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../common/crud/Data';
import { Config } from '../interfaces/Config';
import { awxAPI } from './api/awx-utils';

const AwxConfigContext = createContext<{
  awxConfig?: Config | null | undefined;
  awxConfigError?: Error;
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
  const value = useMemo(
    () => ({
      awxConfig: response.data,
      awxConfigError: response.error as Error,
      refreshAwxConfig: () => response.mutate(undefined),
    }),
    [response]
  );
  return <AwxConfigContext.Provider value={value}>{props.children}</AwxConfigContext.Provider>;
}
