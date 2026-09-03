/**
 * Single source of data for the Automation Dashboard → Leaderboards tab.
 *
 * Data here comes from the `MOCK_LEADERBOARDS` fixture. When the analytics API exposes the
 * report, replace the body of `useAutomationLeaderboardsView` with a `useSWR` / `useGet` call
 * (see `useGetReportDetails`) that resolves to `AutomationLeaderboardsData` — the leaderboard
 * components read only from this hook, so nothing else needs to change.
 *
 * Five components call this hook (AutomationLeaderboards, HighlightsLeaderboardPanel,
 * AutomationDimensions, AutomationAtAGlance, MilestoneBadgesCard). Back it with ONE SWR key so
 * those calls dedupe to a single request; do not give each caller its own key or the tab will
 * fan out five identical fetches.
 */
import { MOCK_LEADERBOARDS } from './useAutomationLeaderboardsView.fixtures';

// ─── Data contract ───────────────────────────────────────────────────────────

export type DimensionKey = 'volume' | 'breadth' | 'consistency';

/** One calendar day in the 30-day automation-streak strip. */
export interface StreakDay {
  /** Short display date, e.g. "Aug 21" (UTC). */
  dateStr: string;
  state: 'enterpriseAndOrg' | 'enterpriseOnly' | 'none';
  enterpriseRuns: number;
  orgRuns: number;
}

/** The active user's standing in one automation dimension. */
export interface DimensionStanding {
  /** The user's score for this dimension in the 30-day window. */
  score: number;
  /** The user's rank among all ranked users (1-based). */
  rank: number;
  /** How many users are ranked in this dimension. */
  totalRanked: number;
}

/** One row of a per-dimension top-10 leaderboard. */
export interface HighlightsDimensionLeaderboardRow {
  id: string;
  name: string;
  value: number;
  isCurrentUser?: boolean;
}

/** One row of the organizations' leaderboard. */
export interface LeaderboardItem {
  id: string;
  name: string;
  runs: number;
  rank: number;
  isCurrentOrg?: boolean;
}

export interface AtAGlanceSummary {
  /** Successful job runs across the platform in the window. */
  jobsRun: number;
  /** Organizations with at least one successful job run in the window. */
  activeOrganizations: number;
  /** Most-used job template in the window. */
  featuredTemplate: { name: string; runs: number };
  /** Consecutive UTC days with a platform-wide successful run. */
  enterpriseStreakDays: number;
  /** Consecutive UTC days with a successful run in the user's org. */
  orgStreakDays: number;
}

export const MILESTONE_BADGE_IDS = [
  'ignition',
  'weekWarrior',
  'monthWarrior',
  'explorer',
  'centurion',
  'reliable',
  'accelerator',
] as const;
export type MilestoneBadgeId = (typeof MILESTONE_BADGE_IDS)[number];

export const ORG_BADGE_IDS = ['sustained', 'rising', 'topTier'] as const;
export type OrgBadgeId = (typeof ORG_BADGE_IDS)[number];

export interface AutomationLeaderboardsData {
  /** ISO timestamp of the last analytics sync, or `null` if the report has never been synced. */
  lastSyncedAt: string | null;
  atAGlance: AtAGlanceSummary;
  /** Oldest-to-newest calendar days for the streak strip. */
  streakCalendar: StreakDay[];
  dimensions: Record<DimensionKey, DimensionStanding>;
  dimensionLeaderboards: Record<DimensionKey, HighlightsDimensionLeaderboardRow[]>;
  organizationLeaderboard: LeaderboardItem[];
  /** The active user's own org standing, for the panel header. */
  currentOrgStanding: { rank: number; totalRuns: number };
  earnedUserAchievements: MilestoneBadgeId[];
  earnedOrgAchievements: OrgBadgeId[];
}

export interface AutomationLeaderboardsView extends AutomationLeaderboardsData {
  isLoading: boolean;
  error: Error | undefined;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAutomationLeaderboardsView(): AutomationLeaderboardsView {
  return { ...MOCK_LEADERBOARDS, isLoading: false, error: undefined };
}
