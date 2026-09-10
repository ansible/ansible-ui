import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { HighlightsSyncTimestamp } from './HighlightsSyncTimestamp';

describe('HighlightsSyncTimestamp', () => {
  test('should render the last-sync line with the formatted timestamp', () => {
    render(<HighlightsSyncTimestamp lastSyncedAt="2026-09-01T14:00:00.000Z" />);

    const line = screen.getByText(/Updated: .+/);
    expect(line).toHaveTextContent('2026');
  });

  test('should render the 30-day activity description alongside the timestamp', () => {
    render(<HighlightsSyncTimestamp lastSyncedAt="2026-09-01T14:00:00.000Z" />);

    expect(
      screen.getByText('Data shown below is based on the last 30 days of your activity.')
    ).toBeInTheDocument();
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
