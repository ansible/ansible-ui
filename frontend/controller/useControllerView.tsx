import { useRef } from 'react'
import useSWR from 'swr'
import { useSelected } from '../../framework/useTableItems'
import { IPagedView, usePagedView } from '../common/useView'
import { ItemsResponse, useFetcher } from '../Data'

export function useControllerView<T extends object>(url: string, getItemKey: (item: T) => string | number, pagedView?: IPagedView) {
    const view = usePagedView(pagedView)
    const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined })

    const { page, perPage, sort, sortDirection, filters } = view
    url += `?page=${page}`
    url += `&page_size=${perPage}`
    if (sort) {
        if (sortDirection === 'desc') {
            url += `&order_by=-${sort}`
        } else {
            url += `&order_by=${sort}`
        }
    }
    if (filters) {
        for (const key in filters) {
            url += `&${key}=${filters[key]}`
        }
    }
    const fetcher = useFetcher()
    const response = useSWR<ItemsResponse<T>>(url, fetcher)
    const { data } = response

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const error: Error | undefined = response.error

    const selection = useSelected(data?.results ?? [], getItemKey)

    if (data?.count !== undefined) {
        itemCountRef.current.itemCount = data?.count
    }

    return {
        itemCount: itemCountRef.current.itemCount,
        pageItems: data ? data.results : undefined,
        error,
        ...view,
        ...selection,
    }
}
