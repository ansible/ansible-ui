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
});
