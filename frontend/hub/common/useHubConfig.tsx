import { createContext, useContext } from 'react';
import { Config } from '@ansible/common-ui/interfaces/Config';

const HubConfigContext = createContext<{
  hubConfig?: Config | null | undefined;
  hubConfigError?: Error;
  serviceDown?: boolean;
  refreshHubConfig?: () => void;
}>({});

export function useHubConfig() {
  return useContext(HubConfigContext).hubConfig;
}
