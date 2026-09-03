import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AutomationDimensions } from './AutomationDimensions';

describe('AutomationDimensions', () => {
  test('should render the three dimensions with the current user standing', () => {
    render(<AutomationDimensions />);

    expect(screen.getByRole('heading', { name: 'Automation dimensions' })).toBeInTheDocument();
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
});
