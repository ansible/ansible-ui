/**
 * Mock data for `useAutomationLeaderboardsView`, kept out of the hook module so it can be
 * shared with tests and swapped for a real API response without touching component code.
 *
 * `MOCK_LEADERBOARDS` is the shape the analytics report is expected to return; `EMPTY_LEADERBOARDS`
 * is the "synced, but nothing to show yet" case (empty lists, zero counts, no sync timestamp).
 */
import type { AutomationLeaderboardsData, StreakDay } from './useAutomationLeaderboardsView';

const MOCK_STREAK_CALENDAR: StreakDay[] = [
  { dateStr: 'Jul 23', state: 'enterpriseAndOrg', enterpriseRuns: 80, orgRuns: 40 },
  { dateStr: 'Jul 24', state: 'enterpriseOnly', enterpriseRuns: 83, orgRuns: 0 },
  { dateStr: 'Jul 25', state: 'enterpriseAndOrg', enterpriseRuns: 86, orgRuns: 44 },
  { dateStr: 'Jul 26', state: 'enterpriseAndOrg', enterpriseRuns: 89, orgRuns: 46 },
  { dateStr: 'Jul 27', state: 'none', enterpriseRuns: 0, orgRuns: 0 },
  { dateStr: 'Jul 28', state: 'enterpriseAndOrg', enterpriseRuns: 95, orgRuns: 50 },
  { dateStr: 'Jul 29', state: 'none', enterpriseRuns: 0, orgRuns: 0 },
  { dateStr: 'Jul 30', state: 'enterpriseOnly', enterpriseRuns: 101, orgRuns: 0 },
  { dateStr: 'Jul 31', state: 'enterpriseAndOrg', enterpriseRuns: 104, orgRuns: 56 },
  { dateStr: 'Aug 1', state: 'enterpriseOnly', enterpriseRuns: 107, orgRuns: 0 },
  { dateStr: 'Aug 2', state: 'enterpriseAndOrg', enterpriseRuns: 110, orgRuns: 60 },
  { dateStr: 'Aug 3', state: 'enterpriseOnly', enterpriseRuns: 113, orgRuns: 0 },
  { dateStr: 'Aug 4', state: 'enterpriseAndOrg', enterpriseRuns: 116, orgRuns: 64 },
  { dateStr: 'Aug 5', state: 'none', enterpriseRuns: 0, orgRuns: 0 },
  { dateStr: 'Aug 6', state: 'enterpriseOnly', enterpriseRuns: 122, orgRuns: 0 },
  { dateStr: 'Aug 7', state: 'enterpriseOnly', enterpriseRuns: 125, orgRuns: 0 },
  { dateStr: 'Aug 8', state: 'enterpriseAndOrg', enterpriseRuns: 128, orgRuns: 72 },
  { dateStr: 'Aug 9', state: 'enterpriseOnly', enterpriseRuns: 131, orgRuns: 0 },
  { dateStr: 'Aug 10', state: 'enterpriseAndOrg', enterpriseRuns: 134, orgRuns: 76 },
  { dateStr: 'Aug 11', state: 'enterpriseOnly', enterpriseRuns: 137, orgRuns: 0 },
  { dateStr: 'Aug 12', state: 'enterpriseOnly', enterpriseRuns: 140, orgRuns: 0 },
  { dateStr: 'Aug 13', state: 'enterpriseOnly', enterpriseRuns: 143, orgRuns: 0 },
  { dateStr: 'Aug 14', state: 'enterpriseAndOrg', enterpriseRuns: 146, orgRuns: 84 },
  { dateStr: 'Aug 15', state: 'enterpriseAndOrg', enterpriseRuns: 149, orgRuns: 86 },
  { dateStr: 'Aug 16', state: 'enterpriseAndOrg', enterpriseRuns: 152, orgRuns: 88 },
  { dateStr: 'Aug 17', state: 'enterpriseAndOrg', enterpriseRuns: 155, orgRuns: 90 },
  { dateStr: 'Aug 18', state: 'enterpriseAndOrg', enterpriseRuns: 158, orgRuns: 92 },
  { dateStr: 'Aug 19', state: 'enterpriseAndOrg', enterpriseRuns: 161, orgRuns: 94 },
  { dateStr: 'Aug 20', state: 'enterpriseAndOrg', enterpriseRuns: 164, orgRuns: 96 },
  { dateStr: 'Aug 21', state: 'enterpriseAndOrg', enterpriseRuns: 167, orgRuns: 98 },
];

