import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { AutomationServer } from './AutomationServer';
import { useIndexedDbItems } from './IndexDb';

/**
 * Global variable to store the active automation server
 *
 * Used by the Hub code to determine which server to use for API calls
 */
export let activeAutomationServer: AutomationServer | undefined;

interface ActiveAutomationServersState {
  automationServers: AutomationServer[];
  activeAutomationServer: AutomationServer | undefined;
}

const AutomationServersContext = createContext<ActiveAutomationServersState>({
  automationServers: [],
  activeAutomationServer: undefined,
});

export function AutomationServersProvider(props: { children: ReactNode }) {
  const automationServers = useIndexedDbItems('servers');

  const [activeAutomationServer2, setActiveAutomationServer] = useState<
    AutomationServer | undefined
  >();

  useEffect(() => {
    if (automationServers) {
      for (const server of automationServers) {
        if (server.isActive) {
          activeAutomationServer = server;
          setActiveAutomationServer(server);
          return;
        }
      }
    }
    activeAutomationServer = undefined;
    setActiveAutomationServer(undefined);
  }, [automationServers]);

  const value = useMemo<ActiveAutomationServersState>(
    () => ({
      automationServers: automationServers ?? [],
      activeAutomationServer: activeAutomationServer2,
    }),
    [automationServers, activeAutomationServer2]
  );

  return (
    <AutomationServersContext.Provider value={value}>
      {props.children}
    </AutomationServersContext.Provider>
  );
}

export function useAutomationServers() {
  const state = useContext(AutomationServersContext);
  return state.automationServers;
}

export function useActiveAutomationServer() {
  const state = useContext(AutomationServersContext);
  return state.activeAutomationServer;
}
