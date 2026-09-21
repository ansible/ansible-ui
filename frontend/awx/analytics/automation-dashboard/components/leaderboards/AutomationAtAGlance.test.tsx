import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PageDashboardContext } from '@ansible/ansible-ui-framework';
import { AutomationAtAGlance, KPI_CARD_WIDTH } from './AutomationAtAGlance';
import { CARD_WIDTH_COL_SPAN, widthOrFullRow } from '../../common/leaderboardCardWidths';
import type { StreakDay } from '../../views/useAutomationLeaderboardsView';
import { createLeaderboardsView } from '../../views/useAutomationLeaderboardsView.testUtils';

vi.mock('@react-hook/resize-observer', () => ({ default: vi.fn() }));

// The streak strips moved to AutomationStreak; this calendar only satisfies the view type
// here — the strips themselves are covered in AutomationStreak.test.tsx.
const streakCalendar: StreakDay[] = [
  { dateStr: 'Aug 1', state: 'enterpriseAndOrg', enterpriseRuns: 12, orgRuns: 5 },
  { dateStr: 'Aug 2', state: 'enterpriseOnly', enterpriseRuns: 8, orgRuns: 0 },
  { dateStr: 'Aug 3', state: 'none', enterpriseRuns: 0, orgRuns: 0 },
];

const view = createLeaderboardsView({
  atAGlance: {
    jobsRun: 1234,
    activeOrganizations: 56,
    featuredTemplate: { name: 'Infrastructure provisioning', runs: 3558 },
    enterpriseStreakDays: 16,
    orgStreakDays: 8,
  },
  streakCalendar,
});

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

describe('KPI card width', () => {
  test.each([1, 8, 14, 15, 16, 17, 24, 32, 48])(
    'should render the 3 KPI cards at the width widthOrFullRow(gridColumns, KPI_CARD_WIDTH) picks, at %i grid columns',
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
      const expectedWidth = widthOrFullRow(gridColumns, KPI_CARD_WIDTH);
      const rawSpan = CARD_WIDTH_COL_SPAN[expectedWidth];
      const clampedSpan = Math.min(rawSpan, gridColumns);
      cards.forEach((card) => expect(card.style.gridColumn).toBe(`span ${clampedSpan}`));
    }
  );
});
