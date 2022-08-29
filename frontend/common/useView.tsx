import { useState } from 'react'

export interface IPagedView {
    page: number
    perPage: number
    sort?: string
    sortDirection?: 'asc' | 'desc'
    filters?: Record<string, string>
}

export function usePagedView(view?: IPagedView) {
    const [page, setPage] = useState(() => (view ? view.page : 1))
    const [perPage, setPerPage] = useState(() => (view ? view.perPage : 10))
    const [sort, setSort] = useState(() => (view ? view.sort ?? '' : ''))
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => (view ? view.sortDirection ?? 'asc' : 'asc'))
    const [filters, setFilters] = useState<Record<string, string>>(() => (view ? view.filters ?? {} : {}))
    return { page, setPage, perPage, setPerPage, sort, setSort, sortDirection, setSortDirection, filters, setFilters }
}
