import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PageDashboardContext } from '@ansible/ansible-ui-framework';
import { AutomationAtAGlance, getAtAGlanceKpiCardWidth } from './AutomationAtAGlance';
import { CARD_WIDTH_COL_SPAN } from '../../common/leaderboardCardWidths';
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

describe('AutomationAtAGlance', () => {
  test('should render the KPI tiles with values formatted from the view', () => {
    render(<AutomationAtAGlance />);

    expect(screen.getByRole('heading', { name: 'At a glance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Jobs run' })).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('56')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure provisioning')).toBeInTheDocument();
    expect(screen.getByText('3,558 runs')).toBeInTheDocument();
  });

  test('should label each KPI tile with its dimension', () => {
    render(<AutomationAtAGlance />);

    expect(screen.getByText('Velocity')).toBeInTheDocument();
    expect(screen.getByText('Reach')).toBeInTheDocument();
    expect(screen.getByText('Usage')).toBeInTheDocument();
  });

  test('should not render the streak strips (moved to AutomationStreak)', () => {
    const { container } = render(<AutomationAtAGlance />);

    expect(screen.queryByRole('heading', { name: 'Enterprise' })).not.toBeInTheDocument();
    expect(container.querySelectorAll('.streak-heat-cell')).toHaveLength(0);
  });
});

describe('getAtAGlanceKpiCardWidth', () => {
  test('should use xxl (clamps to fill the row) up to 11 columns', () => {
    expect(getAtAGlanceKpiCardWidth(1)).toBe('xxl');
    expect(getAtAGlanceKpiCardWidth(11)).toBe('xxl');
  });

  test('should use xs from 12 to 17 columns', () => {
    expect(getAtAGlanceKpiCardWidth(12)).toBe('xs');
    expect(getAtAGlanceKpiCardWidth(17)).toBe('xs');
  });

  test('should use sm from 18 to 23 columns', () => {
    expect(getAtAGlanceKpiCardWidth(18)).toBe('sm');
    expect(getAtAGlanceKpiCardWidth(23)).toBe('sm');
  });

  test('should use md from 24 columns up', () => {
    expect(getAtAGlanceKpiCardWidth(24)).toBe('md');
    expect(getAtAGlanceKpiCardWidth(32)).toBe('md');
  });

  test.each([1, 11, 12, 17, 18, 23, 24, 32])(
    'should render the 3 KPI cards without an uneven wrap at %i grid columns',
    (gridColumns) => {
      const { container } = render(
        <PageDashboardContext.Provider value={{ columns: gridColumns }}>
          <AutomationAtAGlance />
        </PageDashboardContext.Provider>
      );

      const cards = container.querySelectorAll<HTMLElement>('.page-dashboard-card');
      expect(cards).toHaveLength(3);

      // Mirrors PageDashboardCard's own clamp (framework/PageDashboard/PageDashboardCard.tsx):
      // it only shrinks a card's span down to the available column count when the span exceeds
      // it, so every rendered card must carry this exact value.
      const rawSpan = CARD_WIDTH_COL_SPAN[getAtAGlanceKpiCardWidth(gridColumns)];
      const clampedSpan = Math.min(rawSpan, gridColumns);
      cards.forEach((card) => expect(card.style.gridColumn).toBe(`span ${clampedSpan}`));

      // Either the 3 cards truly sit side by side in one row (their unclamped spans sum to no
      // more than the grid), or each one is individually clamped to the full row width and so
      // deliberately stacks into its own row — anything in between is the "uneven wrap" bug.
      const fitsThreeAcross = rawSpan * 3 <= gridColumns;
      const stacksFullWidth = clampedSpan === gridColumns;
      expect(fitsThreeAcross || stacksFullWidth).toBe(true);
    }
  );
});
