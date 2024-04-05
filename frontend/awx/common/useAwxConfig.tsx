<<<<<<< HEAD
import { ReactNode, createContext, useContext, useMemo } from 'react';
=======
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
>>>>>>> 8269c803c (Login Flow Update (#1946))
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

export function AwxConfigProvider(props: { children?: ReactNode }) {
<<<<<<< HEAD
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
=======
  const [config, setConfig] = useState<Config | null | undefined>(undefined);
  const configResponse = useSWR<Config>(awxAPI`/config/`, requestGet);
  useEffect(() => {
    if (configResponse.data) {
      setConfig(configResponse.data ?? null);
    }
  }, [configResponse.data]);
  return <AwxConfigContext.Provider value={config}>{props.children}</AwxConfigContext.Provider>;
>>>>>>> 8269c803c (Login Flow Update (#1946))
}
