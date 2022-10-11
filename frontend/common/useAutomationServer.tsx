import { Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import deepEqual from 'fast-deep-equal'
import { useCallback, useEffect, useState } from 'react'

const AutomationServerType = Type.Object({
    name: Type.String(),
    url: Type.String(),
    type: Type.Union([Type.Literal('controller'), Type.Literal('hub')]),
    username: Type.Optional(Type.String()),
})

export type AutomationServer = Static<typeof AutomationServerType>

const AutomationServersCompiler = TypeCompiler.Compile(Type.Array(AutomationServerType))

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
        servers.push({ name: 'Localhost Automation Controller', url: 'https://localhost:8043', type: 'controller' })
    }
    servers = servers.filter((host, index, array) => array.findIndex((h) => h.url === host.url) === index)
    return servers
}

export function saveAutomationServers(ansibleProductHosts: AutomationServer[]) {
    localStorage.setItem('servers', JSON.stringify(ansibleProductHosts))
}

export function useAutomationServers() {
    const [automationServers, setAutomationServers] = useState<AutomationServer[]>(() => loadAutomationServers())
    const refreshAutomationServers = useCallback(() => {
        setAutomationServers((servers) => {
            const newHosts = loadAutomationServers()
            if (!deepEqual(servers, newHosts)) {
                return newHosts
            } else {
                return servers
            }
        })
    }, [])
    useEffect(() => () => clearInterval(setInterval(() => refreshAutomationServers(), 1000)), [refreshAutomationServers])
    const saveAutomationServer = useCallback((ansibleProductHost: AutomationServer) => {
        setAutomationServers((productHosts) => {
            productHosts = [...productHosts, ansibleProductHost]
            saveAutomationServers(productHosts)
            return productHosts
        })
    }, [])
    return { automationServers, refreshAutomationServers, saveAutomationServer }
}
