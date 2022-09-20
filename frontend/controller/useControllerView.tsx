import { HTTPError } from 'ky'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import useSWR from 'swr'
import { ITableColumn, IToolbarFilter } from '../../framework'
import { useSelected } from '../../framework/useTableItems'
import { IView, useView } from '../common/useView'
import { getItemKey, ItemsResponse, swrOptions, useFetcher } from '../Data'

export type IControllerView<T extends { id: number }> = IView & {
    itemCount: number | undefined
    keyFn: (item: T) => string | number
    pageItems: T[] | undefined
    setPage: (page: number) => void
    setPerPage: (perPage: number) => void
    selectedItems: T[]
    unselectAll: () => void
}

export function useControllerView<T extends { id: number }>(
    url: string,
    toolbarFilters?: IToolbarFilter[],
    tableColumns?: ITableColumn<T>[]
) {
    const view = useView({ sort: tableColumns && tableColumns.length ? tableColumns[0].sort : undefined })
    const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined })

    const { page, perPage, sort, sortDirection, filters } = view

    let queryString = ''

    if (filters) {
        for (const key in filters) {
            const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key)
            if (toolbarFilter) {
                const values = filters[key]
                if (values.length > 0) {
                    queryString ? (queryString += '&') : (queryString += '?')
                    if (values.length > 1) {
                        queryString += values.map((value) => `or__${toolbarFilter.query}=${value}`).join('&')
                    } else {
                        queryString += `${toolbarFilter.query}=${values.join(',')}`
                    }
                }
            }
        }
    }

    if (sort) {
        queryString ? (queryString += '&') : (queryString += '?')
        if (sortDirection === 'desc') {
            queryString += `order_by=-${sort}`
        } else {
            queryString += `order_by=${sort}`
        }
    }

    queryString ? (queryString += '&') : (queryString += '?')
    queryString += `page=${page}`

    queryString ? (queryString += '&') : (queryString += '?')
    queryString += `page_size=${perPage}`

    url += queryString
    const fetcher = useFetcher()
    const response = useSWR<ItemsResponse<T>>(url, fetcher)
    const { data, mutate } = response
    const refresh = useCallback(() => mutate(), [mutate])

    useSWR<ItemsResponse<T>>(data?.next, fetcher, swrOptions)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let error: Error | undefined = response.error
    if (error instanceof HTTPError) {
        if (error.response.status === 404 && view.page > 1) {
            view.setPage(1)
            error = undefined
        }
    }

    const selection = useSelected(data?.results ?? [], getItemKey)

    if (data?.count !== undefined) {
        itemCountRef.current.itemCount = data?.count
    }

    useEffect(() => {
        console.log('selection')
    }, [selection])

    return useMemo(() => {
        return {
            refresh,
            itemCount: itemCountRef.current.itemCount,
            pageItems: data ? data.results : undefined,
            error,
            ...view,
            ...selection,
        }
    }, [data, error, refresh, selection, view])
}

export async function getControllerError(err: unknown) {
    if (err instanceof HTTPError) {
        try {
            const response = (await err.response.json()) as { __all__?: string[] }
            if ('__all__' in response && Array.isArray(response.__all__)) {
                return JSON.stringify(response.__all__[0])
            } else {
                return JSON.stringify(response)
            }
        } catch {
            return err.message
        }
    } else if (err instanceof Error) {
        return err.message
    } else {
        return 'unknown error'
    }
}
