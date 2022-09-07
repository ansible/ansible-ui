import { Alert, AlertGroup } from '@patternfly/react-core'
import { ReactNode } from 'react'
import { Collapse, PageHeader, PageHeaderProps, useWindowSizeOrLarger, WindowSize } from '.'
import { PageLayout } from './PageLayout'
import { PageTable, PageTableProps } from './PageTable'
import { useSettings } from './Settings'

export type TablePageProps<T extends object> = PageHeaderProps & PageTableProps<T> & { error?: Error }

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

export function PageBody(props: { children: ReactNode }) {
    const lg = useWindowSizeOrLarger(WindowSize.xl)
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: '100%',
                padding: lg ? 24 : 0,
                overflow: 'hidden',
                background: 'var(--pf-c-page__main-section--BackgroundColor)',
            }}
        >
            {props.children}
        </div>
    )
}

export function PageCard(props: { children: ReactNode }) {
    const lg = useWindowSizeOrLarger(WindowSize.xl)
    const settings = useSettings()
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: '100%',
                overflow: 'hidden',
                border: settings.borders && lg ? 'thin solid var(--pf-global--BorderColor--100)' : undefined,
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

export type PageTableCardProps<T extends object> = PageTableProps<T> & { error?: Error }

function PageTableCard<T extends object>(props: PageTableCardProps<T>) {
    return (
        <PageCard>
            <PageTable {...props} />
        </PageCard>
    )
}
