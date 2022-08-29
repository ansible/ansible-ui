import { Alert, AlertGroup } from '@patternfly/react-core'
import { ReactNode } from 'react'
import { Collapse, PageHeader, PageHeaderProps, useWindowSizeOrLarger, WindowSize } from '.'
import { PagePagination, PagePaginationProps } from './PagePagination'
import { PageTable, PageTableProps } from './PageTable'
import { PageToolbar2, PageToolbar2Props } from './PageToolbar'

export type TablePageProps<T extends object> = PageHeaderProps &
    PageToolbar2Props<T> &
    PageTableProps<T> &
    PagePaginationProps & { error?: Error }

export function TablePage<T extends object>(props: TablePageProps<T>) {
    return (
        <PageLayout>
            <PageHeader {...props} />
            <PageBody>
                <PageAlert {...props} />
                <PageTableCard {...props} />
            </PageBody>
        </PageLayout>
    )
}

/**
 * PageLayout enables the responsive layout of the page.
 *
 * @example
 * <Page>
 *   <PageLayout>
 *     <PageHeader />
 *     <PageBody />
 *   </PageLayout>
 * <Page>
 */
function PageLayout(props: { children: ReactNode }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: '100%',
            }}
        >
            {props.children}
        </div>
    )
}

function PageBody(props: { children: ReactNode }) {
    const lg = useWindowSizeOrLarger(WindowSize.xl)
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: '100%',
                padding: lg ? 16 : 0,
                overflow: 'hidden',
            }}
        >
            {props.children}
        </div>
    )
}

function PageCard(props: { children: ReactNode }) {
    const lg = useWindowSizeOrLarger(WindowSize.xl)
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: '100%',
                overflow: 'hidden',
                border: lg ? 'thin solid #0002' : undefined,
                backgroundColor: 'var(--pf-global--BackgroundColor--100)',
            }}
        >
            {props.children}
        </div>
    )
}

function PageAlert(props: { error?: Error }) {
    return (
        <Collapse open={!!props.error}>
            <AlertGroup style={{ paddingBottom: 16 }}>
                <Alert title={props.error?.message} isInline variant="danger">
                    {typeof props.error?.info?.detail === 'string' && props.error.info.detail}
                </Alert>
            </AlertGroup>
        </Collapse>
    )
}

export type PageTableCardProps<T extends object> = PageToolbar2Props<T> & PageTableProps<T> & PagePaginationProps & { error?: Error }

function PageTableCard<T extends object>(props: PageTableCardProps<T>) {
    return (
        <PageCard>
            <PageToolbar2 {...props} />
            <PageTable {...props} />
            <PagePagination {...props} />
        </PageCard>
    )
}
