import useResizeObserver from '@react-hook/resize-observer';
import { RefObject, useCallback, useEffect, useState } from 'react';

export function useVirtualizedList<T>(containerRef: RefObject<HTMLElement>, items: T[]) {
  const scrollBuffer = 400;

  const [scrollTop, setScrollTop] = useState(0);
  const onScroll = useCallback(() => {
    if (!containerRef.current) return;
    setScrollTop(containerRef.current.scrollTop);
    setContainerHeight(containerRef.current.clientHeight);
  }, [containerRef]);
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.onscroll = onScroll;
  }, [containerRef, onScroll]);

  const [containerHeight, setContainerHeight] = useState(0);
  const onResize = useCallback(() => {
    if (!containerRef.current) return;
    setContainerHeight(containerRef.current.clientHeight);
  }, [containerRef]);
  useResizeObserver(containerRef, () => onResize());

  const [rowHeights, setRowHeights] = useState<Record<number, number | undefined>>({});
  const [minRowHeight, setMinRowHeight] = useState(24);
  const setRowHeight = useCallback(
    (index: number, height: number) => {
      setRowHeights((heights) => {
        const existingHeight = heights[index];
        if (existingHeight === height) return heights;
        if (minRowHeight > height) setMinRowHeight(height);
        const newHeights = { ...heights };
        newHeights[index] = height;
        return newHeights;
      });
    },
    [minRowHeight]
  );

  const totalRowCount = items.length;

  let totalHeight = 0;
  let rowIndex = 0;
  while (rowIndex < totalRowCount) {
    const height = rowHeights[rowIndex];
    const rowHeight = height === undefined ? minRowHeight : height;
    if (totalHeight + rowHeight >= scrollTop - scrollBuffer) break;
    totalHeight += rowHeight;
    rowIndex++;
  }
  const beforeRowsCount = rowIndex;
  const beforeRowsHeight = totalHeight;

  const maxVisibleHeight = scrollTop + containerHeight + scrollBuffer;
  let visibleRowsCount = 0;
  while (rowIndex < totalRowCount) {
    const height = rowHeights[rowIndex];
    const rowHeight = height === undefined ? minRowHeight : height;
    totalHeight += rowHeight;
    rowIndex++;
    visibleRowsCount++;
    if (totalHeight >= maxVisibleHeight) break;
  }

  const visibleRowsHeight = totalHeight - beforeRowsHeight;

  while (rowIndex < totalRowCount) {
    const height = rowHeights[rowIndex];
    const rowHeight = height === undefined ? minRowHeight : height;
    totalHeight += rowHeight;
    rowIndex++;
  }

  const afterRowsHeight = totalHeight - beforeRowsHeight - visibleRowsHeight;

  const visibleItems = items.slice(beforeRowsCount, beforeRowsCount + visibleRowsCount);

  return {
    beforeRowsCount,
    beforeRowsHeight,
    visibleItems,
    setRowHeight,
    afterRowsHeight,
  };
}
