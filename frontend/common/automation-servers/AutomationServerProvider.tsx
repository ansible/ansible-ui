import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { AutomationServer, AutomationServerType } from './AutomationServer'

export const AutomationServersCompiler = TypeCompiler.Compile(Type.Array(AutomationServerType))

interface IAutomationServersContext {
  automationServers: AutomationServer[]
  setAutomationServers: Dispatch<SetStateAction<AutomationServer[]>>
  automationServer: AutomationServer | undefined
  setAutomationServer: Dispatch<SetStateAction<AutomationServer | undefined>>
}

const AutomationServersContext = createContext<IAutomationServersContext>({
  automationServers: [],
  setAutomationServers: () => null,
  automationServer: undefined,
  setAutomationServer: () => null,
})

export function AutomationServersProvider(props: { children: ReactNode }) {
  const [automationServers, setAutomationServers] =
    useState<AutomationServer[]>(loadAutomationServers)
  useEffect(() => saveAutomationServers(automationServers), [automationServers])

  const [automationServer, setAutomationServer] = useState<AutomationServer | undefined>(() => {
    const automationServers = loadAutomationServers()
    const url = localStorage.getItem('server')
    return automationServers.find((a) => a.url === url)
  })
  const state = useMemo<IAutomationServersContext>(
    () => ({ automationServers, setAutomationServers, automationServer, setAutomationServer }),
    [automationServer, automationServers]
  )
  return (
    <AutomationServersContext.Provider value={state}>
      {props.children}
    </AutomationServersContext.Provider>
  )
}

export function useAutomationServers() {
  return useContext(AutomationServersContext)
}

export function loadAutomationServers(): AutomationServer[] {
  const hostsString = localStorage.getItem('servers') ?? ''
  let servers: AutomationServer[]
  try {
    servers = JSON.parse(hostsString) as AutomationServer[]
  } catch {
    servers = []
  }
  if (!AutomationServersCompiler.Check(servers)) {
    servers = []
  }
  if (process.env.NODE_ENV === 'development') {
    servers.push({ name: 'Dev Controller', url: 'https://localhost:8043', type: 'controller' })
    servers.push({ name: 'Dev Hub', url: 'http://localhost:8002', type: 'hub' })
  }
  servers = servers.filter(
    (host, index, array) => array.findIndex((h) => h.url === host.url) === index
  )
  return servers
}

export function saveAutomationServers(ansibleProductHosts: AutomationServer[]) {
  localStorage.setItem('servers', JSON.stringify(ansibleProductHosts))
}
