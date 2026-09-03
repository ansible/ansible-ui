import {
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';
import useResizeObserver from '@react-hook/resize-observer';

/** Approx. width of one dashboard grid column, in px (matches the framework PageDashboard). */
const COLUMN_WIDTH = 1662 / 24;

/**
 * Horizontal space that isn't available to the grid inside a tab: `<Scrollable>`'s left + right
 * margins (20 + 20) plus a vertical scrollbar. Subtracted from the measured page width so the
 * column count lines up with the actual grid area.
 */
const GRID_INSET = 56;

function toColumns(pageWidth: number): number {
  return Math.max(1, Math.floor((pageWidth - GRID_INSET) / COLUMN_WIDTH));
}

function applyWidth(width: number, setColumns: Dispatch<SetStateAction<number>>): void {
  // A width below one column means the element isn't laid out yet (or is hidden) — ignore it
  // rather than collapsing the grid to a single column.
  if (width < COLUMN_WIDTH) return;
  const columns = toColumns(width);
  setColumns((current) => (current === columns ? current : columns));
}

/**
 * Derives the responsive dashboard grid column count from the width of a stable element in the
 * persistent page shell. Measuring here — rather than inside each routed tab — means switching
 * between the Dashboard and Leaderboards tabs never re-measures and never flashes the grid.
 *
 * Attach the returned `ref` to a full-width, zero-height probe element.
 */
export function useDashboardGridColumns(): {
  ref: RefObject<HTMLDivElement>;
  gridColumns: number;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [gridColumns, setGridColumns] = useState(1);

  useLayoutEffect(() => {
    applyWidth(ref.current?.clientWidth ?? 0, setGridColumns);
  }, []);

  useResizeObserver(ref, (entry) => applyWidth(entry.contentRect.width ?? 0, setGridColumns));

  return { ref, gridColumns };
}
