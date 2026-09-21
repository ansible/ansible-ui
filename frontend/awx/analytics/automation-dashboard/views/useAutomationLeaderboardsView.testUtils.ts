import type { AutomationLeaderboardsView } from './useAutomationLeaderboardsView';

/**
 * Builds a complete `AutomationLeaderboardsView` for component tests that mock
 * `useAutomationLeaderboardsView`. Defaults describe a loaded, synced, empty-window view; pass only
 * the fields a test cares about. Typed against the real view contract, so a new required field
 * fails compilation here once instead of in every consuming test.
 *
 * Only types are imported from the hook module: those tests `vi.mock` it, which would replace any
 * runtime export with `undefined`.
 */
export function createLeaderboardsView(
  overrides: Partial<AutomationLeaderboardsView> = {}
): AutomationLeaderboardsView {
  return {
    isLoading: false,
    error: undefined,
    collectionStatusError: undefined,
    lastSyncedAt: '2026-09-01T14:00:00.000Z',
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
    ...overrides,
  };
}
