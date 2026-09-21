import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AutomationDimensions } from './AutomationDimensions';
import { useAutomationLeaderboardsView } from '../../views/useAutomationLeaderboardsView';
import { createLeaderboardsView } from '../../views/useAutomationLeaderboardsView.testUtils';

const baseView = createLeaderboardsView({
  dimensions: {
    volume: { score: 487, rank: 3, totalRanked: 84 },
    breadth: { score: 12, rank: 1, totalRanked: 84 },
    consistency: { score: 9, rank: 14, totalRanked: 84 },
  },
  dimensionLeaderboards: {
    volume: [
      { id: 'u-6', name: 'SL', value: 612 },
      { id: 'current-user', name: 'Jamie Ortiz', value: 487, isCurrentUser: true },
    ],
    breadth: [{ id: 'current-user', name: 'Jamie Ortiz', value: 12, isCurrentUser: true }],
    consistency: [{ id: 'u-3', name: 'MC', value: 29 }],
  },
});

vi.mock('../../views/useAutomationLeaderboardsView', () => ({
  useAutomationLeaderboardsView: vi.fn(),
}));

describe('AutomationDimensions', () => {
  beforeEach(() => {
    vi.mocked(useAutomationLeaderboardsView).mockReturnValue(baseView);
  });

  test('should render the three dimensions with the current user standing', () => {
    render(<AutomationDimensions />);

    expect(screen.getByRole('heading', { name: 'Activity levels' })).toBeInTheDocument();
    ['Volume', 'Breadth', 'Consistency'].forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
    expect(screen.getByText('Rank 3 of 84')).toBeInTheDocument();
    expect(screen.getByText('Rank 1 of 84')).toBeInTheDocument();
    expect(screen.getByText('Rank 14 of 84')).toBeInTheDocument();
  });

  test('should show the Volume leaderboard by default', () => {
    render(<AutomationDimensions />);

    expect(screen.getByRole('heading', { name: 'Top 10 — Volume' })).toBeInTheDocument();
    expect(screen.getByText('612')).toBeInTheDocument();
  });

  test('should switch the leaderboard when another dimension is selected', async () => {
    const user = userEvent.setup();
    render(<AutomationDimensions />);

    await user.click(screen.getByRole('button', { name: /Breadth/ }));

    expect(screen.getByRole('heading', { name: 'Top 10 — Breadth' })).toBeInTheDocument();
    expect(screen.queryByText('612')).not.toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  test('should hide the crown icon and rank label for an unranked (rank 0) dimension', () => {
    vi.mocked(useAutomationLeaderboardsView).mockReturnValue({
      ...baseView,
      dimensions: {
        ...baseView.dimensions,
        volume: { score: 0, rank: 0, totalRanked: 0 },
      },
    });

    render(<AutomationDimensions />);

    expect(screen.queryByText(/Rank 0 of/)).not.toBeInTheDocument();
    const volumeRow = screen.getByText('Volume').closest('li');
    expect(
      volumeRow?.querySelector('.automation-dashboard-leaderboard-rank-crown--1')
    ).not.toBeInTheDocument();
  });

  test('should show a placeholder instead of 0 when the score is unknown but the user is ranked', () => {
    vi.mocked(useAutomationLeaderboardsView).mockReturnValue({
      ...baseView,
      dimensions: {
        ...baseView.dimensions,
        consistency: { score: null, rank: 14, totalRanked: 84 },
      },
    });

    render(<AutomationDimensions />);

    const row = screen.getByText('Consistency').closest('li');
    expect(row).toHaveTextContent('—');
    expect(row).toHaveTextContent('Rank 14 of 84');
    expect(row).not.toHaveTextContent(/(^|\D)0(\D|$)/);
  });
});
