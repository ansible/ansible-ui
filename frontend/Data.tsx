/* eslint-disable no-console */
import ky, { HTTPError, ResponsePromise } from 'ky'
import { Input, Options } from 'ky/distribution/types/options'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

export const headers: Record<string, string> = {}

function initHeaders() {
    const server = localStorage.getItem('server')
    if (typeof server === 'string') {
        headers['x-server'] = server
    }
}
initHeaders()

export async function requestHead<ResponseBody>(url: string): Promise<ResponseBody> {
    return requestCommon<ResponseBody>(url, {}, ky.head)
}

export async function requestOptions<ResponseBody>(url: string): Promise<ResponseBody> {
    return requestCommon<ResponseBody>(url, { method: 'OPTIONS' }, ky.get)
}

export async function requestGet<ResponseBody>(url: string): Promise<ResponseBody> {
    return requestCommon<ResponseBody>(url, {}, ky.get)
}

export async function requestPut<ResponseBody, RequestBody = unknown>(url: string, json: RequestBody): Promise<ResponseBody> {
    return requestCommon<ResponseBody>(url, { json }, ky.put)
}

export async function requestPost<ResponseBody, RequestBody = unknown>(url: string, json: RequestBody): Promise<ResponseBody> {
    return requestCommon<ResponseBody>(url, { json }, ky.post)
}

export async function requestPatch<ResponseBody, RequestBody = unknown>(url: string, json: RequestBody): Promise<ResponseBody> {
    return requestCommon<ResponseBody>(url, { json }, ky.patch)
}

export async function requestDelete<ResponseBody>(url: string): Promise<ResponseBody> {
    return requestCommon<ResponseBody>(url, {}, ky.delete)
}

async function requestCommon<ResponseBody>(url: string, options: Options, methodFn: (input: Input, options: Options) => ResponsePromise) {
    if (process.env.DELAY) await new Promise((resolve) => setTimeout(resolve, Number(process.env.DELAY)))
    try {
        const result = await methodFn(url, {
            ...options,
            credentials: 'include',
            headers: { ...headers, ...(options.headers ?? {}) },
        }).json<ResponseBody>()
        // if (process.env.NODE_ENV === 'development') {
        //     console.debug(result)
        // }
        return result
    } catch (err) {
        // if (process.env.NODE_ENV === 'development') {
        //     console.error(err)
        // }
        if (err instanceof HTTPError) {
            switch (err.response.status) {
                case 401:
                    location.replace('/login')
                    break
            }
        }
        throw err
    }
}

export function useFetcher() {
    return requestGet
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
    const { data } = useSWR<IOptions>(url, requestOptions)
    return data
}

export function useItems<T extends IItem>(api: string) {
    const fetcher = useFetcher()
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
