import { renderHook, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { metricsAPI } from '../../../common/api/metrics-utils';
import type { IAutomationDashboardCollectionStatus } from '../types';
import {
  AutomationLeaderboardsData,
  DimensionKey,
  ILeaderboardReport,
  MILESTONE_BADGE_IDS,
  ORG_BADGE_IDS,
  mapLeaderboardReport,
  useAutomationLeaderboardsView,
} from './useAutomationLeaderboardsView';
import { MOCK_LEADERBOARD_REPORT } from './useAutomationLeaderboardsView.fixtures';

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

const DIMENSION_KEYS: DimensionKey[] = ['volume', 'breadth', 'consistency'];
const STREAK_STATES = ['enterpriseAndOrg', 'enterpriseOnly', 'none'];

/**
 * Assertions that must hold for ANY `AutomationLeaderboardsData` the hook resolves to —
 * the mapped mock report, the empty-window defaults, or a real API payload tomorrow.
 * Value-specific checks ("jobsRun === 1234") belong nowhere: they only track the fixture.
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

describe('mapLeaderboardReport', () => {
  test('should satisfy the general AutomationLeaderboardsData contract', () => {
    assertLeaderboardsContract(mapLeaderboardReport(MOCK_LEADERBOARD_REPORT));
  });

  test('should map at-a-glance summary fields from the raw report', () => {
    const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

    expect(data.atAGlance).toEqual({
      jobsRun: 1234,
      activeOrganizations: 56,
      featuredTemplate: { name: 'Infrastructure provisioning', runs: 3558 },
      enterpriseStreakDays: 16,
      orgStreakDays: 8,
    });
  });

  test('should always return a null lastSyncedAt (set by the hook, not derivable from the report)', () => {
    const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

    expect(data.lastSyncedAt).toBeNull();
  });

  describe('streak calendar', () => {
    test('should zip enterprise and org daily runs by date into "enterpriseAndOrg" when both ran', () => {
      const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

      expect(data.streakCalendar[0]).toEqual({
        dateStr: 'Aug 19',
        state: 'enterpriseAndOrg',
        enterpriseRuns: 164,
        orgRuns: 96,
      });
    });

    test('should mark a day "enterpriseOnly" when the org has no matching daily entry', () => {
      const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

      expect(data.streakCalendar[1]).toEqual({
        dateStr: 'Aug 20',
        state: 'enterpriseOnly',
        enterpriseRuns: 167,
        orgRuns: 0,
      });
    });

    test('should mark a day "none" when the enterprise had zero successful runs', () => {
      const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

      expect(data.streakCalendar[2]).toEqual({
        dateStr: 'Aug 21',
        state: 'none',
        enterpriseRuns: 0,
        orgRuns: 0,
      });
    });
  });

  describe('dimensions', () => {
    test("should read the score from the current user's own leaderboard row when present", () => {
      const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

      expect(data.dimensions.volume).toEqual({ score: 487, rank: 3, totalRanked: 84 });
      expect(data.dimensions.breadth).toEqual({ score: 12, rank: 1, totalRanked: 84 });
    });

    test('should report a null score, not 0, when the current user is ranked but outside the returned top 10', () => {
      const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

      expect(data.dimensions.consistency).toEqual({ score: null, rank: 14, totalRanked: 84 });
    });

    test('should report a 0 score for an unranked dimension (rank 0, no activity)', () => {
      const report: ILeaderboardReport = {
        ...MOCK_LEADERBOARD_REPORT,
        activity_levels: [{ id: 'volume', current_user_rank: 0, total_users: 84, leaderboard: [] }],
      };

      expect(mapLeaderboardReport(report).dimensions.volume).toEqual({
        score: 0,
        rank: 0,
        totalRanked: 84,
      });
    });

    test('should map each dimension leaderboard row, including the isCurrentUser flag', () => {
      const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

      expect(data.dimensionLeaderboards.volume).toEqual([
        { id: '1', name: 'SL', value: 612, isCurrentUser: undefined },
        { id: '2', name: 'AG', value: 540, isCurrentUser: undefined },
        { id: '3', name: 'Jamie Ortiz', value: 487, isCurrentUser: true },
      ]);
    });
  });

  describe('organization leaderboard', () => {
    test('should map every row and flag only the one matching user_organization_rank as current', () => {
      const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

      expect(data.organizationLeaderboard).toEqual([
        { id: '1', name: 'Platform Engineering', runs: 2840, rank: 1, isCurrentOrg: true },
        { id: '2', name: 'Security Operations', runs: 1923, rank: 2, isCurrentOrg: false },
        { id: '3', name: 'Cloud Infrastructure', runs: 1654, rank: 3, isCurrentOrg: false },
      ]);
    });

    test('should take currentOrgStanding.totalRuns from the matching top-10 row when present', () => {
      const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

      expect(data.currentOrgStanding).toEqual({ rank: 1, totalRuns: 2840 });
    });

    test('should fall back to org_streak.organization.run_count when the org is outside the top 10', () => {
      const report: ILeaderboardReport = {
        ...MOCK_LEADERBOARD_REPORT,
        organization_leaderboard: {
          ...MOCK_LEADERBOARD_REPORT.organization_leaderboard,
          user_organization_rank: 27,
        },
      };

      const data = mapLeaderboardReport(report);

      expect(data.currentOrgStanding).toEqual({ rank: 27, totalRuns: 2840 });
      expect(data.organizationLeaderboard.every((org) => !org.isCurrentOrg)).toBe(true);
    });
  });

  describe('missing or null API fields', () => {
    test('should map a report with null lists and no featured template or organization without throwing', () => {
      const report: ILeaderboardReport = {
        ...MOCK_LEADERBOARD_REPORT,
        featured_template: null,
        enterprise_streak: { streak: 0, daily: null },
        org_streak: { streak: 0, daily: null, organization: null },
        organization_leaderboard: {
          user_organization_rank: 0,
          total_organizations: 0,
          leaderboard: null,
        },
        activity_levels: null,
        org_achievements: null,
        user_achievements: null,
      };

      const data = mapLeaderboardReport(report);

      expect(data.atAGlance.featuredTemplate).toEqual({ name: '', runs: 0 });
      expect(data.streakCalendar).toEqual([]);
      expect(data.organizationLeaderboard).toEqual([]);
      expect(data.currentOrgStanding).toEqual({ rank: 0, totalRuns: 0 });
      expect(data.dimensions.volume).toEqual({ score: 0, rank: 0, totalRanked: 0 });
      expect(data.dimensionLeaderboards).toEqual({ volume: [], breadth: [], consistency: [] });
      expect(data.earnedUserAchievements).toEqual([]);
      expect(data.earnedOrgAchievements).toEqual([]);
      assertLeaderboardsContract(data);
    });

    test('should tolerate an activity level whose leaderboard is null', () => {
      const report: ILeaderboardReport = {
        ...MOCK_LEADERBOARD_REPORT,
        activity_levels: [
          { id: 'breadth', current_user_rank: 5, total_users: 10, leaderboard: null },
        ],
      };

      const data = mapLeaderboardReport(report);

      expect(data.dimensions.breadth).toEqual({ score: null, rank: 5, totalRanked: 10 });
      expect(data.dimensionLeaderboards.breadth).toEqual([]);
    });
  });

  describe('achievements', () => {
    test('should map known snake_case badge ids to their camelCase ids', () => {
      const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

      expect(data.earnedUserAchievements).toEqual([
        'ignition',
        'weekWarrior',
        'explorer',
        'centurion',
      ]);
      expect(data.earnedOrgAchievements).toEqual(['sustained', 'rising']);
    });

    test('should silently drop badge ids the client does not recognize', () => {
      const data = mapLeaderboardReport(MOCK_LEADERBOARD_REPORT);

      expect(data.earnedUserAchievements).not.toContain('not_a_real_badge');
      expect(data.earnedOrgAchievements).not.toContain('not_a_real_badge');
    });
  });
});

describe('useAutomationLeaderboardsView', () => {
  const collectionStatusFixture: IAutomationDashboardCollectionStatus = {
    enabled: true,
    next_run: null,
    initial_collection_status: 'completed',
    min_collection_timestamp: '2026-09-01T14:00:00.000Z',
  };

  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  function mockEndpoints({
    leaderboard = HttpResponse.json(MOCK_LEADERBOARD_REPORT),
    collectionStatus = HttpResponse.json(collectionStatusFixture),
  }: { leaderboard?: Response; collectionStatus?: Response } = {}) {
    server.use(
      http.get(metricsAPI`/dashboard_reports/leaderboard/`, () => leaderboard),
      http.get(metricsAPI`/dashboard_reports/collection_status/`, () => collectionStatus)
    );
  }

  test('should start in a loading state with empty-window defaults', () => {
    mockEndpoints();

    const { result } = renderHook(() => useAutomationLeaderboardsView(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.organizationLeaderboard).toEqual([]);
    expect(result.current.currentOrgStanding).toEqual({ rank: 0, totalRuns: 0 });
    assertLeaderboardsContract(result.current);
  });

  test('should resolve to the mapped report once both endpoints respond', async () => {
    mockEndpoints();

    const { result } = renderHook(() => useAutomationLeaderboardsView(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.organizationLeaderboard).toHaveLength(3);
    expect(result.current.atAGlance.jobsRun).toBe(1234);
    expect(result.current.error).toBeUndefined();
    assertLeaderboardsContract(result.current);
  });

  test("should derive lastSyncedAt from collection_status's min_collection_timestamp as an ISO string", async () => {
    mockEndpoints();

    const { result } = renderHook(() => useAutomationLeaderboardsView(), { wrapper });

    await waitFor(() => expect(result.current.lastSyncedAt).not.toBeNull());

    expect(result.current.lastSyncedAt).toBe('2026-09-01T14:00:00.000Z');
  });

  test('should normalize a non-UTC-offset timestamp string to a UTC ISO string', async () => {
    mockEndpoints({
      collectionStatus: HttpResponse.json({
        ...collectionStatusFixture,
        min_collection_timestamp: '2026-09-01T16:00:00+02:00',
      }),
    });

    const { result } = renderHook(() => useAutomationLeaderboardsView(), { wrapper });

    await waitFor(() => expect(result.current.lastSyncedAt).not.toBeNull());

    expect(result.current.lastSyncedAt).toBe('2026-09-01T14:00:00.000Z');
  });

  test('should surface a null lastSyncedAt when the timestamp is unparseable', async () => {
    mockEndpoints({
      collectionStatus: HttpResponse.json({
        ...collectionStatusFixture,
        min_collection_timestamp: 'not-a-date',
      }),
    });

    const { result } = renderHook(() => useAutomationLeaderboardsView(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.lastSyncedAt).toBeNull();
  });

  test('should surface a null lastSyncedAt when the report has never been synced', async () => {
    mockEndpoints({
      collectionStatus: HttpResponse.json({
        ...collectionStatusFixture,
        min_collection_timestamp: null,
      }),
    });

    const { result } = renderHook(() => useAutomationLeaderboardsView(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.lastSyncedAt).toBeNull();
  });

  test('should stay loading while collection_status is in flight after the leaderboard resolves', async () => {
    server.use(
      http.get(metricsAPI`/dashboard_reports/leaderboard/`, () =>
        HttpResponse.json(MOCK_LEADERBOARD_REPORT)
      ),
      http.get(metricsAPI`/dashboard_reports/collection_status/`, async () => {
        await delay(100);
        return HttpResponse.json(collectionStatusFixture);
      })
    );

    const { result } = renderHook(() => useAutomationLeaderboardsView(), { wrapper });

    await waitFor(() => expect(result.current.atAGlance.jobsRun).toBe(1234));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.lastSyncedAt).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lastSyncedAt).toBe('2026-09-01T14:00:00.000Z');
  });

  test('should return empty-window defaults and the error when the leaderboard request fails', async () => {
    mockEndpoints({ leaderboard: HttpResponse.json({}, { status: 500 }) });

    const { result } = renderHook(() => useAutomationLeaderboardsView(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.collectionStatusError).toBeUndefined();
    expect(result.current.organizationLeaderboard).toEqual([]);
  });

  test('should expose collectionStatusError separately from error when only collection_status fails', async () => {
    mockEndpoints({ collectionStatus: HttpResponse.json({}, { status: 500 }) });

    const { result } = renderHook(() => useAutomationLeaderboardsView(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.collectionStatusError).toBeDefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.lastSyncedAt).toBeNull();
    expect(result.current.atAGlance.jobsRun).toBe(1234);
  });

  test('should still resolve lastSyncedAt from collection_status even when the leaderboard request fails', async () => {
    mockEndpoints({ leaderboard: HttpResponse.json({}, { status: 500 }) });

    const { result } = renderHook(() => useAutomationLeaderboardsView(), { wrapper });

    await waitFor(() => expect(result.current.lastSyncedAt).not.toBeNull());

    expect(result.current.lastSyncedAt).toBe('2026-09-01T14:00:00.000Z');
  });
});
