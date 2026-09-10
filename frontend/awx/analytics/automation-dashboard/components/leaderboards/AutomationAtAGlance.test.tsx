import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AutomationAtAGlance, getAtAGlanceKpiCardWidth } from './AutomationAtAGlance';
import type {
  AutomationLeaderboardsView,
  StreakDay,
} from '../../views/useAutomationLeaderboardsView';

vi.mock('@react-hook/resize-observer', () => ({ default: vi.fn() }));

// The streak strips moved to AutomationStreak; this calendar only satisfies the view type
// here — the strips themselves are covered in AutomationStreak.test.tsx.
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

describe('getAtAGlanceKpiCardWidth', () => {
  test('should use lg up to 17 columns', () => {
    expect(getAtAGlanceKpiCardWidth(1)).toBe('lg');
    expect(getAtAGlanceKpiCardWidth(17)).toBe('lg');
  });

  test('should use sm from 18 to 23 columns', () => {
    expect(getAtAGlanceKpiCardWidth(18)).toBe('sm');
    expect(getAtAGlanceKpiCardWidth(23)).toBe('sm');
  });

  test('should use md from 24 columns up', () => {
    expect(getAtAGlanceKpiCardWidth(24)).toBe('md');
    expect(getAtAGlanceKpiCardWidth(32)).toBe('md');
  });
});

describe('AutomationAtAGlance', () => {
  test('should render the KPI tiles with values formatted from the view', () => {
    render(<AutomationAtAGlance />);

    expect(screen.getByRole('heading', { name: 'At a glance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Jobs run' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '1,234' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '56' })).toBeInTheDocument();
    expect(screen.getByText('Infrastructure provisioning')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '3,558 runs' })).toBeInTheDocument();
  });

  test('should label each KPI tile with its dimension', () => {
    render(<AutomationAtAGlance />);

    expect(screen.getByRole('heading', { name: 'Velocity' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reach' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Usage' })).toBeInTheDocument();
  });

  test('should not render the streak strips (moved to AutomationStreak)', () => {
    const { container } = render(<AutomationAtAGlance />);

    expect(screen.queryByRole('heading', { name: 'Enterprise' })).not.toBeInTheDocument();
    expect(container.querySelectorAll('.streak-heat-cell')).toHaveLength(0);
  });
});
