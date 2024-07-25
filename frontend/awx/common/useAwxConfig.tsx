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

export function AwxConfigProvider(props: {
  children: ReactNode;
  disabled?: boolean;
  platformVersion?: string;
}) {
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
    <AwxConfigProviderInternal platformVersion={props.platformVersion}>
      {props?.children}
    </AwxConfigProviderInternal>
  );
}

export function AwxConfigProviderInternal(props: {
  children?: ReactNode;
  platformVersion?: string;
}) {
  const { platformVersion } = props;
  const response = useSWR<Config>(awxAPI`/config/`, requestGet);
  const value = useMemo(
    () => ({
      awxConfig: {
        ...(response.data as Config),
        platformVersion,
      },
      awxConfigError: response.error as Error,
      refreshAwxConfig: () => response.mutate(undefined),
    }),
    [response, platformVersion]
  );
  return <AwxConfigContext.Provider value={value}>{props.children}</AwxConfigContext.Provider>;
}
