import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HighlightsLeaderboardPanel } from './HighlightsLeaderboardPanel';

function renderPanel() {
  return render(
    <MemoryRouter>
      <HighlightsLeaderboardPanel />
    </MemoryRouter>
  );
}

describe('HighlightsLeaderboardPanel', () => {
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

    expect(screen.getByText('Your org')).toBeInTheDocument();
    expect(screen.getByText("Your org's rank: #1")).toBeInTheDocument();
    expect(screen.getByText('2,840 job runs')).toBeInTheDocument();
  });
});
