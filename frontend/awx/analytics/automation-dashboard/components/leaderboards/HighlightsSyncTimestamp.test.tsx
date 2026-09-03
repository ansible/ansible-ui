import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { HighlightsSyncTimestamp } from './HighlightsSyncTimestamp';

describe('HighlightsSyncTimestamp', () => {
  test('should render the last-sync line with the formatted timestamp', () => {
    render(<HighlightsSyncTimestamp lastSyncedAt="2026-09-01T14:00:00.000Z" />);

    const line = screen.getByText(/last sync on .+ UTC/);
    expect(line).toHaveTextContent('2026');
  });

  test('should render nothing when there is no sync timestamp yet', () => {
    const { container } = render(<HighlightsSyncTimestamp lastSyncedAt={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  test('should render nothing rather than "Invalid Date" for an unparseable timestamp', () => {
    const { container } = render(<HighlightsSyncTimestamp lastSyncedAt="not-a-date" />);

    expect(container).toBeEmptyDOMElement();
  });
});
