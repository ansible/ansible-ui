import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import {
  AutomationLeaderboardsView,
  DimensionKey,
  useAutomationLeaderboardsView,
} from './useAutomationLeaderboardsView';

function getView(): AutomationLeaderboardsView {
  const { result } = renderHook(() => useAutomationLeaderboardsView());
  return result.current;
}

describe('useAutomationLeaderboardsView', () => {
  test('should resolve immediately without a loading or error state', () => {
    const view = getView();

    expect(view.isLoading).toBe(false);
    expect(view.error).toBeUndefined();
  });

  test('should expose the at-a-glance summary as numbers', () => {
    const { atAGlance } = getView();

    expect(atAGlance.jobsRun).toBe(1234);
    expect(atAGlance.activeOrganizations).toBe(56);
    expect(atAGlance.featuredTemplate).toEqual({ name: 'Infrastructure provisioning', runs: 3558 });
    expect(atAGlance.enterpriseStreakDays).toBeGreaterThan(atAGlance.orgStreakDays);
  });

  test('should provide a 30-day streak calendar oldest-to-newest', () => {
    const { streakCalendar } = getView();

    expect(streakCalendar).toHaveLength(30);
    expect(streakCalendar[0].dateStr).toBe('Jul 23');
    expect(streakCalendar.at(-1)?.dateStr).toBe('Aug 21');
    streakCalendar.forEach((day) => {
      expect(['enterpriseAndOrg', 'enterpriseOnly', 'none']).toContain(day.state);
      if (day.state === 'none') {
        expect(day.enterpriseRuns).toBe(0);
        expect(day.orgRuns).toBe(0);
      }
    });
  });

  test('should rank each dimension leaderboard by descending value with ten rows', () => {
    const { dimensions, dimensionLeaderboards } = getView();
    const keys: DimensionKey[] = ['volume', 'breadth', 'consistency'];

    keys.forEach((key) => {
      const rows = dimensionLeaderboards[key];
      expect(rows).toHaveLength(10);
      const values = rows.map((row) => row.value);
      expect([...values].sort((a, b) => b - a)).toEqual(values);
      expect(dimensions[key].rank).toBeGreaterThanOrEqual(1);
      expect(dimensions[key].rank).toBeLessThanOrEqual(dimensions[key].totalRanked);
    });
  });

  test('should mark exactly one current-user row across volume and breadth but not consistency', () => {
    const { dimensionLeaderboards } = getView();

    expect(dimensionLeaderboards.volume.filter((row) => row.isCurrentUser)).toHaveLength(1);
    expect(dimensionLeaderboards.breadth.filter((row) => row.isCurrentUser)).toHaveLength(1);
    expect(dimensionLeaderboards.consistency.some((row) => row.isCurrentUser)).toBe(false);
  });

  test('should provide a ten-organization leaderboard ranked 1..10 with one current org', () => {
    const { organizationLeaderboard, currentOrgStanding } = getView();

    expect(organizationLeaderboard.map((org) => org.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const currentOrgs = organizationLeaderboard.filter((org) => org.isCurrentOrg);
    expect(currentOrgs).toHaveLength(1);
    expect(currentOrgStanding.rank).toBe(currentOrgs[0].rank);
    expect(currentOrgStanding.totalRuns).toBe(currentOrgs[0].runs);
  });

  test('should list earned achievements that are a subset of the known badge ids', () => {
    const { earnedUserAchievements, earnedOrgAchievements } = getView();

    expect(earnedUserAchievements).toEqual(['ignition', 'weekWarrior', 'explorer', 'centurion']);
    expect(earnedOrgAchievements).toEqual(['sustained', 'rising']);
  });

  test('should return a valid ISO sync timestamp', () => {
    const { lastSyncedAt } = getView();

    expect(lastSyncedAt).not.toBeNull();
    expect(Number.isNaN(Date.parse(lastSyncedAt ?? ''))).toBe(false);
  });
});
