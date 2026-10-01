import {
  PageDashboardCardWidth,
  PAGE_DASHBOARD_CARD_WIDTH_COL_SPAN,
} from '@ansible/ansible-ui-framework';

/** `PageDashboardCard`'s own width → column-span mapping, re-exported so it can't drift out of sync. */
export const CARD_WIDTH_COL_SPAN = PAGE_DASHBOARD_CARD_WIDTH_COL_SPAN;

/** Below this many grid columns, the hardcoded row widths no longer fit — see `widthOrFullRow`. */
export const NARROW_GRID_MAX_COLUMNS = 14;

/**
 * Column span for the sync-timestamp row (a plain `<div>`, not a `PageDashboardCard`), clamped
 * to the grid so it lines up with the `'xxl'` Streak/Activity-levels cards below it.
 */
export function getTopRowColSpan(gridColumns: number): number {
  return Math.min(CARD_WIDTH_COL_SPAN.xxl, gridColumns);
}

/**
 * `width` is hardcoded per row elsewhere on this page (see `AutomationLeaderboards.tsx` and
 * `AutomationAtAGlance.tsx`), sized for a roomy grid. Below `NARROW_GRID_MAX_COLUMNS` there isn't
 * room for it, so every card falls back to `'xxl'` (full row width, one card per row) instead.
 */
export function widthOrFullRow(
  gridColumns: number,
  width: PageDashboardCardWidth
): PageDashboardCardWidth {
  return gridColumns <= NARROW_GRID_MAX_COLUMNS ? 'xxl' : width;
}
