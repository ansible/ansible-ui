import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HighlightsLeaderboardPanel } from './HighlightsLeaderboardPanel';
import { useAutomationLeaderboardsView } from '../../views/useAutomationLeaderboardsView';
import type { AutomationLeaderboardsView } from '../../views/useAutomationLeaderboardsView';

const baseView: AutomationLeaderboardsView = {
  isLoading: false,
  error: undefined,
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
  organizationLeaderboard: [
    { id: '1', name: 'Platform Engineering', runs: 2840, rank: 1, isCurrentOrg: true },
    { id: '10', name: 'IT Operations', runs: 187, rank: 10 },
  ],
  currentOrgStanding: { rank: 1, totalRuns: 2840 },
  earnedUserAchievements: [],
  earnedOrgAchievements: [],
};

vi.mock('../../views/useAutomationLeaderboardsView', () => ({
  useAutomationLeaderboardsView: vi.fn(),
}));

function renderPanel() {
  return render(
    <MemoryRouter>
      <HighlightsLeaderboardPanel />
    </MemoryRouter>
  );
}

describe('HighlightsLeaderboardPanel', () => {
  beforeEach(() => {
    vi.mocked(useAutomationLeaderboardsView).mockReturnValue(baseView);
  });

  test('should render the ranked organizations from the view', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: 'Top 10 organizations' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Organization' })).toBeInTheDocument();
    expect(screen.getByText('Platform Engineering')).toBeInTheDocument();
    expect(screen.getByText('IT Operations')).toBeInTheDocument();
    expect(screen.getByText('2,840')).toBeInTheDocument();
  });

  test('should tag the current org and show its standing in the header', () => {
    renderPanel();

    expect(screen.getByText('Your organization')).toBeInTheDocument();
    expect(screen.getByText("Your organization's rank: #1")).toBeInTheDocument();
    expect(screen.getByText('2,840 job runs')).toBeInTheDocument();
  });

  test('should keep the "Your organization" label on one line instead of wrapping under the name', () => {
    renderPanel();

    const label = screen.getByText('Your organization');
    // The label never wraps onto its own line — it's a non-shrinking flex item next to the
    // (independently truncating) org name, laid out via PatternFly's `Flex` (which applies
    // `display: flex` through its own `pf-v6-l-flex` stylesheet class, not an inline style).
    expect(label.closest('.pf-v6-l-flex')).toBeInTheDocument();
    expect(label.closest('[style*="flex-shrink"]')).toHaveStyle({ flexShrink: '0' });
  });

  test('should omit the rank summary header entirely when the org has no rank yet', () => {
    vi.mocked(useAutomationLeaderboardsView).mockReturnValue({
      ...baseView,
      currentOrgStanding: { rank: 0, totalRuns: 0 },
    });

    renderPanel();

    expect(screen.queryByText(/Your organization's rank/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^[\d,]+ job runs$/)).not.toBeInTheDocument();
  });
});
