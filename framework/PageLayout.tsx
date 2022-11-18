import { ReactNode } from 'react'
import styled from 'styled-components'
import ErrorBoundary from './components/ErrorBoundary'
import { useFrameworkTranslations } from './useFrameworkTranslations'

/**
 * PageLayout enables the layout of the page to be responsive.
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
      <StyledLayout>{props.children}</StyledLayout>
    </ErrorBoundary>
  )
}

const StyledLayout = styled.div`
  display: flex;
  flexdirection: column;
  height: 100%;
  maxheight: 100%;
`

StyledLayout.displayName = 'StyledLayout'
