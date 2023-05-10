import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AutomationServer } from '../interfaces/AutomationServer';

interface IAutomationServersContext {
  automationServers: AutomationServer[];
  setAutomationServers: Dispatch<SetStateAction<AutomationServer[]>>;
  automationServer: AutomationServer | undefined;
  setAutomationServer: Dispatch<SetStateAction<AutomationServer | undefined>>;
}

const AutomationServersContext = createContext<IAutomationServersContext>({
  automationServers: [],
  setAutomationServers: () => null,
  automationServer: undefined,
  setAutomationServer: () => null,
});

export function AutomationServersProvider(props: { children: ReactNode }) {
  const [automationServers, setAutomationServers] =
    useState<AutomationServer[]>(loadAutomationServers);
  useEffect(() => saveAutomationServers(automationServers), [automationServers]);

  const [automationServer, setAutomationServer] = useState<AutomationServer | undefined>(() => {
    const automationServers = loadAutomationServers();
    const url = localStorage.getItem('server');
    return automationServers.find((a) => a.url === url);
  });
  const state = useMemo<IAutomationServersContext>(
    () => ({ automationServers, setAutomationServers, automationServer, setAutomationServer }),
    [automationServer, automationServers]
  );
  return (
    <AutomationServersContext.Provider value={state}>
      {props.children}
    </AutomationServersContext.Provider>
  );
}

export function useAutomationServers() {
  return useContext(AutomationServersContext);
}

export function loadAutomationServers(): AutomationServer[] {
  const hostsString = localStorage.getItem('servers') ?? '';
  let servers: AutomationServer[];
  try {
    servers = JSON.parse(hostsString) as AutomationServer[];
  } catch {
    servers = [];
  }
  servers = servers.filter(
    (host, index, array) => array.findIndex((h) => h.url === host.url) === index
  );
  servers.sort((l, r) => l.name.localeCompare(r.name));
  return servers;
}

export function saveAutomationServers(ansibleProductHosts: AutomationServer[]) {
  localStorage.setItem('servers', JSON.stringify(ansibleProductHosts));
}
