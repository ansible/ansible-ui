import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { StreakDayStrip } from './StreakDayStrip';
import type { StreakDay } from '../../views/useAutomationLeaderboardsView';

const days: StreakDay[] = [
  { dateStr: 'Aug 1', state: 'enterpriseAndOrg', enterpriseRuns: 12, orgRuns: 5 },
  { dateStr: 'Aug 2', state: 'none', enterpriseRuns: 0, orgRuns: 0 },
  { dateStr: 'Aug 3', state: 'enterpriseOnly', enterpriseRuns: 8, orgRuns: 0 },
];

function renderStrip(overrides: Partial<React.ComponentProps<typeof StreakDayStrip>> = {}) {
  return render(
    <StreakDayStrip
      title="Enterprise"
      streakDays={3}
      days={days}
      isSuccess={(day) => day.state !== 'none'}
      getRuns={(day) => day.enterpriseRuns}
      {...overrides}
    />
  );
}

describe('StreakDayStrip', () => {
  test('should render the title and the active-streak badge', () => {
    renderStrip({ streakDays: 16 });

    expect(screen.getByRole('heading', { name: 'Enterprise' })).toBeInTheDocument();
    expect(screen.getByText('16-day streak')).toBeInTheDocument();
  });

  test('should show "no active streak" instead of a badge when the streak is zero', () => {
    renderStrip({ streakDays: 0 });

    expect(screen.getByText('No active streak')).toBeInTheDocument();
    expect(screen.queryByText(/-day streak/)).not.toBeInTheDocument();
  });

  test('should render one cell per day, styled by success', () => {
    const { container } = renderStrip();

    expect(container.querySelectorAll('.streak-heat-cell')).toHaveLength(3);
    expect(container.querySelectorAll('.streak-heat-cell--success')).toHaveLength(2);
    expect(container.querySelectorAll('.streak-heat-cell--empty')).toHaveLength(1);
  });

  test('should describe each cell for assistive tech using the run count', () => {
    renderStrip();

    expect(screen.getByLabelText('Aug 1: 12 successful job runs')).toBeInTheDocument();
    expect(screen.getByLabelText('Aug 2: No successful job runs')).toBeInTheDocument();
  });

  test('should expose each cell as a keyboard-reachable control', () => {
    renderStrip();

    const cell = screen.getByRole('button', { name: 'Aug 1: 12 successful job runs' });
    expect(cell.tagName).toBe('BUTTON');
    expect(
      screen.getByRole('button', { name: 'Aug 2: No successful job runs' })
    ).toBeInTheDocument();
  });

  test('should render the legend only when showLegend is set', () => {
    const { rerender } = renderStrip({ showLegend: true });
    expect(screen.getByText('Successful job run')).toBeInTheDocument();
    expect(screen.getByText('No activity')).toBeInTheDocument();

    rerender(
      <StreakDayStrip
        title="Enterprise"
        streakDays={3}
        days={days}
        isSuccess={(day) => day.state !== 'none'}
        getRuns={(day) => day.enterpriseRuns}
      />
    );
    expect(screen.queryByText('No activity')).not.toBeInTheDocument();
  });
});
