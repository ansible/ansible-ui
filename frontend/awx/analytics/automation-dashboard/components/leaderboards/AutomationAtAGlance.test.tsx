import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AutomationAtAGlance } from './AutomationAtAGlance';
import type {
  AutomationLeaderboardsView,
  StreakDay,
} from '../../views/useAutomationLeaderboardsView';

vi.mock('@react-hook/resize-observer', () => ({ default: vi.fn() }));

// A 3-day calendar keeps the render cheap — StreakDayStrip's own behaviour is covered in
// StreakDayStrip.test.tsx; here we only care that AutomationAtAGlance wires the view into
// the tiles and the two strips.
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

describe('AutomationAtAGlance', () => {
  test('should render the KPI tiles with values formatted from the view', () => {
    render(<AutomationAtAGlance />);

    expect(screen.getByRole('heading', { name: 'Jobs run' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '1,234' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '56' })).toBeInTheDocument();
    expect(screen.getByText('Infrastructure provisioning')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '3,558 runs' })).toBeInTheDocument();
  });

  test('should render an enterprise and an org streak strip fed by the same calendar', () => {
    const { container } = render(<AutomationAtAGlance />);

    expect(screen.getByRole('heading', { name: 'Enterprise' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your org' })).toBeInTheDocument();
    expect(screen.getByText('16-day streak')).toBeInTheDocument();
    expect(screen.getByText('8-day streak')).toBeInTheDocument();
    // One cell per calendar day in each of the two strips.
    expect(container.querySelectorAll('.streak-heat-cell')).toHaveLength(streakCalendar.length * 2);
  });
});
