import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface IView {
    page: number
    perPage: number
    sort: string
    sortDirection: 'asc' | 'desc'
    filters: Record<string, string[]>
    setFilters: Dispatch<SetStateAction<Record<string, string[]>>>
}

export function useView(view?: Partial<IView>) {
    const [searchParams, setSearchParams] = useSearchParams()

    const [page, setPage] = useState(() => {
        const queryPage = searchParams.get('page')
        if (queryPage) {
            const page = Number(queryPage)
            if (Number.isInteger(page)) {
                return page
            }
        }
        return view?.page ?? 1
    })

    const [perPage, setPerPage] = useState(() => {
        const queryPerPage = searchParams.get('perPage')
        if (queryPerPage) {
            const perPage = Number(queryPerPage)
            if (Number.isInteger(perPage)) {
                return perPage
            }
        }
        return view?.perPage ?? 10
    })

    const [sort, setSort] = useState(() => {
        const querySort = searchParams.get('sort')
        if (querySort) {
            if (querySort.startsWith('-')) return querySort.slice(1)
            return querySort
        }
        return view?.sort ?? ''
    })

    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
        const querySort = searchParams.get('sort')
        if (querySort) {
            if (querySort.startsWith('-')) return 'desc'
            return 'asc'
        }
        return view?.sortDirection ?? 'asc'
    })

    const [filters, setFilters] = useState<Record<string, string[]>>(() => {
        const filters: Record<string, string[]> = {}
        for (const key of searchParams.keys()) {
            switch (key) {
                case 'sort':
                    break
                default: {
                    const value = searchParams.get(key)
                    if (value) {
                        const values = value.split(',')
                        filters[key] = values
                    }
                }
            }
        }
        if (Object.keys(filters)) return filters
        return view?.filters ?? {}
    })

    const clearAllFilters = useCallback(() => setFilters({}), [setFilters])

    useEffect(() => {
        setSearchParams((searchParams) => {
            sortDirection === 'asc' ? searchParams.set('sort', sort) : searchParams.set('sort', `-${sort}`)
            return searchParams
        })
    }, [sort, sortDirection, setSearchParams])

    useEffect(() => {
        setSearchParams((searchParams) => {
            searchParams.set('page', page.toString())
            return searchParams
        })
    }, [page, setSearchParams])

    useEffect(() => {
        setSearchParams((searchParams) => {
            searchParams.set('perPage', perPage.toString())
            return searchParams
        })
    }, [perPage, setSearchParams])

    useEffect(() => {
        setSearchParams((searchParams) => {
            for (const filter in filters) {
                searchParams.set(filter, filters[filter].join(','))
            }
            return searchParams
        })
    }, [filters, setSearchParams])

    useEffect(() => {
        const sort = searchParams.get('sort')
        if (sort?.startsWith('-')) {
            setSort(sort.substring(1) ?? '')
            setSortDirection('desc')
        } else {
            setSort(sort ?? '')
            setSortDirection('asc')
        }
    }, [searchParams])

    return useMemo(
        () => ({
            page,
            setPage,
            perPage,
            setPerPage,
            sort,
            setSort,
            sortDirection,
            setSortDirection,
            filters,
            setFilters,
            clearAllFilters,
        }),
        [clearAllFilters, filters, page, perPage, sort, sortDirection]
    )
}
