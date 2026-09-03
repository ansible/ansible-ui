import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { PageDashboardContext } from '@ansible/ansible-ui-framework';
import { AutomationLeaderboards, getLeaderboardCardWidths } from './AutomationLeaderboards';
import type { AutomationLeaderboardsView } from './views/useAutomationLeaderboardsView';
import { useAutomationLeaderboardsView } from './views/useAutomationLeaderboardsView';

vi.mock('@react-hook/resize-observer', () => ({ default: vi.fn() }));
vi.mock('./views/useAutomationLeaderboardsView', () => ({
  useAutomationLeaderboardsView: vi.fn(),
}));

const baseView: AutomationLeaderboardsView = {
  isLoading: false,
  error: undefined,
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
};

function renderLeaderboards(view: Partial<AutomationLeaderboardsView>) {
  vi.mocked(useAutomationLeaderboardsView).mockReturnValue({ ...baseView, ...view });
  return render(
    <MemoryRouter>
      <PageDashboardContext.Provider value={{ columns: 24 }}>
        <AutomationLeaderboards />
      </PageDashboardContext.Provider>
    </MemoryRouter>
  );
}

describe('getLeaderboardCardWidths', () => {
  test('should keep both card rows at the default widths on a narrow grid', () => {
    expect(getLeaderboardCardWidths(12)).toEqual({ topCardsWidth: 'lg', bottomCardsWidth: 'lg' });
    expect(getLeaderboardCardWidths(15)).toEqual({ topCardsWidth: 'lg', bottomCardsWidth: 'lg' });
  });

  test('should widen the top row and narrow the bottom row on a medium grid', () => {
    expect(getLeaderboardCardWidths(16)).toEqual({ topCardsWidth: 'xl', bottomCardsWidth: 'md' });
    expect(getLeaderboardCardWidths(23)).toEqual({ topCardsWidth: 'xl', bottomCardsWidth: 'md' });
  });

  test('should use the widest top cards and revert the bottom row on a wide grid', () => {
    expect(getLeaderboardCardWidths(24)).toEqual({ topCardsWidth: 'xxl', bottomCardsWidth: 'lg' });
  });
});

describe('AutomationLeaderboards', () => {
  afterEach(() => vi.clearAllMocks());

  test('should show only a loading spinner while the view is loading', () => {
    renderLeaderboards({ isLoading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'No leaderboard data yet' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/last sync on .+ UTC/)).not.toBeInTheDocument();
  });

  test('should show the empty state when the report has never been synced', () => {
    renderLeaderboards({ isLoading: false, lastSyncedAt: null });

    expect(screen.getByRole('heading', { name: 'No leaderboard data yet' })).toBeInTheDocument();
    expect(
      screen.getByText(/Leaderboard data will appear here once job runs have been recorded/)
    ).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  test('should show the error state with the error message when the view errors', () => {
    renderLeaderboards({ isLoading: false, error: new Error('Metrics service unavailable') });

    expect(
      screen.getByRole('heading', { name: 'Unable to load leaderboards' })
    ).toBeInTheDocument();
    expect(screen.getByText('Metrics service unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText(/last sync on .+ UTC/)).not.toBeInTheDocument();
  });

  test('should prefer the error state over the never-synced empty state', () => {
    renderLeaderboards({ isLoading: false, lastSyncedAt: null, error: new Error('boom') });

    expect(
      screen.getByRole('heading', { name: 'Unable to load leaderboards' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'No leaderboard data yet' })
    ).not.toBeInTheDocument();
  });

  test('should show the loading spinner instead of the error state while still loading', () => {
    renderLeaderboards({ isLoading: true, error: new Error('boom') });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Unable to load leaderboards' })
    ).not.toBeInTheDocument();
  });
});
