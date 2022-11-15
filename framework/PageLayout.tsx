import { ReactNode } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import { useFrameworkTranslations } from './useFrameworkTranslations'

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
  const [translations] = useFrameworkTranslations()
  return (
    <ErrorBoundary message={translations.errorText}>
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
