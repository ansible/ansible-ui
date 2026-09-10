import { PageDashboardCardWidth } from '@ansible/ansible-ui-framework';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { DashboardGridRow, DashboardLayout } from './components/DashboardLayout';
import { AutomationAtAGlance } from './components/leaderboards/AutomationAtAGlance';
import { AutomationDimensions } from './components/leaderboards/AutomationDimensions';
import { HighlightsLeaderboardPanel } from './components/leaderboards/HighlightsLeaderboardPanel';
import { HighlightsSyncTimestamp } from './components/leaderboards/HighlightsSyncTimestamp';
import { MilestoneBadgesCard } from './components/leaderboards/MilestoneBadgesCard';
import { useAutomationLeaderboardsView } from './views/useAutomationLeaderboardsView';
import { EmptyStateNoData } from '@ansible/ansible-ui-framework/components/EmptyStateNoData';
import { useTranslation } from 'react-i18next';
import { EmptyStateError } from '@ansible/ansible-ui-framework/components/EmptyStateError';
import { AutomationStreak } from './components/leaderboards/AutomationStreak';

/** Breakpoint (in grid columns) where the top cards widen from 'lg' to 'xl'/'xxl'. */
const WIDE_LAYOUT_MIN_COLUMNS = 16;
/** Breakpoint range (in grid columns) where the top cards use 'xl' (and the bottom cards narrow to 'md') before both revert. */
const NARROW_BOTTOM_CARDS_MAX_COLUMNS = 23;

/**
 * Mirrors `PageDashboardCard`'s own width → column-span mapping
 * (framework/PageDashboard/PageDashboardCard.tsx) since that map isn't exported. Exported so
 * `AutomationLeaderboards.test.tsx` can assert it stays in sync with the real component instead
 * of silently drifting.
 */
export const CARD_WIDTH_COL_SPAN: Record<PageDashboardCardWidth, number> = {
  xxs: 3,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
};

export interface LeaderboardCardWidths {
  topCardsWidth: PageDashboardCardWidth;
  bottomCardsWidth: PageDashboardCardWidth;
}

/**
 * Maps the measured dashboard grid width (in columns) to the card widths used by each
 * leaderboard row. This sizes a single full-width card row (Streak, Activity levels) — it's a
 * deliberately separate scale from `getAtAGlanceKpiCardWidth` in
 * `components/leaderboards/AutomationAtAGlance.tsx`, which sizes the 3 KPI cards sharing a row.
 * The two need not change tier at the same column count; don't "align" the numbers without
 * checking both still look right at every breakpoint.
 */
export function getLeaderboardCardWidths(gridColumns: number): LeaderboardCardWidths {
  let topCardsWidth: PageDashboardCardWidth;
  if (gridColumns < WIDE_LAYOUT_MIN_COLUMNS) {
    topCardsWidth = 'lg';
  } else if (gridColumns <= NARROW_BOTTOM_CARDS_MAX_COLUMNS) {
    topCardsWidth = 'xl';
  } else {
    topCardsWidth = 'xxl';
  }
  const bottomCardsWidth: PageDashboardCardWidth =
    WIDE_LAYOUT_MIN_COLUMNS <= gridColumns && gridColumns <= NARROW_BOTTOM_CARDS_MAX_COLUMNS
      ? 'md'
      : 'lg';
  return { topCardsWidth, bottomCardsWidth };
}

/** Shown until the analytics backend has recorded at least one sync (`lastSyncedAt === null`). */
function LeaderboardsEmptyState({ gridColumns }: Readonly<{ gridColumns: number }>) {
  const { t } = useTranslation();

  return (
    <DashboardGridRow>
      <div style={{ gridColumn: `span ${gridColumns}`, maxWidth: '100%' }}>
        <EmptyStateNoData
          title={t('No leaderboard data yet')}
          description={t(
            'Leaderboard data will appear here once job runs have been recorded. Check back after your first automation run.'
          )}
          variant="lg"
        />
      </div>
    </DashboardGridRow>
  );
}

/** Shown when the leaderboards report fails to load. */
function LeaderboardsErrorState({
  error,
  gridColumns,
}: Readonly<{ error: Error; gridColumns: number }>) {
  const { t } = useTranslation();

  return (
    <DashboardGridRow>
      <div style={{ gridColumn: `span ${gridColumns}`, maxWidth: '100%' }}>
        <EmptyStateError titleProp={t('Unable to load leaderboards')} message={error.message} />
      </div>
    </DashboardGridRow>
  );
}

function renderLeaderboardsContent(
  gridColumns: number,
  lastSyncedAt: string | null,
  isLoading: boolean,
  error: Error | undefined
) {
  const { topCardsWidth, bottomCardsWidth } = getLeaderboardCardWidths(gridColumns);

  if (isLoading) {
    return (
      <DashboardGridRow>
        <div style={{ gridColumn: `span ${gridColumns}`, maxWidth: '100%' }}>
          <LoadingState />
        </div>
      </DashboardGridRow>
    );
  }

  if (error) {
    return <LeaderboardsErrorState error={error} gridColumns={gridColumns} />;
  }

  if (!lastSyncedAt) {
    return <LeaderboardsEmptyState gridColumns={gridColumns} />;
  }

  // Match the column span PageDashboardCard itself derives from topCardsWidth (clamped to the
  // measured grid), so the timestamp row lines up with the width of the cards below it instead
  // of stretching across the full grid.
  const topCardsColSpan = Math.min(CARD_WIDTH_COL_SPAN[topCardsWidth], gridColumns);

  return (
    <>
      <DashboardGridRow>
        <div style={{ gridColumn: `span ${topCardsColSpan}`, maxWidth: '100%' }}>
          <HighlightsSyncTimestamp lastSyncedAt={lastSyncedAt} />
        </div>
      </DashboardGridRow>

      <AutomationAtAGlance />

      <DashboardGridRow>
        <AutomationStreak width={topCardsWidth} />
      </DashboardGridRow>
      <DashboardGridRow>
        <AutomationDimensions width={topCardsWidth} />
      </DashboardGridRow>
      <DashboardGridRow>
        <HighlightsLeaderboardPanel width={bottomCardsWidth} />
        <MilestoneBadgesCard width={bottomCardsWidth} />
      </DashboardGridRow>
    </>
  );
}

export function AutomationLeaderboards() {
  const { lastSyncedAt, isLoading, error } = useAutomationLeaderboardsView();
  return (
    <DashboardLayout>
      {(gridColumns) => renderLeaderboardsContent(gridColumns, lastSyncedAt, isLoading, error)}
    </DashboardLayout>
  );
}
