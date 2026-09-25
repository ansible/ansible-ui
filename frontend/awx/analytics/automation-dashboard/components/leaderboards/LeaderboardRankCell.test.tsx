import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { LeaderboardRankCell } from './LeaderboardRankCell';

describe('LeaderboardRankCell', () => {
  test.each([1, 2, 3])('should render rank %i as a medal label with a crown', (position) => {
    const { container } = render(<LeaderboardRankCell position={position} />);

    expect(screen.getByText(`#${position}`)).toBeInTheDocument();
    expect(container.querySelector('.pf-v6-c-label')).toBeInTheDocument();
    expect(
      container.querySelector(`.automation-dashboard-leaderboard-rank-crown--${position}`)
    ).toBeInTheDocument();
  });

  test('should render ranks past the podium as plain text without a label or crown', () => {
    const { container } = render(<LeaderboardRankCell position={7} />);

    expect(screen.getByText('#7')).toBeInTheDocument();
    expect(container.querySelector('.pf-v6-c-label')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
