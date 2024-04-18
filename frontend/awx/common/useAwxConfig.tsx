import { createContext, ReactNode, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../common/crud/Data';
import { Config } from '../interfaces/Config';
import { awxAPI } from './api/awx-utils';

const AwxConfigContext = createContext<{
  awxConfig?: Config;
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
  const configResponse = useSWR<Config>(awxAPI`/config/`, requestGet);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { isLoading, error, data, mutate } = configResponse;
  const value = useMemo(
    () => ({
      awxConfig: data,
      awxConfigIsLoading: isLoading || (!data && !error),
      awxConfigError: error
        ? error instanceof Error
          ? error
          : new Error('Failed to load AWX config')
        : undefined,
      refreshAwxConfig: () => void mutate(undefined),
    }),
    [data, error, isLoading, mutate]
  );
  return <AwxConfigContext.Provider value={value}>{props.children}</AwxConfigContext.Provider>;
}
