import { useContext, useMemo } from 'react';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { PageDashboardContext } from '@ansible/ansible-ui-framework';
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
import {
  getTopRowColSpan,
  NARROW_GRID_MAX_COLUMNS,
  widthOrFullRow,
} from './common/leaderboardCardWidths';

/** Re-exported so `AutomationLeaderboards.test.tsx` doesn't need to import the shared module directly. */
export { CARD_WIDTH_COL_SPAN } from './common/leaderboardCardWidths';

/** Hardcoded for now, not derived from the measured grid — see PR discussion. */
const BOTTOM_CARDS_WIDTH = 'lg';

/**
 * HACK: snap the measured grid width up to the full 24 columns whenever it's already
 * reasonably wide (above `NARROW_GRID_MAX_COLUMNS`, below 24). The hardcoded card widths on this
 * page (md×3, lg×2, xxl) are each sized to sum to 24 per row, so this makes them actually fill
 * the row instead of getting clamped at whatever gridColumns measured. Leaderboards-only —
 * applied via this component's own `PageDashboardContext.Provider` below, so the Dashboard tab
 * is unaffected.
 */
function snapGridColumns(gridColumns: number): number {
  return gridColumns > NARROW_GRID_MAX_COLUMNS && gridColumns < 24 ? 24 : gridColumns;
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

  // Lines the timestamp row up with the Streak/Activity-levels cards below instead of
  // stretching it across the full grid.
  const topCardsColSpan = getTopRowColSpan(gridColumns);

  return (
    <>
      <DashboardGridRow>
        <div style={{ gridColumn: `span ${topCardsColSpan}`, maxWidth: '100%' }}>
          <HighlightsSyncTimestamp lastSyncedAt={lastSyncedAt} />
        </div>
      </DashboardGridRow>

      <AutomationAtAGlance />

      <DashboardGridRow>
        <AutomationStreak width="xxl" />
      </DashboardGridRow>
      <DashboardGridRow>
        <AutomationDimensions width="xxl" />
      </DashboardGridRow>
      <DashboardGridRow>
        <HighlightsLeaderboardPanel width={widthOrFullRow(gridColumns, BOTTOM_CARDS_WIDTH)} />
        <MilestoneBadgesCard width={widthOrFullRow(gridColumns, BOTTOM_CARDS_WIDTH)} />
      </DashboardGridRow>
    </>
  );
}

export function AutomationLeaderboards() {
  const { lastSyncedAt, isLoading, error } = useAutomationLeaderboardsView();
  const { columns } = useContext(PageDashboardContext);
  const snappedContextValue = useMemo(() => ({ columns: snapGridColumns(columns) }), [columns]);
  return (
    <PageDashboardContext.Provider value={snappedContextValue}>
      <DashboardLayout>
        {(gridColumns) => renderLeaderboardsContent(gridColumns, lastSyncedAt, isLoading, error)}
      </DashboardLayout>
    </PageDashboardContext.Provider>
  );
}
