import { useRef } from 'react'
import useSWR from 'swr'
import { ITableColumn } from '../../framework'
import { IToolbarFilter } from '../../framework/PageToolbar'
import { useSelected } from '../../framework/useTableItems'
import { usePagedView } from '../common/useView'
import { ItemsResponse, useFetcher } from '../Data'

export function useControllerView<T extends object>(
    url: string,
    getItemKey: (item: T) => string | number,
    toolbarFilters?: IToolbarFilter[],
    tableColumns?: ITableColumn<T>[]
) {
    const view = usePagedView({ sort: tableColumns && tableColumns.length ? tableColumns[0].sort : undefined })
    const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined })

    const { page, perPage, sort, sortDirection, filters } = view
    let queryString = '?'
    if (sort) {
        if (sortDirection === 'desc') {
            queryString += `order_by=-${sort}`
        } else {
            queryString += `order_by=${sort}`
        }
        queryString += '&'
    }
    queryString += `page=${page}`
    queryString += `&page_size=${perPage}`
    if (filters) {
        for (const key in filters) {
            const filter = toolbarFilters?.find((filter) => filter.key === key)
            if (filter) {
                const values = filters[key]
                url += `&${filter.query}=${values.join(',')}`
            }
        }
    }
    url += queryString
    const fetcher = useFetcher()
    const response = useSWR<ItemsResponse<T>>(url, fetcher)
    const { data } = response
    useSWR<ItemsResponse<T>>(data?.next, fetcher)

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
