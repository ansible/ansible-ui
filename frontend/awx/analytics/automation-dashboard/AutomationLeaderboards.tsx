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

/** Breakpoint (in grid columns) where the top cards widen from 'lg' to 'xl'/'xxl'. */
const WIDE_LAYOUT_MIN_COLUMNS = 16;
/** Breakpoint range (in grid columns) where the top cards use 'xl' (and the bottom cards narrow to 'md') before both revert. */
const NARROW_BOTTOM_CARDS_MAX_COLUMNS = 23;

export interface LeaderboardCardWidths {
  topCardsWidth: PageDashboardCardWidth;
  bottomCardsWidth: PageDashboardCardWidth;
}

/** Maps the measured dashboard grid width (in columns) to the card widths used by each leaderboard row. */
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
function LeaderboardsEmptyState() {
  const { t } = useTranslation();

  return (
    <DashboardGridRow>
      <div style={{ gridColumn: 'span 24', maxWidth: '100%' }}>
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

function renderLeaderboardsContent(
  gridColumns: number,
  lastSyncedAt: string | null,
  isLoading: boolean
) {
  const { topCardsWidth, bottomCardsWidth } = getLeaderboardCardWidths(gridColumns);

  if (isLoading) {
    return (
      <DashboardGridRow>
        <div style={{ gridColumn: 'span 24', maxWidth: '100%' }}>
          <LoadingState />
        </div>
      </DashboardGridRow>
    );
  }

  if (!lastSyncedAt) {
    return <LeaderboardsEmptyState />;
  }

  return (
    <>
      <DashboardGridRow>
        {/* span 24 so the right-aligned timestamp lines up with the widest card below,
            not the full grid width */}
        <div style={{ gridColumn: 'span 24', maxWidth: '100%' }}>
          <HighlightsSyncTimestamp lastSyncedAt={lastSyncedAt} />
        </div>
      </DashboardGridRow>
      <DashboardGridRow>
        <AutomationAtAGlance width={topCardsWidth} />
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
  const { lastSyncedAt, isLoading } = useAutomationLeaderboardsView();
  return (
    <DashboardLayout>
      {(gridColumns) => renderLeaderboardsContent(gridColumns, lastSyncedAt, isLoading)}
    </DashboardLayout>
  );
}
