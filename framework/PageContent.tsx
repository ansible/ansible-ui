import { PageSection } from '@patternfly/react-core'
import { ReactNode } from 'react'
import { useWindowSizeOrLarger, WindowSize } from './components/useBreakPoint'

export function PageContent(props: { padding?: boolean; children?: ReactNode }) {
    const lg = useWindowSizeOrLarger(WindowSize.xl)
    const padding = lg && props.padding
    return (
        <PageSection style={{ display: 'flex', flexDirection: 'column', padding: padding ? undefined : 0 }}>{props.children}</PageSection>
    )
}
