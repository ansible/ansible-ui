import { createContext, ReactNode, useContext, useMemo } from 'react';
import { usePolledState } from '../../common/usePolledState';
import { Config } from '../interfaces/Config';
import { awxAPI } from './api/awx-utils';

const AwxConfigContext = createContext<{
  awxConfig?: Config | null | undefined;
  awxConfigIsLoading?: boolean;
  awxConfigError?: Error;
  refreshAwxConfig?: () => void;
}>({});

export function useAwxConfig() {
  return useContext(AwxConfigContext).awxConfig;
}

export function useAwxConfigState() {
  return useContext(AwxConfigContext);
}

export function AwxConfigProvider(props: { children?: ReactNode }) {
  const { data, error, refresh } = usePolledState<Config>(awxAPI`/config/`);
  const value = useMemo(
    () => ({
      awxConfig: data,
      awxConfigError: error,
      refreshAwxConfig: refresh,
    }),
    [data, error, refresh]
  );
  return <AwxConfigContext.Provider value={value}>{props.children}</AwxConfigContext.Provider>;
}
