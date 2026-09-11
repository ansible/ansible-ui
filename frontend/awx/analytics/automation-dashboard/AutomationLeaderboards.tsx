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
import { getLeaderboardCardWidths, getTopRowColSpan } from './common/leaderboardCardWidths';

/** Re-exported so `AutomationLeaderboards.test.tsx` doesn't need to import the shared module directly. */
export { CARD_WIDTH_COL_SPAN, getLeaderboardCardWidths } from './common/leaderboardCardWidths';
export type { LeaderboardCardWidths } from './common/leaderboardCardWidths';

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
