import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import ErrorBoundary from './components/ErrorBoundary'

/**
 * PageLayout enables the responsive layout of the page.
 *
 * @example
 * <Page>
 *   <PageLayout>
 *     <PageHeader />
 *     <PageBody />...</PageBody>
 *   </PageLayout>
 * <Page>
 */
export function PageLayout(props: { children: ReactNode }) {
    const { t } = useTranslation()
    return (
        <ErrorBoundary message={t('Error')}>
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
