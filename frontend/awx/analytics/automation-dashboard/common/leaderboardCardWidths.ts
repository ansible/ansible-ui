import {
  PageDashboardCardWidth,
  PAGE_DASHBOARD_CARD_WIDTH_COL_SPAN,
} from '@ansible/ansible-ui-framework';

/** Breakpoint (in grid columns) where the top-row cards jump from 'lg' to 'xxl'. */
export const WIDE_LAYOUT_MIN_COLUMNS = 18;
/** Breakpoint range (in grid columns) where the bottom-row cards narrow to 'md' before reverting to 'lg'. */
export const NARROW_BOTTOM_CARDS_MAX_COLUMNS = 24;

/** `PageDashboardCard`'s own width → column-span mapping, re-exported so it can't drift out of sync. */
export const CARD_WIDTH_COL_SPAN = PAGE_DASHBOARD_CARD_WIDTH_COL_SPAN;

export interface LeaderboardCardWidths {
  topCardsWidth: PageDashboardCardWidth;
  bottomCardsWidth: PageDashboardCardWidth;
}

/**
 * Maps the measured dashboard grid width (in columns) to the card widths used by each
 * leaderboard row: `topCardsWidth` sizes the sync timestamp, Streak and Activity-levels cards;
 * `bottomCardsWidth` sizes the bottom row (Top 10 organizations, Achievements).
 */
export function getLeaderboardCardWidths(gridColumns: number): LeaderboardCardWidths {
  let topCardsWidth: PageDashboardCardWidth;
  if (gridColumns < WIDE_LAYOUT_MIN_COLUMNS) {
    topCardsWidth = 'lg';
  } else {
    topCardsWidth = 'xxl';
  }
  const bottomCardsWidth: PageDashboardCardWidth =
    WIDE_LAYOUT_MIN_COLUMNS <= gridColumns && gridColumns <= NARROW_BOTTOM_CARDS_MAX_COLUMNS
      ? 'md'
      : 'lg';
  return { topCardsWidth, bottomCardsWidth };
}

/**
 * `topCardsWidth`'s column span, clamped to the grid — lets the sync-timestamp row (a plain
 * `<div>`, not a `PageDashboardCard`) line up with the Streak/Activity-levels cards below it.
 */
export function getTopRowColSpan(gridColumns: number): number {
  const { topCardsWidth } = getLeaderboardCardWidths(gridColumns);
  return Math.min(CARD_WIDTH_COL_SPAN[topCardsWidth], gridColumns);
}
