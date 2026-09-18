/**
 * Single source of data for the Automation Dashboard → Leaderboards tab.
 *
 * Fetches `/dashboard_reports/leaderboard/` once (via `useSWR`) and maps the raw response
 * (`ILeaderboardReport`) into `AutomationLeaderboardsData` — the leaderboard components read
 * only from this hook's return value, never the raw API shape.
 *
 * Five components call this hook (AutomationLeaderboards, HighlightsLeaderboardPanel,
 * AutomationDimensions, AutomationAtAGlance, MilestoneBadgesCard). Backed by ONE SWR key so
 * those calls dedupe to a single request; do not give each caller its own key or the tab will
 * fan out five identical fetches.
 */
import useSWR from 'swr';
import { useFetcher } from '../../../../common/crud/Data';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { IAutomationDashboardCollectionStatus } from '../types';

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

// ─── API response shape (`/dashboard_reports/leaderboard/`) ──────────────────

interface ILeaderboardStreakDay {
  /** "YYYY-MM-DD", UTC calendar day. */
  date: string;
  successful_runs: number;
}

interface ILeaderboardStreak {
  streak: number;
  /** Oldest-to-newest. */
  daily: ILeaderboardStreakDay[];
}

interface ILeaderboardOrgStreak extends ILeaderboardStreak {
  organization: { id: number; name: string; run_count: number };
}

interface ILeaderboardOrganizationRow {
  rank: number;
  name: string;
  runs: number;
}

interface ILeaderboardActivityRow {
  rank: number;
  username: string;
  runs: number;
  is_current_user?: boolean;
}

interface ILeaderboardActivityLevel {
  id: DimensionKey;
  current_user_rank: number;
  total_users: number;
  /** Top 10, rank ascending. Only includes the current user's row if they're in the top 10. */
  leaderboard: ILeaderboardActivityRow[];
}

