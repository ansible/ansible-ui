import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import {
  AutomationLeaderboardsData,
  DimensionKey,
  MILESTONE_BADGE_IDS,
  ORG_BADGE_IDS,
  useAutomationLeaderboardsView,
} from './useAutomationLeaderboardsView';
import { EMPTY_LEADERBOARDS, MOCK_LEADERBOARDS } from './useAutomationLeaderboardsView.fixtures';

const DIMENSION_KEYS: DimensionKey[] = ['volume', 'breadth', 'consistency'];
const STREAK_STATES = ['enterpriseAndOrg', 'enterpriseOnly', 'none'];

/**
 * Assertions that must hold for ANY `AutomationLeaderboardsData` the hook resolves to —
 * the mock today, an empty window, or a real API payload tomorrow. Value-specific checks
 * ("jobsRun === 1234") belong nowhere: they only track the fixture and churn when the
 * endpoint is wired.
 */
function assertLeaderboardsContract(data: AutomationLeaderboardsData): void {
  // ── at a glance ──
  const { atAGlance } = data;
  for (const n of [
    atAGlance.jobsRun,
    atAGlance.activeOrganizations,
    atAGlance.enterpriseStreakDays,
    atAGlance.orgStreakDays,
    atAGlance.featuredTemplate.runs,
  ]) {
    expect(typeof n).toBe('number');
    expect(n).toBeGreaterThanOrEqual(0);
  }
  expect(typeof atAGlance.featuredTemplate.name).toBe('string');

  // ── streak calendar: at most one 30-day window, self-consistent ──
  expect(Array.isArray(data.streakCalendar)).toBe(true);
  expect(data.streakCalendar.length).toBeLessThanOrEqual(30);
  data.streakCalendar.forEach((day) => {
    expect(STREAK_STATES).toContain(day.state);
    expect(day.enterpriseRuns).toBeGreaterThanOrEqual(0);
    expect(day.orgRuns).toBeGreaterThanOrEqual(0);
    if (day.state === 'none') {
      expect(day.enterpriseRuns).toBe(0);
      expect(day.orgRuns).toBe(0);
    }
  });

  // ── dimensions + their leaderboards ──
  DIMENSION_KEYS.forEach((key) => {
    const standing = data.dimensions[key];
    expect(standing).toBeDefined();
    expect(standing.rank).toBeGreaterThanOrEqual(0);
    expect(standing.rank).toBeLessThanOrEqual(standing.totalRanked);

    const rows = data.dimensionLeaderboards[key];
    expect(Array.isArray(rows)).toBe(true);
    const values = rows.map((row) => {
      expect(typeof row.id).toBe('string');
      expect(typeof row.name).toBe('string');
      expect(typeof row.value).toBe('number');
      return row.value;
    });
    expect([...values].sort((a, b) => b - a)).toEqual(values);
    expect(rows.filter((row) => row.isCurrentUser).length).toBeLessThanOrEqual(1);
  });

  // ── organization leaderboard: dense ranking from 1, one "current" org ──
  const ranks = data.organizationLeaderboard.map((org) => org.rank);
  expect(ranks).toEqual(data.organizationLeaderboard.map((_, i) => i + 1));
  const currentOrgs = data.organizationLeaderboard.filter((org) => org.isCurrentOrg);
  expect(currentOrgs.length).toBeLessThanOrEqual(1);
  if (currentOrgs.length === 1) {
    expect(data.currentOrgStanding.rank).toBe(currentOrgs[0].rank);
    expect(data.currentOrgStanding.totalRuns).toBe(currentOrgs[0].runs);
  }

  // ── achievements: known ids, no duplicates ──
  expect(new Set(data.earnedUserAchievements).size).toBe(data.earnedUserAchievements.length);
  data.earnedUserAchievements.forEach((id) => expect(MILESTONE_BADGE_IDS).toContain(id));
  expect(new Set(data.earnedOrgAchievements).size).toBe(data.earnedOrgAchievements.length);
  data.earnedOrgAchievements.forEach((id) => expect(ORG_BADGE_IDS).toContain(id));

  // ── sync timestamp: absent or a real instant ──
  if (data.lastSyncedAt !== null) {
    expect(Number.isNaN(Date.parse(data.lastSyncedAt))).toBe(false);
  }
}

describe('useAutomationLeaderboardsView', () => {
  test('should resolve synchronously with no loading or error state', () => {
    const { result } = renderHook(() => useAutomationLeaderboardsView());

    expect(typeof result.current.isLoading).toBe('boolean');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  test('should satisfy the leaderboards data contract', () => {
    const { result } = renderHook(() => useAutomationLeaderboardsView());

    assertLeaderboardsContract(result.current);
  });

  test('should currently surface the populated mock, not an empty window', () => {
    const { result } = renderHook(() => useAutomationLeaderboardsView());

    expect(result.current.organizationLeaderboard.length).toBeGreaterThan(0);
    expect(result.current.streakCalendar).toHaveLength(30);
    DIMENSION_KEYS.forEach((key) => {
      expect(result.current.dimensionLeaderboards[key].length).toBeGreaterThan(0);
    });
  });
});

describe('AutomationLeaderboardsData fixtures', () => {
  test('the mock fixture satisfies the contract', () => {
    assertLeaderboardsContract(MOCK_LEADERBOARDS);
  });

  test('the empty-window fixture satisfies the contract', () => {
    assertLeaderboardsContract(EMPTY_LEADERBOARDS);

    expect(EMPTY_LEADERBOARDS.lastSyncedAt).toBeNull();
    expect(EMPTY_LEADERBOARDS.organizationLeaderboard).toEqual([]);
    expect(EMPTY_LEADERBOARDS.streakCalendar).toEqual([]);
    expect(EMPTY_LEADERBOARDS.earnedUserAchievements).toEqual([]);
  });
});
