import xl2Breakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_2xl'
import lgBreakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_lg'
import mdBreakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_md'
import smBreakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_sm'
import xlBreakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_xl'
import xsBreakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_xs'
import { useCallback, useEffect, useState } from 'react'

export enum WindowSize {
    xs,
    sm,
    'md',
    'lg',
    'xl',
    '2xl',
}

const breakpoints: Record<WindowSize, number> = {
    [WindowSize.xs]: Number(xsBreakpoint.value.replace('px', '')),
    [WindowSize.sm]: Number(smBreakpoint.value.replace('px', '')),
    [WindowSize.md]: Number(mdBreakpoint.value.replace('px', '')),
    [WindowSize.lg]: Number(lgBreakpoint.value.replace('px', '')),
    [WindowSize.xl]: Number(xlBreakpoint.value.replace('px', '')),
    [WindowSize['2xl']]: Number(xl2Breakpoint.value.replace('px', '')),
}

export function useWindowSize() {
    const [windowSize, setWindowSize] = useState<WindowSize>(WindowSize['2xl'])
    const handleResize = useCallback(() => {
        let size = WindowSize['2xl']
        for (; size >= WindowSize.sm; size--) {
            const breakpoint = breakpoints[size]
            if (window.innerWidth >= breakpoint) {
                break
            }
        }
        setWindowSize(size)
    }, [])

    useEffect(() => {
        const handler = handleResize
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [handleResize])

    useEffect(() => handleResize(), [handleResize])

    return windowSize
}

export function useWindowSizeOrLarger(size: WindowSize) {
    const windowSize = useWindowSize()
    return windowSize >= size
}

export function useWindowSizeOrSmaller(size: WindowSize) {
    const windowSize = useWindowSize()
    return windowSize <= size
}
