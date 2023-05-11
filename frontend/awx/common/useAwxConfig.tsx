import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Config } from '../interfaces/Config';
import { useGet } from '../../common/crud/useGet';

const AwxConfigContext = createContext<Config | null | undefined>(undefined);

/**
 * Get the AWX configuration settings
 * @returns undefined while querying, null if no data was retrieved, otherwise the configuration.
 */
export function useAwxConfig() {
  return useContext(AwxConfigContext);
}

export function AwxConfigProvider(props: { children?: ReactNode }) {
  const [config, setConfig] = useState<Config | null | undefined>(undefined);
  const configResponse = useGet<Config>('/api/v2/config/');
  useEffect(() => {
    if (configResponse.data) {
      setConfig(configResponse.data ?? null);
    }
  }, [configResponse.data]);
  return <AwxConfigContext.Provider value={config}>{props.children}</AwxConfigContext.Provider>;
}