export const MOCK_LEADERBOARDS: AutomationLeaderboardsData = {
  lastSyncedAt: '2026-09-01T14:00:00.000Z',
  atAGlance: {
    jobsRun: 1234,
    activeOrganizations: 56,
    featuredTemplate: { name: 'Infrastructure provisioning', runs: 3558 },
    enterpriseStreakDays: 16,
    orgStreakDays: 8,
  },
  streakCalendar: MOCK_STREAK_CALENDAR,
  dimensions: {
    volume: { score: 487, rank: 3, totalRanked: 84 },
    breadth: { score: 12, rank: 1, totalRanked: 84 },
    // 14th of 84 — the user is outside their own dimension top 10, unlike volume/breadth.
    consistency: { score: 9, rank: 14, totalRanked: 84 },
  },
  dimensionLeaderboards: {
    volume: [
      { id: 'u-6', name: 'SL', value: 612 },
      { id: 'u-2', name: 'AG', value: 540 },
      { id: 'current-user', name: 'Jamie Ortiz', value: 487, isCurrentUser: true },
      { id: 'u-3', name: 'MC', value: 430 },
      { id: 'u-7', name: 'JK', value: 388 },
      { id: 'u-4', name: 'KW', value: 350 },
      { id: 'u-8', name: 'TB', value: 301 },
      { id: 'u-5', name: 'RP', value: 275 },
      { id: 'u-9', name: 'CM', value: 240 },
      { id: 'u-10', name: 'PN', value: 205 },
    ],
    breadth: [
      { id: 'current-user', name: 'Jamie Ortiz', value: 12, isCurrentUser: true },
      { id: 'u-2', name: 'AG', value: 11 },
      { id: 'u-3', name: 'MC', value: 10 },
      { id: 'u-6', name: 'SL', value: 9 },
      { id: 'u-4', name: 'KW', value: 8 },
      { id: 'u-7', name: 'JK', value: 8 },
      { id: 'u-5', name: 'RP', value: 7 },
      { id: 'u-8', name: 'TB', value: 6 },
      { id: 'u-9', name: 'CM', value: 5 },
      { id: 'u-10', name: 'PN', value: 4 },
    ],
    consistency: [
      { id: 'u-3', name: 'MC', value: 29 },
      { id: 'u-2', name: 'AG', value: 28 },
      { id: 'u-6', name: 'SL', value: 27 },
      { id: 'u-4', name: 'KW', value: 25 },
      { id: 'u-7', name: 'JK', value: 21 },
      { id: 'u-5', name: 'RP', value: 19 },
      { id: 'u-8', name: 'TB', value: 17 },
      { id: 'u-9', name: 'CM', value: 15 },
      { id: 'u-11', name: 'ML', value: 13 },
      { id: 'u-10', name: 'PN', value: 12 },
    ],
  },
  organizationLeaderboard: [
    { id: '1', name: 'Platform Engineering', runs: 2840, rank: 1, isCurrentOrg: true },
    { id: '2', name: 'Security Operations', runs: 1923, rank: 2 },
    { id: '3', name: 'Cloud Infrastructure', runs: 1654, rank: 3 },
    { id: '4', name: 'Application Development', runs: 1201, rank: 4 },
    { id: '5', name: 'Data Analytics', runs: 987, rank: 5 },
    { id: '6', name: 'Network Services', runs: 756, rank: 6 },
    { id: '7', name: 'DevOps Enablement', runs: 534, rank: 7 },
    { id: '8', name: 'Quality Assurance', runs: 412, rank: 8 },
    { id: '9', name: 'Release Management', runs: 298, rank: 9 },
    { id: '10', name: 'IT Operations', runs: 187, rank: 10 },
  ],
  currentOrgStanding: { rank: 1, totalRuns: 2840 },
  earnedUserAchievements: ['ignition', 'weekWarrior', 'explorer', 'centurion'],
  earnedOrgAchievements: ['sustained', 'rising'],
};

/** Synced, but the window holds no activity yet — every list empty, every count zero. */
export const EMPTY_LEADERBOARDS: AutomationLeaderboardsData = {
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
