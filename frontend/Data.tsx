import ky from 'ky'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { RouteE } from './route'

export const headers: Record<string, string> = {
    'x-server': localStorage.getItem('server'),
}

export async function getUrl<ResponseBody>(url: string): Promise<ResponseBody> {
    if (process.env.DELAY) await new Promise((resolve) => setTimeout(resolve, Number(process.env.DELAY)))
    return ky.get(url, { credentials: 'include', headers }).json<ResponseBody>()
}

export async function putUrl<ResponseBody, RequestBody = unknown>(url: string, data: RequestBody): Promise<ResponseBody> {
    if (process.env.DELAY) await new Promise((resolve) => setTimeout(resolve, Number(process.env.DELAY)))
    return ky.put(url, { json: data, credentials: 'include', headers }).json<ResponseBody>()
}

export async function postUrl<ResponseBody, RequestBody = unknown>(url: string, data: RequestBody): Promise<ResponseBody> {
    if (process.env.DELAY) await new Promise((resolve) => setTimeout(resolve, Number(process.env.DELAY)))
    return ky.post(url, { json: data, credentials: 'include', headers }).json<ResponseBody>()
}

export async function patchUrl<ResponseBody, RequestBody = unknown>(url: string, data: RequestBody): Promise<ResponseBody> {
    if (process.env.DELAY) await new Promise((resolve) => setTimeout(resolve, Number(process.env.DELAY)))
    return ky.patch(url, { json: data, credentials: 'include', headers }).json<ResponseBody>()
}

export async function deleteUrl<ResponseBody>(url: string): Promise<ResponseBody> {
    if (process.env.DELAY) await new Promise((resolve) => setTimeout(resolve, Number(process.env.DELAY)))
    return ky.delete(url, { credentials: 'include', headers }).json<ResponseBody>()
}

export function useFetcher() {
    const history = useHistory()
    return async function fetcher(url: string) {
        if (process.env.DELAY) await new Promise((resolve) => setTimeout(resolve, Number(process.env.DELAY)))
        return fetch(url, { headers }).then(async (res) => {
            if (!res.ok) {
                switch (res.status) {
                    case 401:
                        history.push(RouteE.Login)
                        return
                }
                const error = new Error(res.statusText)
                // Attach extra info to the error object.
                error.info = await res.json()
                error.status = res.status
                throw error
            }
            return res.json()
        })
    }
}
export async function fetcher(url: string) {
    if (process.env.NODE_ENV === 'development') await new Promise((resolve) => setTimeout(resolve, 2000))
    return fetch(url, { headers })
        .then((res) => res.json())
        .catch(() => [])
}

export async function fetchOptions(url: string) {
    return fetch(url, { method: 'OPTIONS', headers }).then((res) => res.json())
}

export interface IOptionsString {
    type: 'string'
    label: 'string'
    filterable: boolean
}

export interface IOptionsId {
    type: 'id'
    label: 'string'
    filterable: boolean
}

export interface IOptionsDateTime {
    type: 'datetime'
    label: 'string'
    filterable: boolean
}

export interface IOptionsChoice {
    type: 'choice'
    label: 'string'
    filterable: boolean
    choices: string[][]
}

export interface IOptions {
    actions: { GET: Record<string, IOptionsString | IOptionsDateTime | IOptionsChoice | IOptionsId> }
}

export function useOptions(url: string) {
    const { data } = useSWR<IOptions>(url, fetchOptions)
    return data
}

export function useItems<T extends IItem>(api: string) {
    function getKey(pageIndex: number, previousPageData: ItemsResponse<unknown>) {
        if (previousPageData && !previousPageData.next) return null
        return `/api/v2/${api}/?page=${pageIndex + 1}&page_size=100`
    }
    const { data } = useSWRInfinite<ItemsResponse<T>>(getKey, fetcher, { initialSize: 9999, suspense: true })
    return {
        items:
            data?.reduce((items, page) => {
                if (Array.isArray(page.results)) {
                    return [...items, ...page.results]
                }
                return items
            }, [] as T[]) ?? [],
        loading: data === undefined,
    }
}

export function useItem<T extends IItem>(id: number | undefined, api: string) {
    const { items } = useItems<T>(api)
    const [item, setItem] = useState<T | null>()
    useEffect(() => {
        const item = items.find((item) => item.id === id)
        if (!item) {
            setItem(null)
            return
        }
        setItem(item) // TODO only update item is item changed
    }, [id, items])
    if (!id) return null
    return item
}

export interface ItemsResponse<T> {
    count: number
    next?: string | null
    previous?: string | null
    results: T[]
}

export interface IItem {
    id: number
    type: string
    url: string
    modified: string
    created: string
}

export function getItemKey(item: { id: number }) {
    return item.id.toString()
}
