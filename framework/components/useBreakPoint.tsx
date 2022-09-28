import xl2Breakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_2xl'
import lgBreakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_lg'
import mdBreakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_md'
import smBreakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_sm'
import xlBreakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_xl'
import xsBreakpoint from '@patternfly/react-tokens/dist/esm/global_breakpoint_xs'
import { useCallback, useEffect, useState } from 'react'

const breakpoints: Record<string, number> = {
    xs: Number(xsBreakpoint.value.replace('px', '')),
    sm: Number(smBreakpoint.value.replace('px', '')),
    md: Number(mdBreakpoint.value.replace('px', '')),
    lg: Number(lgBreakpoint.value.replace('px', '')),
    xl: Number(xlBreakpoint.value.replace('px', '')),
    xxl: Number(xl2Breakpoint.value.replace('px', '')),
}

type WindowSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

export function useWindowSize(): WindowSize {
    const [windowSize, setWindowSize] = useState<WindowSize>(() => {
        if (window.innerWidth <= breakpoints.sm) return 'xs'
        else if (window.innerWidth <= breakpoints.md) return 'sm'
        else if (window.innerWidth <= breakpoints.lg) return 'md'
        else if (window.innerWidth <= breakpoints.xl) return 'lg'
        else if (window.innerWidth <= breakpoints.xxl) return 'xl'
        else return 'xxl'
    })
    const handleResize = useCallback(() => {
        if (window.innerWidth <= breakpoints.sm) setWindowSize('xs')
        else if (window.innerWidth <= breakpoints.md) setWindowSize('sm')
        else if (window.innerWidth <= breakpoints.lg) setWindowSize('md')
        else if (window.innerWidth <= breakpoints.xl) setWindowSize('lg')
        else if (window.innerWidth <= breakpoints.xxl) setWindowSize('xl')
        else setWindowSize('xxl')
    }, [])

    useEffect(() => {
        const handler = handleResize
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [handleResize])

    useEffect(() => handleResize(), [handleResize])

    return windowSize
}

/** Returns true if the window size is equal to or larger than the indicated size. */
export function useBreakpoint(size: WindowSize): boolean {
    const windowSize = useWindowSize()
    switch (size) {
        case 'xs':
            return true
        case 'sm':
            switch (windowSize) {
                case 'sm':
                case 'md':
                case 'lg':
                case 'xl':
                case 'xxl':
                    return true
                default:
                    return false
            }
        case 'md':
            switch (windowSize) {
                case 'md':
                case 'lg':
                case 'xl':
                case 'xxl':
                    return true
                default:
                    return false
            }
        case 'lg':
            switch (windowSize) {
                case 'lg':
                case 'xl':
                case 'xxl':
                    return true
                default:
                    return false
            }
        case 'xl':
            switch (windowSize) {
                case 'xl':
                case 'xxl':
                    return true
                default:
                    return false
            }
        case 'xxl':
            switch (windowSize) {
                case 'xxl':
                    return true
                default:
                    return false
            }
    }
}

export function useOrientation(): 'landscape' | 'portrait' {
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(() =>
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    )
    const handleResize = useCallback(() => {
        setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }, [])

    useEffect(() => {
        const handler = handleResize
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [handleResize])

    useEffect(() => handleResize(), [handleResize])

    return orientation
}
