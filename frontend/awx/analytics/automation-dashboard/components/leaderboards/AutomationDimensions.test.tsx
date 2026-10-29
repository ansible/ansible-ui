import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AutomationDimensions } from './AutomationDimensions';
import { useAutomationLeaderboardsView } from '../../views/useAutomationLeaderboardsView';
import { createLeaderboardsView } from '../../views/useAutomationLeaderboardsView.testUtils';

const baseView = createLeaderboardsView({
  dimensions: {
    volume: { score: 487, rank: 3, totalRanked: 84 },
    breadth: { score: 12, rank: 1, totalRanked: 84 },
    consistency: { score: 18, rank: 14, totalRanked: 84 },
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

  test('should show the score and rank for a user ranked outside the top 10', () => {
    render(<AutomationDimensions />);

    const row = screen.getByText('Consistency').closest('li') as HTMLElement;
    expect(within(row).getByText('18')).toBeInTheDocument();
    expect(row).toHaveTextContent('Rank 14 of 84');
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

    const row = screen.getByText('Consistency').closest('li') as HTMLElement;
    expect(within(row).getByText('—')).toBeInTheDocument();
    expect(row).toHaveTextContent('Rank 14 of 84');
    expect(row).not.toHaveTextContent(/(^|\D)0(\D|$)/);
  });

  test('should bold only the top 3 names in the leaderboard', () => {
    vi.mocked(useAutomationLeaderboardsView).mockReturnValue({
      ...baseView,
      dimensionLeaderboards: {
        ...baseView.dimensionLeaderboards,
        volume: [
          { id: 'u-1', name: 'SL', value: 612 },
          { id: 'u-2', name: 'AG', value: 540 },
          { id: 'u-3', name: 'MC', value: 500 },
          { id: 'u-4', name: 'RK', value: 450 },
        ],
      },
    });

    render(<AutomationDimensions />);

    expect(screen.getByText('MC')).toHaveStyle({ fontWeight: '700' });
    expect(screen.getByText('RK')).not.toHaveStyle({ fontWeight: '700' });
  });

  test('should render no leaderboard bars when the selected dimension has no rows', () => {
    vi.mocked(useAutomationLeaderboardsView).mockReturnValue({
      ...baseView,
      dimensionLeaderboards: { ...baseView.dimensionLeaderboards, volume: [] },
    });

    render(<AutomationDimensions />);

    expect(screen.getByRole('heading', { name: 'Top 10 — Volume' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
