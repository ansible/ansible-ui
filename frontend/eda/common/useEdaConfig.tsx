import { createContext, useContext } from 'react';
import { Config } from '@ansible/common-ui/interfaces/Config';

const EdaConfigContext = createContext<{
  edaConfig?: Config | null | undefined;
  edaConfigError?: Error;
  serviceDown?: boolean;
  refreshEdaConfig?: () => void;
}>({});

export function useEdaConfig() {
  return useContext(EdaConfigContext).edaConfig;
}
