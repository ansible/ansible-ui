/**
 * Raw `/dashboard_reports/leaderboard/` API fixture for `useAutomationLeaderboardsView` tests —
 * the shape `mapLeaderboardReport` consumes, not the mapped `AutomationLeaderboardsData` shape
 * it produces.
 */
import type { ILeaderboardReport } from './useAutomationLeaderboardsView';

export const MOCK_LEADERBOARD_REPORT: ILeaderboardReport = {
  job_runs: 1234,
  active_organizations: 56,
  featured_template: { id: 9, name: 'Infrastructure provisioning', run_count: 3558 },
  enterprise_streak: {
    streak: 16,
    daily: [
      { date: '2026-08-19', successful_runs: 164 },
      { date: '2026-08-20', successful_runs: 167 },
      { date: '2026-08-21', successful_runs: 0 },
    ],
  },
  org_streak: {
    streak: 8,
    organization: { id: 1, name: 'Platform Engineering', run_count: 2840 },
    daily: [
      { date: '2026-08-19', successful_runs: 96 },
      // 2026-08-20 deliberately absent — exercises the "enterprise ran, org didn't sync
      // that day" zip case in mapStreakCalendar.
    ],
  },
  organization_leaderboard: {
    user_organization_rank: 1,
    total_organizations: 42,
    leaderboard: [
      { rank: 1, name: 'Platform Engineering', runs: 2840 },
      { rank: 2, name: 'Security Operations', runs: 1923 },
      { rank: 3, name: 'Cloud Infrastructure', runs: 1654 },
    ],
  },
  org_achievements: ['sustained', 'rising', 'not_a_real_badge'],
  activity_levels: [
    {
      id: 'volume',
      current_user_rank: 3,
      total_users: 84,
      leaderboard: [
        { rank: 1, username: 'SL', runs: 612 },
        { rank: 2, username: 'AG', runs: 540 },
        { rank: 3, username: 'Jamie Ortiz', runs: 487, is_current_user: true },
      ],
    },
    {
      id: 'breadth',
      current_user_rank: 1,
      total_users: 84,
      leaderboard: [{ rank: 1, username: 'Jamie Ortiz', runs: 12, is_current_user: true }],
    },
    {
      // The current user is ranked 14th — outside the returned top-10 leaderboard, so no row
      // here carries `is_current_user`. Exercises the "own score is unknown (null)" mapping case.
      id: 'consistency',
      current_user_rank: 14,
      total_users: 84,
      leaderboard: [{ rank: 1, username: 'MC', runs: 29 }],
    },
  ],
  user_achievements: ['ignition', 'week_warrior', 'explorer', 'centurion', 'not_a_real_badge'],
};
