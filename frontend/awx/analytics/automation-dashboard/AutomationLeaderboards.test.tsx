import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  PageDashboardCard,
  PageDashboardCardWidth,
  PageDashboardContext,
} from '@ansible/ansible-ui-framework';
import {
  AutomationLeaderboards,
  CARD_WIDTH_COL_SPAN,
  getLeaderboardCardWidths,
} from './AutomationLeaderboards';
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

describe('CARD_WIDTH_COL_SPAN', () => {
  test('should match the column span PageDashboardCard itself derives from each width tier', () => {
    (Object.keys(CARD_WIDTH_COL_SPAN) as PageDashboardCardWidth[]).forEach((width) => {
      const { container, unmount } = render(
        <PageDashboardContext.Provider value={{ columns: 24 }}>
          <PageDashboardCard width={width}>content</PageDashboardCard>
        </PageDashboardContext.Provider>
      );

      const card = container.querySelector('.page-dashboard-card') as HTMLElement;
      expect(card.style.gridColumn).toBe(`span ${CARD_WIDTH_COL_SPAN[width]}`);

      unmount();
    });
  });
});

describe('getLeaderboardCardWidths', () => {
  test('should keep both card rows at the default widths below 18 columns', () => {
    expect(getLeaderboardCardWidths(12)).toEqual({ topCardsWidth: 'lg', bottomCardsWidth: 'lg' });
    expect(getLeaderboardCardWidths(17)).toEqual({ topCardsWidth: 'lg', bottomCardsWidth: 'lg' });
  });

  test('should widen the top row and narrow the bottom row from 18 to 24 columns', () => {
    expect(getLeaderboardCardWidths(18)).toEqual({ topCardsWidth: 'xxl', bottomCardsWidth: 'md' });
    expect(getLeaderboardCardWidths(24)).toEqual({ topCardsWidth: 'xxl', bottomCardsWidth: 'md' });
  });

  test('should keep the widest top cards and revert the bottom row past 24 columns', () => {
    expect(getLeaderboardCardWidths(25)).toEqual({ topCardsWidth: 'xxl', bottomCardsWidth: 'lg' });
  });
});

describe('AutomationLeaderboards', () => {
  afterEach(() => vi.clearAllMocks());

  // Renders the full card tree (unlike the other tests below, which all short-circuit before
  // it) — that's ~4-5s under load, so it needs a longer timeout than the 5s default.
  test('should render the sync timestamp and every leaderboard section on the happy path', () => {
    renderLeaderboards({});

    expect(screen.getByText(/Updated: .+/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'At a glance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Streak' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Activity levels' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Top 10 organizations' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '30-day achievements' })).toBeInTheDocument();
  }, 15000);

  test('should show only a loading spinner while the view is loading', () => {
    renderLeaderboards({ isLoading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'No leaderboard data yet' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Updated: .+/)).not.toBeInTheDocument();
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
    expect(screen.queryByText(/Updated: .+/)).not.toBeInTheDocument();
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
