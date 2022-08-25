import { Card } from '@patternfly/react-core'
import { ReactNode } from 'react'
import { useWindowSizeOrLarger, WindowSize } from './components/useBreakPoint'

export function PageCard(props: { children?: ReactNode }) {
    const lg = useWindowSizeOrLarger(WindowSize.xl)
    const padding = lg
    return (
        <Card
            isFlat
            style={{
                display: 'inline-flex',
                flexDirection: 'column',
                // flexGrow: 1,
                // flexShrink: 0,
                overflow: 'hidden',
                border: padding ? undefined : 'unset',
            }}
        >
            {props.children}
        </Card>
    )
}
