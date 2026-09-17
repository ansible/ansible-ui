import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AutomationStreak } from './AutomationStreak';
import type {
  AutomationLeaderboardsView,
  StreakDay,
} from '../../views/useAutomationLeaderboardsView';

vi.mock('@react-hook/resize-observer', () => ({ default: vi.fn() }));

// A 3-day calendar keeps the render cheap — StreakDayStrip's own behaviour is covered in
// StreakDayStrip.test.tsx; here we only care that AutomationStreak wires the view into
// the two strips.
const streakCalendar: StreakDay[] = [
  { dateStr: 'Aug 1', state: 'enterpriseAndOrg', enterpriseRuns: 12, orgRuns: 5 },
  { dateStr: 'Aug 2', state: 'enterpriseOnly', enterpriseRuns: 8, orgRuns: 0 },
  { dateStr: 'Aug 3', state: 'none', enterpriseRuns: 0, orgRuns: 0 },
];

const view: AutomationLeaderboardsView = {
  isLoading: false,
  error: undefined,
  lastSyncedAt: '2026-09-01T14:00:00.000Z',
  atAGlance: {
    jobsRun: 1234,
    activeOrganizations: 56,
    featuredTemplate: { name: 'Infrastructure provisioning', runs: 3558 },
    enterpriseStreakDays: 16,
    orgStreakDays: 8,
  },
  streakCalendar,
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

vi.mock('../../views/useAutomationLeaderboardsView', () => ({
  useAutomationLeaderboardsView: () => view,
}));

describe('AutomationStreak', () => {
  test('should render an enterprise and an org streak strip fed by the same calendar', () => {
    const { container } = render(<AutomationStreak />);

    expect(screen.getByRole('heading', { name: 'Enterprise' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your organization' })).toBeInTheDocument();
    expect(screen.getByText('16-day streak')).toBeInTheDocument();
    expect(screen.getByText('8-day streak')).toBeInTheDocument();
    // One cell per calendar day in each of the two strips.
    expect(container.querySelectorAll('.streak-heat-cell')).toHaveLength(streakCalendar.length * 2);
  });

  test('should score the enterprise and org strips from different day states', () => {
    const { container } = render(<AutomationStreak />);

    // Enterprise counts every non-"none" day (2 of 3); the org strip only counts
    // "enterpriseAndOrg" days (1 of 3).
    expect(container.querySelectorAll('.streak-heat-cell--success')).toHaveLength(3);
  });
});
