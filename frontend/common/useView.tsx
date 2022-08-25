import { useState } from 'react'

export interface IPagedView {
    page: number
    perPage: number
    sort?: string
    sortDirection?: 'asc' | 'desc'
    filters?: Record<string, string>
}

export function usePagedView(defaultView?: IPagedView) {
    const [page, setPage] = useState(() => (defaultView ? defaultView.page : 1))
    const [perPage, setPerPage] = useState(() => (defaultView ? defaultView.perPage : 10))
    const [sort, setSort] = useState(() => (defaultView ? defaultView.sort ?? '' : ''))
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => (defaultView ? defaultView.sortDirection ?? 'asc' : 'asc'))
    const [filters, setFilters] = useState<Record<string, string>>(() => (defaultView ? defaultView.filters ?? {} : {}))
    return { page, setPage, perPage, setPerPage, sort, setSort, sortDirection, setSortDirection, filters, setFilters }
}
