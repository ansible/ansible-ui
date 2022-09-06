import { OnPerPageSelect, OnSetPage, Pagination, PaginationVariant } from '@patternfly/react-core'
import { CSSProperties, useCallback } from 'react'

export type PagePaginationProps = {
    itemCount?: number
    page: number
    perPage: number
    setPage: (page: number) => void
    setPerPage: (perPage: number) => void
    style?: CSSProperties
}

export function PagePagination(props: PagePaginationProps) {
    const { setPage, setPerPage } = props
    const onSetPage = useCallback<OnSetPage>((_event, page) => setPage(page), [setPage])
    const onPerPageSelect = useCallback<OnPerPageSelect>((_event, perPage) => setPerPage(perPage), [setPerPage])

    return (
        <Pagination
            variant={PaginationVariant.bottom}
            itemCount={props.itemCount}
            page={props.page}
            perPage={props.perPage}
            onSetPage={onSetPage}
            onPerPageSelect={onPerPageSelect}
            style={{
                ...props.style,
                borderTop: 'thin solid var(--pf-global--BorderColor--100)',
                boxShadow: 'none',
                zIndex: 301,
                marginTop: -1,
            }}
        />
    )
}
