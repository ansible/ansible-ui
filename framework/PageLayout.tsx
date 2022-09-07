import { ReactNode } from 'react'
import ErrorBoundary from './components/ErrorBoundary'

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
export function PageLayout(props: { children: ReactNode }) {
    return (
        <ErrorBoundary>
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
        </ErrorBoundary>
    )
}
