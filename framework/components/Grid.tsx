import useResizeObserver from '@react-hook/resize-observer'
import { ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useBreakpoint } from './useBreakPoint'

export function Grid(props: { size?: number; maxColumns?: number; children?: ReactNode }) {
  const size = props.size ?? 350
  const target = useRef<HTMLDivElement>(null)
  const [gridTemplateColumns, setGridTemplateColumns] = useState('1fr')
  const resize = useCallback(
    (width: number) => {
      let columns = Math.min(props.maxColumns ?? 12, Math.max(Math.floor(width / size), 1))
      if (columns < 1) columns = 1
      setGridTemplateColumns(() => new Array(columns).fill('1fr').join(' '))
    },
    [props.maxColumns, size]
  )
  useResizeObserver(target, (entry) => resize(entry.contentRect.width))
  useLayoutEffect(() => {
    resize(target.current?.clientWidth ?? 0)
  }, [resize])
  const isMd = !useBreakpoint('lg')
  const isXS = !useBreakpoint('xs')
  let gap = 24
  if (isMd) gap = 16
  if (isXS) gap = 8
  return (
    <div ref={target} style={{ display: 'grid', gridAutoRows: '1fr', gridTemplateColumns, gap }}>
      {props.children}
    </div>
  )
}
