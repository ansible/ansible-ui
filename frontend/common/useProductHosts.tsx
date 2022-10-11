import { Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import deepEqual from 'fast-deep-equal'
import { useCallback, useState } from 'react'

const ProductHostType = Type.Object({
    name: Type.String(),
    url: Type.String(),
    type: Type.Union([Type.Literal('controller'), Type.Literal('hub')]),
    username: Type.Optional(Type.String()),
})

export type ProductHost = Static<typeof ProductHostType>

const ProductHostsCompiler = TypeCompiler.Compile(Type.Array(ProductHostType))

export function loadProductHosts(): ProductHost[] {
    const hostsString = localStorage.getItem('hosts') ?? ''
    let hosts: ProductHost[]
    try {
        hosts = JSON.parse(hostsString) as ProductHost[]
    } catch {
        hosts = []
    }
    if (!ProductHostsCompiler.Check(hosts)) {
        hosts = []
    }
    if (process.env.NODE_ENV === 'development') {
        hosts.push({ name: 'Localhost Contoller', url: 'https://localhost:8043', type: 'controller' })
    }
    hosts = hosts.filter((host, index, array) => array.findIndex((h) => h.url === host.url) === index)
    return hosts
}

export function saveProductHosts(ansibleProductHosts: ProductHost[]) {
    localStorage.setItem('hosts', JSON.stringify(ansibleProductHosts))
}

export function useProductHosts() {
    const [productHosts, setProductHosts] = useState<ProductHost[]>(() => loadProductHosts())
    const refreshProductHosts = useCallback(() => {
        setProductHosts((ansibleProductHosts) => {
            const newHosts = loadProductHosts()
            if (!deepEqual(ansibleProductHosts, newHosts)) {
                return newHosts
            } else {
                return ansibleProductHosts
            }
        })
    }, [])
    const saveProductHost = useCallback((ansibleProductHost: ProductHost) => {
        setProductHosts((productHosts) => {
            productHosts = [...productHosts, ansibleProductHost]
            saveProductHosts(productHosts)
            return productHosts
        })
    }, [])
    return { productHosts, refreshProductHosts, saveProductHost }
}