export interface ILeaderboardReport {
  job_runs: number;
  active_organizations: number;
  featured_template: { id: number; name: string; run_count: number };
  enterprise_streak: ILeaderboardStreak;
  org_streak: ILeaderboardOrgStreak;
  organization_leaderboard: {
    user_organization_rank: number;
    total_organizations: number;
    /** Top 10, rank ascending. */
    leaderboard: ILeaderboardOrganizationRow[];
  };
  /** Snake_case badge ids, e.g. "top_tier" — see ORG_BADGE_ID_MAP. */
  org_achievements: string[];
  activity_levels: ILeaderboardActivityLevel[];
  /** Snake_case badge ids, e.g. "week_warrior" — see MILESTONE_BADGE_ID_MAP. */
  user_achievements: string[];
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

const MILESTONE_BADGE_ID_MAP: Record<string, MilestoneBadgeId> = {
  ignition: 'ignition',
  week_warrior: 'weekWarrior',
  month_warrior: 'monthWarrior',
  explorer: 'explorer',
  centurion: 'centurion',
  reliable: 'reliable',
  accelerator: 'accelerator',
};

const ORG_BADGE_ID_MAP: Record<string, OrgBadgeId> = {
  sustained: 'sustained',
  rising: 'rising',
  top_tier: 'topTier',
};

/** Formats "YYYY-MM-DD" as a short UTC display date, e.g. "Aug 21". */
function formatStreakDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function resolveStreakState(enterpriseRuns: number, orgRuns: number): StreakDay['state'] {
  if (enterpriseRuns <= 0) {
    return 'none';
  }
  return orgRuns > 0 ? 'enterpriseAndOrg' : 'enterpriseOnly';
}

/** Zips the enterprise/org daily streak arrays (matched by date) into the combined strip shape. */
function mapStreakCalendar(
  enterpriseDaily: ILeaderboardStreakDay[],
  orgDaily: ILeaderboardStreakDay[]
): StreakDay[] {
  const orgRunsByDate = new Map(orgDaily.map((day) => [day.date, day.successful_runs]));

  return enterpriseDaily.map((day) => {
    const enterpriseRuns = day.successful_runs;
    const orgRuns = orgRunsByDate.get(day.date) ?? 0;
    const state = resolveStreakState(enterpriseRuns, orgRuns);

    return { dateStr: formatStreakDate(day.date), state, enterpriseRuns, orgRuns };
  });
}

function mapDimensions(
  activityLevels: ILeaderboardActivityLevel[]
): Record<DimensionKey, DimensionStanding> {
  const empty: DimensionStanding = { score: 0, rank: 0, totalRanked: 0 };
  const dimensions: Record<DimensionKey, DimensionStanding> = {
    volume: empty,
    breadth: empty,
    consistency: empty,
  };

  for (const level of activityLevels) {
    // The current user's raw score is only available when they're in the returned top 10 —
    // falls back to 0 (their rank/totalRanked are still accurate either way).
    const ownRow = level.leaderboard.find((row) => row.is_current_user);
    dimensions[level.id] = {
      score: ownRow?.runs ?? 0,
      rank: level.current_user_rank,
      totalRanked: level.total_users,
    };
  }

  return dimensions;
}

function mapDimensionLeaderboards(
  activityLevels: ILeaderboardActivityLevel[]
): Record<DimensionKey, HighlightsDimensionLeaderboardRow[]> {
  const dimensionLeaderboards: Record<DimensionKey, HighlightsDimensionLeaderboardRow[]> = {
    volume: [],
    breadth: [],
    consistency: [],
  };

  for (const level of activityLevels) {
    dimensionLeaderboards[level.id] = level.leaderboard.map((row) => ({
      id: String(row.rank),
      name: row.username,
      value: row.runs,
      isCurrentUser: row.is_current_user,
    }));
  }

  return dimensionLeaderboards;
}

function mapAchievements<T extends string>(rawIds: string[], idMap: Record<string, T>): T[] {
  return rawIds.flatMap((rawId) => {
    const id = idMap[rawId];
    return id ? [id] : [];
  });
}

export function mapLeaderboardReport(report: ILeaderboardReport): AutomationLeaderboardsData {
  const currentOrgRow = report.organization_leaderboard.leaderboard.find(
    (row) => row.rank === report.organization_leaderboard.user_organization_rank
  );

  return {
    // Set by the hook from collection_status's min_collection_timestamp, not derivable here.
    lastSyncedAt: null,
    atAGlance: {
      jobsRun: report.job_runs,
      activeOrganizations: report.active_organizations,
      featuredTemplate: {
        name: report.featured_template.name,
        runs: report.featured_template.run_count,
      },
      enterpriseStreakDays: report.enterprise_streak.streak,
      orgStreakDays: report.org_streak.streak,
    },
    streakCalendar: mapStreakCalendar(report.enterprise_streak.daily, report.org_streak.daily),
    dimensions: mapDimensions(report.activity_levels),
    dimensionLeaderboards: mapDimensionLeaderboards(report.activity_levels),
    organizationLeaderboard: report.organization_leaderboard.leaderboard.map((row) => ({
      id: String(row.rank),
      name: row.name,
      runs: row.runs,
      rank: row.rank,
      isCurrentOrg: row.rank === report.organization_leaderboard.user_organization_rank,
    })),
    currentOrgStanding: {
      rank: report.organization_leaderboard.user_organization_rank,
      totalRuns: currentOrgRow?.runs ?? report.org_streak.organization.run_count,
    },
    earnedUserAchievements: mapAchievements(report.user_achievements, MILESTONE_BADGE_ID_MAP),
    earnedOrgAchievements: mapAchievements(report.org_achievements, ORG_BADGE_ID_MAP),
  };
}

const EMPTY_LEADERBOARDS_DATA: AutomationLeaderboardsData = {
  lastSyncedAt: null,
  atAGlance: {
    jobsRun: 0,
    activeOrganizations: 0,
    featuredTemplate: { name: '', runs: 0 },
    enterpriseStreakDays: 0,
    orgStreakDays: 0,
  },
  streakCalendar: [],
  dimensions: {
    volume: { score: 0, rank: 0, totalRanked: 0 },
    breadth: { score: 0, rank: 0, totalRanked: 0 },
    consistency: { score: 0, rank: 0, totalRanked: 0 },
  },
  dimensionLeaderboards: { volume: [], breadth: [], consistency: [] },
  organizationLeaderboard: [],
  currentOrgStanding: { rank: 0, totalRuns: 0 },
  earnedUserAchievements: [],
  earnedOrgAchievements: [],
};

/** `min_collection_timestamp` is typed `Date` but arrives over JSON as an ISO string (or null). */
function toIsoString(value: Date | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAutomationLeaderboardsView(): AutomationLeaderboardsView {
  const fetcher = useFetcher();

  const leaderboardUrl = metricsAPI`/dashboard_reports/leaderboard/`;
  const { data, error, isLoading } = useSWR<ILeaderboardReport, Error>(leaderboardUrl, fetcher);

  // Unlike useAutomationDashboardCollectionStatus (gated to superuser/auditor, drives nav-item
  // visibility), every viewer needs their own "Updated: …" timestamp here, so this fetch isn't
  // gated. Same URL as that hook, so SWR shares one cache entry/request when both are active.
  const collectionStatusUrl = metricsAPI`/dashboard_reports/collection_status/`;
  const { data: collectionStatus } = useSWR<IAutomationDashboardCollectionStatus, Error>(
    collectionStatusUrl,
    fetcher
  );

  // Temporary workaround: collection_status doesn't expose a dedicated "last sync" timestamp
  // yet, so min_collection_timestamp is used as a stand-in. Once the backend adds a proper
  // last-sync timestamp field to collection_status, switch to reading that field instead.
  const lastSyncedAt = toIsoString(collectionStatus?.min_collection_timestamp);

  if (!data) {
    return { ...EMPTY_LEADERBOARDS_DATA, lastSyncedAt, isLoading, error };
  }

  return { ...mapLeaderboardReport(data), lastSyncedAt, isLoading, error };
}
