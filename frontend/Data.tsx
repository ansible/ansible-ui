/* eslint-disable no-console */
import ky, { HTTPError, ResponsePromise } from 'ky'
import { Input, Options } from 'ky/distribution/types/options'
import { SWRConfiguration } from 'swr'

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

export interface ItemsResponse<T> {
    count: number
    next?: string | null
    previous?: string | null
    results: T[]
}

export function getItemKey(item: { id: number }) {
    return item.id.toString()
}

export const swrOptions: SWRConfiguration = {
    dedupingInterval: 0,
}
